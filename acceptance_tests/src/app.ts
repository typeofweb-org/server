import { number } from '@typeofweb/schema';
import { createApp } from '@typeofweb/server';
import { usersPlugin } from './modules/users/usersPlugin';
import { dbPlugin } from './plugins/db/dbPlugin';
import { loggerPlugin } from './plugins/logger/loggerPlugin';

export const getAppWithPlugins = async () => {
  const app = createApp({
    openapi: {
      title: 'Example API',
      description: '',
      version: '0.0.1',
      path: '/documentation',
    },
  });

  await app.plugin(loggerPlugin);
  await app.plugin(dbPlugin);
  await app.plugin(usersPlugin);

  app.route({
    path: '/health-check/:count',
    method: 'get',
    validation: {
      params: {
        count: number(),
      },
      response: number(),
    },
    handler(request) {
      const { params } = request;
      return params.count;
    },
  });

  return app;
};
