import { number } from '@typeofweb/schema';

import { createApp, createPlugin } from '../dist/index.js';

declare function findOne(): unknown;
declare function findMany(): unknown;
declare module '../dist' {
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

const loggerPlugin = createPlugin('logger', () => {
  return {
    server() {
      console.info('Server started!');
    },
    request() {
      console.info(`Request coming through!`);
    },
    response() {
      console.info(`The server has responded.`);
    },
  };
});

// app
const app = createApp({
  hostname: 'localhost',
  port: 3000,
  cors: [],
});

app.plugin(loggerPlugin);
app.plugin(dbPlugin);

app.route({
  path: '/health-check/:count',
  method: 'get',
  validation: {
    params: {
      count: number(),
    },
    response: number(),
  },
  _rawMiddlewares: [],
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
    console.log(`🙌 Server started at ${server.address.toString()}`);
  })
  .catch(console.error);
