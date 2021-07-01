import { array, number, object, string } from '@typeofweb/schema';
import { createPlugin, HttpError, HttpStatusCode } from '@typeofweb/server';
import { usersServicePlugin } from './usersServicePlugin';
import { userInputSchema, userSchema } from './usersValidators';

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
      response: array(userSchema)(),
    },
    handler(request) {
      return request.server.plugins.usersService.findAllUsers(request.query);
    },
  });

  app.route({
    method: 'post',
    path: '/users',
    validation: {
      payload: userInputSchema,
      response: userSchema,
    },
    async handler(request) {
      const userId = await request.server.plugins.usersService.createUser(request.payload);
      const user = await request.server.plugins.usersService.findUserById(userId);

      if (!user) {
        throw new HttpError(HttpStatusCode.InternalServerError);
      }

      request.server.events.emit('user-created', user);

      return user;
    },
  });

  app.route({
    method: 'get',
    path: '/users/:userId',
    validation: {
      params: {
        userId: number(),
      },
      response: userSchema,
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
