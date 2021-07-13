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
 * Origin which is accepted in CORS.
 *
 * - `true` means all origins are allowed (`*`)
 *
 * - string or an array os strings means only given origins are allowed
 *
 * - regular expression or an array of regular expressions means any matching origins are allowed
 *
 * @beta
 */
// eslint-disable-next-line functional/prefer-readonly-type -- underlying library requirement
export type CorsOrigin = true | string | RegExp | string[] | RegExp[];

/**
 * Options you can provide when creating your app.
 * @beta
 */
export interface AppOptions {
  /**
   * @defaultValue `"localhost"`
   */
  readonly hostname: string;
  /**
   * @defaultValue `3000`
   */
  readonly port: number;
  /**
   * CORS is enabled by default for all origins. Set to `false` to disable it completely.
   *
   * @defaultValue `{ origin: true, credentials: true }`
   */
  readonly cors:
    | {
        readonly origin: CorsOrigin | CorsOriginFunction;
        readonly credentials: boolean;
      }
    | false;
  /**
   * Mind that cookies cannot be encrypted unless you provide a random 32 characters value as `secret`.
   *
   * @defaultValue
   * ```ts
   * {
   *   encrypted: true,
   *   secure: true,
   *   httpOnly: true,
   *   sameSite: 'lax',
   * }
   * ```
   */
  readonly cookies: AppOptionsCookies;
  readonly router: {
    /**
     * Whether routes should be matched disregarding trailing slashes.
     *
     * @defaultValue `false`
     */
    readonly strictTrailingSlash: boolean;
  };
  /**
   * Whether automatic generation of Swagger (OpenAPI) definitions should be enabled. It also includes a UI for testing requests.
   *
   * @defaultValue `false`
   */
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
 * Request Toolkit is a set of functions used to modify resulting http response.
 *
 * @example
 * ```ts
 * app.route({
 *   path: '/actionable',
 *   method: 'post',
 *   validation: {},
 *   handler: async (req, t) => {
 *     await t.setStatus(HttpStatusCode.Accepted);
 *     return null;
 *   },
 * });
 * ```
 *
 * @beta
 */
export interface TypeOfWebRequestToolkit {
  setCookie(name: string, value: string, options?: SetCookieOptions): MaybeAsync<void>;
  removeCookie(name: string, options?: SetCookieOptions): MaybeAsync<void>;
  setStatus(statusCode: HttpStatusCode): MaybeAsync<void>;
  setHeader(headerName: string, value: string): MaybeAsync<void>;
}

/**
 * @beta
 */
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
  /**
   * A reference to the server instance. Useful for accessing `server.plugins` or `server.events`.
   *
   * @see {@link https://example.com/docs/@todo}
   */
  readonly server: TypeOfWebServer;
  readonly plugins: TypeOfWebRequestMeta;

  readonly path: Path;

  /**
   * Parameters from the URL.
   */
  readonly params: Params;

  /**
   * An object which a result of parsing and validating the query string.
   */
  readonly query: Query;

  /**
   * Payload is always a valid JSON or `null`.
   * Only present for POST, PUT, and PATCH requests.
   */
  readonly payload: Payload;

  /**
   * `RequestId` is a unique number consisting of:
   *
   * - a 4-byte timestamp when the request was initiated in seconds
   *
   * - a 3-byte incrementing counter, initialized to a random value when the process started
   *
   * Use {@link @typeofweb/server#parseRequestId | `parseRequestId`} to retrieve the timestamp.
   */
  readonly id: RequestId;

  /**
   * This is NOT a standard Unix timestamp. `request.timestamp` is a result of calling `require('perf_hooks').performance.now()` and should only be used for measuring performance.
   *
   * If you're looking for a Unix timestamp see {@link TypeOfWebRequest.id} and {@link @typeofweb/server#parseRequestId}.
   */
  readonly timestamp: ReturnType<typeof performance.now>;

  /**
   * Record of cookies in the request. Encrypted cookies are automatically validated, deciphered, and included in this object.
   */
  readonly cookies: Record<string, string>;

  /**
   * Raw Express Request object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
   * @alpha
   */
  readonly _rawReq: Express.Request;

  /**
   * Raw Express Response object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
   * @alpha
   */
  readonly _rawRes: Express.Response;
}

/**
 * @beta
 */
export interface TypeOfWebResponse {
  /**
   * Response body. It should be always a valid JSON or `null`.
   */
  readonly payload: Json | null;

  /**
   * A reference to the related request. Useful during the `:afterResponse` event.
   */
  readonly request: TypeOfWebRequest;

  /**
   * HTTP status code. Could be any number between 100 and 599.
   */
  readonly statusCode: number;

  /**
   * Raw Express Response object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
   * @alpha
   */
  readonly _rawRes: Express.Response;

  /**
   * This is NOT a standard Unix timestamp. `response.timestamp` is a result of calling `require('perf_hooks').performance.now()` and should only be used for measuring performance.
   *
   * @example
   * ```ts
   * app.events.on(':afterResponse', (response) => {
   *   const elapsed = response.timestamp - response.request.timestamp;
   *   console.info(`The server has responded in:`, elapsed);
   * });
   * ```
   */
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
export interface RouteConfig<
  Path extends string,
  ParamsKeys extends ParseRouteParams<Path>,
  Params extends SchemaRecord<ParamsKeys>,
  Query extends SchemaRecord<string>,
  Payload extends SomeSchema<Json>,
  Response extends SomeSchema<Json>,
> {
  readonly path: Path;
  readonly method: HttpMethod;
  readonly validation: {
    readonly params?: Params;
    readonly query?: Query;
    readonly payload?: Payload;
    readonly response?: Response;
  };
  /**
   * Handler should be a sync or async function and must return a value or throw an error.
   *
   * - Any value returned for the handler will be used as the response body. HTTP status code 200 is used by default.
   *
   * - Return `null` for an empty response and 204 HTTP status code.
   *
   * - Throwing an object compatible with the {@link StatusError} interface (an instance of {@link HttpError} class in particular) will result in returning an HTTP error with the given status code.
   *
   * - Throwing any other value will result in a generic 500 error being returned.
   *
   * ^^ Returning `undefined` is also allowed but not recommended and will issue a runtime warning.
   *
   */
  handler(
    request: TypeOfWebRequest<Path, TypeOfRecord<Params>, TypeOfRecord<Query>, Pretty<TypeOf<Payload>>>,
    toolkit: TypeOfWebRequestToolkit,
  ): MaybeAsync<TypeOf<Response>>;
  /**
   * @alpha
   */
  readonly _rawMiddlewares?: ReadonlyArray<Express.RequestHandler | Express.ErrorRequestHandler>;
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
  >(
    config: RouteConfig<Path, ParamsKeys, Params, Query, Payload, Response>,
  ): TypeOfWebApp;

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
   * Raw Express App object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
   * @alpha
   */
  readonly _rawExpressApp: Express.Application;

  /**
   * Raw Express Server object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
   * @alpha
   */
  readonly _rawExpressServer?: StoppableServer;

  /**
   * Raw Express Router object. Use this sparingly as an escape hatch when you face framework's limitations.
   *
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
