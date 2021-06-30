import type { TypeOfWebRequestMeta, TypeOfWebServerMeta, TypeOfWebEvents } from '..';
import type { RequestId, ServerId } from '../utils/uniqueId';
import type { HttpMethod, HttpStatusCode } from './httpStatusCodes';
import type { TypeOfWebPlugin } from './plugins';
import type { ParseRouteParams } from './router';
import type { SchemaRecord, TypeOfRecord, SomeSchema, TypeOf } from '@typeofweb/schema';
import type { Callback, Json, MaybeAsync, Pretty } from '@typeofweb/utils';
import type * as Express from 'express';
import type { StoppableServer } from 'stoppable';
import type * as Superagent from 'superagent';
import type { URL } from 'url';

/**
 * @beta
 */
export interface CorsOriginFunction {
  (requestOrigin: string | undefined): MaybeAsync<CorsOrigin>;
}
export interface CorsOriginNodeCallback {
  (requestOrigin: string | undefined, callback: (err: Error | null, origin?: CorsOrigin) => void): void;
}

/**
 * @beta
 */
// eslint-disable-next-line functional/prefer-readonly-type -- underlying library requirement
export type CorsOrigin = true | string | RegExp | string[] | RegExp[];

/**
 * @beta
 */
export interface AppOptions {
  readonly hostname: string;
  readonly port: number;
  readonly cors:
    | {
        readonly origin: CorsOrigin | CorsOriginFunction;
        readonly credentials: boolean;
      }
    | false;
  readonly cookies: AppOptionsCookies;
  readonly router: {
    readonly strictTrailingSlash: boolean;
  };
  readonly openapi:
    | {
        readonly title: string;
        readonly description: string;
        readonly version: string;
        readonly path?: string;
      }
    | false;
}

/**
 * @beta
 */
export interface AppOptionsCookies extends SetCookieOptions {
  readonly secret: string;
}

/**
 * @beta
 */
export interface TypeOfWebRequestToolkit {
  setCookie(name: string, value: string, options?: SetCookieOptions): MaybeAsync<void>;
  removeCookie(name: string, options?: SetCookieOptions): MaybeAsync<void>;
  setStatus(statusCode: HttpStatusCode): MaybeAsync<void>;
  setHeader(headerName: string, value: string): MaybeAsync<void>;
}

export interface SetCookieOptions {
  readonly maxAge?: number;
  readonly encrypted?: boolean;
  readonly expires?: Date;
  readonly httpOnly?: boolean;
  readonly path?: string;
  readonly domain?: string;
  readonly secure?: boolean;
  readonly sameSite?: boolean | 'lax' | 'strict' | 'none';
}

/**
 * @beta
 */
export interface TypeOfWebRequest<
  Path extends string = string,
  Params extends {} = {},
  Query extends {} = {},
  Payload = unknown,
> {
  readonly server: TypeOfWebServer;
  readonly plugins: TypeOfWebRequestMeta;

  readonly path: Path;
  readonly params: Params;
  readonly query: Query;
  readonly payload: Payload;

  readonly id: RequestId;
  readonly timestamp: ReturnType<typeof performance.now>;

  readonly cookies: Record<string, string>;

  /**
   * @alpha
   */
  readonly _rawReq: Express.Request;

  /**
   * @alpha
   */
  readonly _rawRes: Express.Response;
}

/**
 * @beta
 */
export interface TypeOfWebResponse {
  readonly payload: Json | null;
  readonly request: TypeOfWebRequest;
  readonly statusCode: number;
  readonly _rawRes: Express.Response;
  readonly timestamp: ReturnType<typeof performance.now>;
}

/**
 * @beta
 */
export interface TypeOfWebServer {
  readonly plugins: TypeOfWebServerMeta;
  readonly events: EventBus;
  readonly address: URL | null;
  readonly id: ServerId;
}

/**
 * @beta
 */
export interface EventBus {
  readonly emit: <Name extends keyof TypeOfWebEvents>(
    name: Name,
    ...arg: undefined extends TypeOfWebEvents[Name]
      ? readonly [arg?: TypeOfWebEvents[Name]]
      : readonly [arg: TypeOfWebEvents[Name]]
  ) => void;

  readonly on: <Name extends keyof TypeOfWebEvents>(name: Name, cb: Callback<TypeOfWebEvents[Name]>) => void;

  readonly off: <Name extends keyof TypeOfWebEvents>(name: Name, cb: Callback<TypeOfWebEvents[Name]>) => void;
}

/**
 * @beta
 */
export interface TypeOfWebApp {
  readonly events: EventBus;

  plugin(plugin: TypeOfWebPlugin<string>): MaybeAsync<TypeOfWebApp>;

  route<
    Path extends string,
    ParamsKeys extends ParseRouteParams<Path>,
    Params extends SchemaRecord<ParamsKeys>,
    Query extends SchemaRecord<string>,
    Payload extends SomeSchema<Json>,
    Response extends SomeSchema<Json>,
  >(config: {
    readonly path: Path;
    readonly method: HttpMethod;
    readonly validation: {
      readonly params?: Params;
      readonly query?: Query;
      readonly payload?: Payload;
      readonly response?: Response;
    };

    handler(
      request: TypeOfWebRequest<Path, TypeOfRecord<Params>, TypeOfRecord<Query>, Pretty<TypeOf<Payload>>>,
      toolkit: TypeOfWebRequestToolkit,
    ): MaybeAsync<TypeOf<Response>>;

    /**
     * @alpha
     */
    readonly _rawMiddlewares?: ReadonlyArray<Express.RequestHandler | Express.ErrorRequestHandler>;
  }): TypeOfWebApp;

  inject(injection: {
    readonly method: HttpMethod;
    readonly path: string;
    readonly payload?: string | object | undefined;
    readonly headers?: Record<string, string>;
    readonly cookies?: readonly `${string}=${string}`[];
  }): Promise<Superagent.Response>;

  start(): Promise<TypeOfWebServer>;

  stop(): Promise<void>;

  /**
   * @alpha
   */
  readonly _rawExpressApp: Express.Application;

  /**
   * @alpha
   */
  readonly _rawExpressServer?: StoppableServer;

  /**
   * @alpha
   */
  readonly _rawExpressRouter?: Express.Router;
}

export type TypeOfWebRoute = Parameters<TypeOfWebApp['route']>[0];

export type HandlerArguments = Parameters<TypeOfWebRoute['handler']>;

// prettier-ignore
type Hours = `${0|1}${0|1|2|3|4|5|6|7|8|9}`|`2${0|1|2|3}`;
// type Minutes = `${0|1|2|3|4|5}${0|1|2|3|4|5|6|7|8|9}`;
type Minutes = '00' | '15' | '30' | '45';

type ExpireAt = `${Hours}:${Minutes}`;
export type TypeOfWebCacheConfig =
  | {
      readonly expireIn: number;
      readonly expireAt?: undefined;
    }
  | {
      readonly expireIn?: undefined;
      readonly expireAt: ExpireAt;
    };
