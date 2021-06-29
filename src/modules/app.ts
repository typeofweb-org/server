import { URL } from 'url';

import CacheManager from 'cache-manager';
import CookieParser from 'cookie-parser';
import Cors from 'cors';
import Supertest from 'supertest';

import { deepMerge } from '../utils/merge';
import { promiseOriginFnToNodeCallback } from '../utils/node';
import { generateServerId } from '../utils/uniqueId';

import { createCachedFunction } from './cache';
import { createEventBus } from './events';
import { initApp, listenExpressServer } from './http';
import { getOpenApiForRoutes } from './openapi';
import { initRouter, validateRoute } from './router';

import type { AnyFunction, DeepPartial, DeepWritable, JsonPrimitive, MaybeAsync } from '../utils/types';
import type { TypeOfWebServerMeta } from './augment';
import type { TypeOfWebPluginInternal } from './plugins';
import type { AppOptions, TypeOfWebRoute, TypeOfWebApp, TypeOfWebServer, TypeOfWebCacheConfig } from './shared';

const defaultAppOptions: AppOptions = {
  hostname: 'localhost',
  port: 3000,
  cors: {
    origin: true,
    credentials: true,
  },
  cookies: {
    encrypted: true,
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    secret: '',
  },
  router: {
    strictTrailingSlash: false,
  },
  openapi: false,
};

export function createApp(opts: DeepPartial<AppOptions>): TypeOfWebApp {
  const options = deepMerge(opts, defaultAppOptions);
  const memoryCache = CacheManager.caching({ store: 'memory', ttl: 0 });

  const server: DeepWritable<TypeOfWebServer> = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- these properties are supposed to be added by the plugins inside `async start()`
    plugins: {} as TypeOfWebServer['plugins'],
    events: createEventBus(),
    /* istanbul ignore next */
    get address() {
      /* istanbul ignore next */
      return null;
    },

    id: generateServerId(),
  };

  /* eslint-disable functional/prefer-readonly-type -- ok */
  const routes: Array<TypeOfWebRoute> = [];
  /* eslint-disable functional/prefer-readonly-type -- ok */
  const plugins: Array<TypeOfWebPluginInternal<string>> = [];

  let mutableIsInitialized = false;

  function initServerPlugins() {
    return plugins.reduce(async (acc, plugin) => {
      if (!plugin?.value || typeof plugin?.value.server !== 'function') {
        return acc;
      }

      await acc;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
      const pluginServer = plugin.value.server as unknown as (server: TypeOfWebServer) => MaybeAsync<
        Record<
          string,
          | JsonPrimitive
          | AnyFunction
          | {
              readonly cache: TypeOfWebCacheConfig;
              readonly fn: AnyFunction;
            }
        >
      >;

      const result = await pluginServer(server);
      const serverMetadata = !result
        ? null
        : // skip iterating over instances of custom classes
        result.constructor !== Object
        ? result
        : Object.fromEntries(
            Object.entries(result).map(([key, val]) => {
              if (typeof val === 'object' && val && 'cache' in val) {
                return [key, createCachedFunction({ ...val, cacheInstance: memoryCache })];
              }
              return [key, val];
            }),
          );

      if (serverMetadata) {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- if serverMetadata exists then plugin name is keyof TypeOfWebServerMeta
        server.plugins[plugin.name as keyof TypeOfWebServerMeta] = serverMetadata;
      }
    }, Promise.resolve());
  }

  async function initialize() {
    if (mutableIsInitialized) {
      return;
    }

    if (options.cors) {
      const origin =
        typeof options.cors.origin === 'function'
          ? promiseOriginFnToNodeCallback(options.cors.origin)
          : options.cors.origin;
      app._rawExpressApp.use(
        Cors({
          origin,
          credentials: options.cors.credentials,
        }),
      );
    }

    app._rawExpressApp.use(CookieParser(''));

    await initServerPlugins();

    app._rawExpressRouter = initRouter({ server, appOptions: options, routes, plugins });
    app._rawExpressApp.use(app._rawExpressRouter);

    /* istanbul ignore if */
    if (options.openapi) {
      const SwaggerUiExpress = await import('swagger-ui-express');
      const openapi = await getOpenApiForRoutes(routes, options.openapi);
      const path = options.openapi.path ?? '/documentation';

      app._rawExpressRouter.use(path, SwaggerUiExpress.serve);
      app._rawExpressRouter.get(path, SwaggerUiExpress.setup(openapi));
    }

    mutableIsInitialized = true;
    server.events.emit(':server', server);
  }

  const app: DeepWritable<TypeOfWebApp> = {
    _rawExpressApp: initApp(),
    events: server.events,

    async plugin(plugin) {
      const pluginDefinition = {
        name: plugin.name,
        value: await plugin.cb(app),
      };
      plugins.push(pluginDefinition);
      return app;
    },

    route(route) {
      validateRoute(route);
      routes.push(route);
      return app;
    },

    async inject(injection) {
      await initialize();

      let mutableTest = Supertest(app._rawExpressApp)[injection.method](injection.path);

      if (injection.payload) {
        mutableTest = mutableTest.send(injection.payload);
      }

      if (injection.headers) {
        mutableTest = Object.entries(injection.headers).reduce(
          (acc, [header, value]) => acc.set(header, value),
          mutableTest,
        );
      }

      if (injection.cookies) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- string[]
        mutableTest = mutableTest.set('Cookie', injection.cookies as string[]);
      }

      const result = await mutableTest;
      return result;
    },

    /* istanbul ignore next */
    async start() {
      await initialize();
      app._rawExpressServer = await listenExpressServer(app._rawExpressApp, options);

      Object.defineProperty(server, 'address', {
        get() {
          const address = app._rawExpressServer?.address();
          if (typeof address !== 'object' || !address) {
            return null;
          }

          const host = address.family === 'IPv6' ? `[${address.address}]` : address.address;

          return new URL(`http://${host}:${address.port}`);
        },
      });

      return server;
    },

    /* istanbul ignore next */
    stop() {
      return new Promise((resolve, reject) => {
        if (!app._rawExpressServer) {
          return resolve();
        }
        return app._rawExpressServer.stop((err) => {
          app._rawExpressServer = undefined;
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
    },
  };

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- readonly
  return app as TypeOfWebApp;
}
