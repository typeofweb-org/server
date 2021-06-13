import type { TypeOfWebRequestMeta, TypeOfWebServerMeta, TypeOfWebEvents } from '..';
import type { Callback, MaybeAsync } from '../utils/types';
import type { HttpMethod } from './httpStatusCodes';
import type { TypeOfWebPlugin } from './plugins';
import type { ParseRouteParams } from './router';
import type { SchemaRecord, TypeOfRecord } from './validation';
import type { SomeSchema, TypeOf } from '@typeofweb/schema';
import type * as Express from 'express';
import type { StoppableServer } from 'stoppable';
import type { URL } from 'url';

export interface AppOptions {
  readonly hostname: 'localhost';
  readonly port: 3000;
  readonly cors: readonly [];
}

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

  readonly _rawReq: Express.Request;
  readonly _rawRes: Express.Response;
}

export interface TypeOfWebServer {
  readonly plugins: TypeOfWebServerMeta;
  readonly events: EventBus;
  readonly address: URL | null;
}

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

export interface TypeOfWebApp {
  plugin(plugin: TypeOfWebPlugin<string>): void;

  route<
    Path extends string,
    ParamsKeys extends ParseRouteParams<Path>,
    Params extends SchemaRecord<ParamsKeys>,
    Query extends SchemaRecord<string>,
    Payload extends SomeSchema<unknown>,
    Response extends SomeSchema<unknown>,
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
      request: TypeOfWebRequest<Path, TypeOfRecord<Params>, TypeOfRecord<Query>, TypeOf<Payload>>,
    ): MaybeAsync<TypeOf<Response>>;
    readonly _rawMiddlewares?: ReadonlyArray<Express.RequestHandler | Express.ErrorRequestHandler>;
  }): void;

  start(): Promise<TypeOfWebServer>;

  stop(): Promise<void>;

  readonly _rawExpressApp?: Express.Application;

  readonly _rawExpressServer?: StoppableServer;

  readonly _rawExpressRouter?: Express.Router;
}

export type TypeOfWebRoute = Parameters<TypeOfWebApp['route']>[0];
