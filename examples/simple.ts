import { number } from '@typeofweb/schema';

import { createApp, createPlugin } from '../dist/index';

declare function findOne(): unknown;
declare function findMany(): unknown;
declare module '../dist/index' {
  interface TypeOfWebServerMeta {
    readonly db: {
      readonly findOne: typeof findOne;
      readonly findMany: typeof findMany;
    };
  }

  interface TypeOfWebEvents {
    readonly 'health-check': number;
  }
}

// plugins
export const dbPlugin = createPlugin('db', () => {
  return {
    server() {
      return { findOne, findMany };
    },
  };
});

const loggerPlugin = createPlugin('logger', (app) => {
  app.events.on(':response', () => console.info(`The server has responded.`));
  app.events.on(':server', () => console.info('Server started!'));
  app.events.on(':request', () => console.info(`Request coming through!`));
});

// app
const app = createApp({});

void app.plugin(loggerPlugin);
void app.plugin(dbPlugin);

void app.route({
  path: '/health-check/:count',
  method: 'get',
  validation: {
    params: {
      count: number(),
    },
    // response: number(),
  },
  handler(_request) {
    // const { query, params } = request;
    // request.server.plugins.db.findMany();
    // request.server.events.emit('health-check', 123);
    return 1;
  },
});

app
  .start()
  .then((server) => {
    console.log(`🙌 Server started at ${server.address?.toString()}`);
  })
  .catch(console.error);
