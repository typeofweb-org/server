import { array, number, object, string } from '@typeofweb/schema';
import { createPlugin, HttpError, HttpStatusCode } from '@typeofweb/server';
import { usersServicePlugin } from './usersServicePlugin';

export const usersPlugin = createPlugin('users', async (app) => {
  await app.plugin(usersServicePlugin);

  app.route({
    method: 'get',
    path: '/users',
    validation: {
      query: {
        limit: number(),
        skip: number(),
      },
      response: array(
        object({
          id: number(),
          name: string(),
          age: number(),
        })(),
      )(),
    },
    handler(request) {
      return request.server.plugins.usersService.findAllUsers(request.query);
    },
  });

  app.route({
    method: 'post',
    path: '/users/',
    validation: {
      payload: object({
        name: string(),
        age: number(),
      })(),
    },
    async handler(request) {
      const res = await request.server.plugins.usersService.createUser(request.payload);
      console.log(res);

      return null;
    },
  });

  app.route({
    method: 'get',
    path: '/users/:userId',
    validation: {
      params: {
        userId: number(),
      },
      response: object({
        id: number(),
        name: string(),
        age: number(),
      })(),
    },
    async handler(request) {
      const { userId } = request.params;
      const user = await request.server.plugins.usersService.findUserById(userId);

      if (!user) {
        throw new HttpError(HttpStatusCode.NotFound, `User with id=${userId} not found!`);
      }
      return user;
    },
  });
});
