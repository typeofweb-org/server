import { object, validate, ValidationError } from '@typeofweb/schema';
import Express from 'express';

import { HttpError, isStatusError, tryCatch } from '../utils/errors';

import { HttpStatusCode } from './httpStatusCodes';

import type { Json, MaybeAsync } from '../utils/types';
import type { TypeOfWebRequestMeta } from './augment';
import type { HttpMethod } from './httpStatusCodes';
import type { TypeOfWebPluginInternal } from './plugins';
import type { TypeOfWebRequest, TypeOfWebRoute, TypeOfWebServer } from './shared';
import type { SchemaRecord, TypeOfRecord } from './validation';
import type { SomeSchema, TypeOf } from '@typeofweb/schema';

export type ParseRouteParams<Path> = string extends Path
  ? string
  : Path extends `${string}/:${infer Param}/${infer Rest}`
  ? Param | ParseRouteParams<`/${Rest}`>
  : Path extends `${string}:${infer LastParam}`
  ? LastParam
  : never;

export const initRouter = ({
  routes,
  server,
  plugins,
}: {
  readonly routes: readonly TypeOfWebRoute[];
  readonly server: TypeOfWebServer;
  readonly plugins: ReadonlyArray<TypeOfWebPluginInternal<string>>;
}) => {
  const router = Express.Router();

  // @todo sort
  routes.forEach((route) => {
    router[route.method](route.path, finalErrorGuard(routeToExpressHandler({ route, server, plugins })));
  });

  router.use(errorMiddleware(server));
  return router;
};

export const validateRoute = (route: TypeOfWebRoute): boolean => {
  const segments = route.path.split('/');

  const eachRouteSegmentHasAtMostOneParam = segments.every((segment) => (segment.match(/:/g) ?? []).length <= 1);
  if (!eachRouteSegmentHasAtMostOneParam) {
    throw new Error(`RouteValidationError: Each path segment can contain at most one param.`);
  }

  const routeDoesntHaveRegexes = segments.every((segment) => !segment.endsWith(')'));
  if (!routeDoesntHaveRegexes) {
    throw new Error(`RouteValidationError: Don't use regular expressions in routes. Use validators instead.`);
  }

  return true;
};

export const errorMiddleware =
  (server: TypeOfWebServer) =>
  (err: unknown, _req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    server.events.emit(':error', err);
    if (res.headersSent) {
      next(err);
      return;
    }

    if (!err) {
      return res.status(0).end();
    }

    if (err instanceof ValidationError) {
      return res.status(400).json({ name: err.name, message: err.message, body: err.details });
    }

    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({ name: err.name, message: err.message, body: err.body });
    }

    if (isStatusError(err)) {
      return res.status(err.statusCode).json({ name: HttpStatusCode[err.statusCode], body: err });
    }

    // @todo if (DEBUG)
    return res.status(500).json(err);
  };

type AsyncHandler = (
  ...args: Parameters<Express.Handler>
) => Promise<ReturnType<Express.Handler>> | ReturnType<Express.Handler>;

const finalErrorGuard = (h: AsyncHandler): AsyncHandler => {
  return async (req, res, next) => {
    try {
      await h(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export const routeToExpressHandler = <
  Path extends string,
  ParamsKeys extends ParseRouteParams<Path>,
  Params extends SchemaRecord<ParamsKeys>,
  Query extends SchemaRecord<string>,
  Payload extends SomeSchema<Json>,
  Response extends SomeSchema<Json>,
>({
  plugins,
  route,
  server,
}: {
  readonly plugins: ReadonlyArray<TypeOfWebPluginInternal<string>>;
  readonly route: {
    readonly path: Path;
    readonly method: HttpMethod;
    readonly validation: {
      readonly params?: Params;
      readonly query?: Query;
      readonly payload?: Payload;
      readonly response?: Response;
    };
    handler(
      request: TypeOfWebRequest<Path, TypeOfRecord<Params>, TypeOfRecord<Query>, TypeOf<Payload>>,
    ): MaybeAsync<TypeOf<Response>>;
  };
  readonly server: TypeOfWebServer;
}): AsyncHandler => {
  return async (req, res, next) => {
    const params = tryCatch(() =>
      route.validation.params ? validate(object(route.validation.params)())(req.params) : req.params,
    );
    if (params._t === 'left') {
      return next(new HttpError(HttpStatusCode.BadRequest, HttpStatusCode[HttpStatusCode.BadRequest], params.value));
    }

    const query = tryCatch(() =>
      route.validation.query ? validate(object(route.validation.query)())(req.query) : req.query,
    );
    if (query._t === 'left') {
      return next(new HttpError(HttpStatusCode.BadRequest, HttpStatusCode[HttpStatusCode.BadRequest], query.value));
    }

    const payload = tryCatch(() =>
      route.validation.payload ? validate(route.validation.payload)(req.body) : req.body,
    );
    if (payload._t === 'left') {
      return next(new HttpError(HttpStatusCode.BadRequest, HttpStatusCode[HttpStatusCode.BadRequest], payload.value));
    }

    const request: TypeOfWebRequest<Path, TypeOfRecord<Params>, TypeOfRecord<Query>, TypeOf<Payload>> = {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- these types are validated
      params: params.value as TypeOfRecord<Params>,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- these types are validated
      query: query.value as TypeOfRecord<Query>,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- these types are validated
      payload: payload.value as TypeOf<Payload>,

      server,
      plugins: [],
      path: route.path,
      _rawReq: req,
      _rawRes: res,
    };

    await plugins.reduce(async (acc, plugin) => {
      if (typeof plugin?.value?.request !== 'function') {
        return acc;
      }

      await acc;

      // @ts-expect-error
      const requestMetadata = await plugin.value.request(request);
      if (requestMetadata) {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
        request.plugins[plugin.name as keyof TypeOfWebRequestMeta] = requestMetadata;
      }
    }, Promise.resolve());

    server.events.emit(':request', request);

    const originalResult = await route.handler(request);

    const result = tryCatch(() =>
      route.validation.response ? validate(route.validation.response)(originalResult) : originalResult,
    );

    if (result._t === 'left') {
      const err = result.value;
      if (err instanceof ValidationError) {
        // @todo don't send stacktrace on production
        return next(new HttpError(HttpStatusCode.InternalServerError, err.message, err.details));
      }
      return next(
        new HttpError(
          HttpStatusCode.InternalServerError,
          HttpStatusCode[HttpStatusCode.InternalServerError],
          result.value,
        ),
      );
    }

    if (res.headersSent) {
      return;
    }

    server.events.emit(':response', result.value);

    if (result.value === null) {
      res.status(204).end();
      return;
    } else if (result.value === undefined) {
      console.warn(
        'Handler returned `undefined` which usually means you forgot to `await` something. If you want an empty response, return `null` instead.',
      );
      res.status(204).end();
      return;
    } else {
      res.status(200).json(result.value);
      return;
    }
  };
};
