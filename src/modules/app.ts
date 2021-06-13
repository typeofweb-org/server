import { URL } from 'url';

import { createEventBus } from './events';
import { initApp, initServer } from './http';
import { initRouter } from './router';

import type { DeepWritable } from '../utils/types';
import type { TypeOfWebServerMeta } from './augment';
import type { TypeOfWebPluginInternal } from './plugins';
import type { AppOptions, TypeOfWebApp, TypeOfWebServer } from './shared';

export function createApp(options: AppOptions): TypeOfWebApp {
  const server: DeepWritable<TypeOfWebServer> = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- these properties are supposed to be added by the plugins inside `async start()`
    plugins: {} as TypeOfWebServer['plugins'],
    events: createEventBus(),
    get address() {
      return null;
    },
  };

  /* eslint-disable functional/prefer-readonly-type -- ok */
  const routes: Array<Parameters<TypeOfWebApp['route']>[0]> = [];
  /* eslint-disable functional/prefer-readonly-type -- ok */
  const plugins: Array<TypeOfWebPluginInternal<string>> = [];

  function initServerPlugins() {
    return Promise.all(
      plugins.map(async (plugin) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- serverMetadata will have valid type
        const serverMetadata = (await plugin.value?.server?.(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- make server readonly
          server as TypeOfWebServer,
        )) as unknown as TypeOfWebServerMeta[keyof TypeOfWebServerMeta];

        if (serverMetadata) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- if serverMetadata exists then plugin name is keyof TypeOfWebServerMeta
          server.plugins[plugin.name as keyof TypeOfWebServerMeta] = serverMetadata;
        }
      }),
    );
  }

  const app: DeepWritable<TypeOfWebApp> = {
    async plugin(plugin) {
      const pluginDefinition = {
        name: plugin.name,
        value: await plugin.cb(app),
      };
      plugins.push(pluginDefinition);
    },

    route(route) {
      routes.push(route);
    },

    async start() {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- make TypeOfWebServer readonly again
      const readonlyServer = server as TypeOfWebServer;

      await initServerPlugins();

      app._rawExpressApp = initApp();

      app._rawExpressRouter = initRouter({ server: readonlyServer, routes, plugins });
      app._rawExpressApp.use(app._rawExpressRouter);
      app._rawExpressServer = await initServer(app._rawExpressApp, options);

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

      return readonlyServer;
    },

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
