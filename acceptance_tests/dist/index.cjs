/**
 * @typeofweb/server_acceptance_tests@1.0.0
 * Copyright (c) 2021 Type of Web - Michał Miszczyszyn
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var schema = require('@typeofweb/schema');
var server = require('@typeofweb/server');
var sqlite3 = require('sqlite3');
var sqlite = require('sqlite');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var sqlite3__default = /*#__PURE__*/ _interopDefaultLegacy(sqlite3);

const usersServicePlugin = server.createPlugin('usersService', (app) => {
  return {
    async server(server) {
      await server.plugins.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER
      );`);
      return {
        findUserById(id) {
          return server.plugins.db.get('SELECT * FROM users WHERE id = :id', {
            ':id': id,
          });
        },
        findAllUsers(args) {
          console.log(server.plugins.db);
          if (args) {
            return server.plugins.db.all('SELECT * FROM users LIMIT :limit OFFSET :skip', {
              ':limit': args.limit,
              ':skip': args.skip,
            });
          }
          return server.plugins.db.all('SELECT * FROM users');
        },
        async createUser(data) {
          const res = await server.plugins.db.run('INSERT INTO users VALUES(?,?,?)', undefined, data.name, data.age);
          if (!res.lastID) {
            throw new Error(`Couldn't insert user into the database`);
          }
          return res.lastID;
        },
      };
    },
  };
});

const userInputSchema = schema.object({
  name: schema.string(),
  age: schema.number(),
})();
const userSchema = schema.object({
  id: schema.number(),
  name: schema.string(),
  age: schema.number(),
})();

const usersPlugin = server.createPlugin('users', async (app) => {
  await app.plugin(usersServicePlugin);
  app.route({
    method: 'get',
    path: '/users',
    validation: {
      query: {
        limit: schema.number(),
        skip: schema.number(),
      },
      response: schema.array(userSchema)(),
    },
    handler(request) {
      return request.server.plugins.usersService.findAllUsers(request.query);
    },
  });
  app.route({
    method: 'post',
    path: '/users/',
    validation: {
      payload: userInputSchema,
      response: userSchema,
    },
    async handler(request) {
      const userId = await request.server.plugins.usersService.createUser(request.payload);
      const user = await request.server.plugins.usersService.findUserById(userId);
      if (!user) {
        throw new server.HttpError(server.HttpStatusCode.InternalServerError);
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
        userId: schema.number(),
      },
      response: userSchema,
    },
    async handler(request) {
      const { userId } = request.params;
      const user = await request.server.plugins.usersService.findUserById(userId);
      if (!user) {
        throw new server.HttpError(server.HttpStatusCode.NotFound, `User with id=${userId} not found!`);
      }
      return user;
    },
  });
});

const dbPlugin = server.createPlugin('db', () => {
  return {
    async server() {
      const db = await sqlite.open({
        filename: '/tmp/database.db',
        driver: sqlite3__default['default'].Database,
      });
      return db;
    },
  };
});

const loggerPlugin = server.createPlugin('logger', (app) => {
  const requestsMap = new WeakMap();
  app.events.on(':server', () => console.info('Server started!'));
  app.events.on(':request', (r) => {
    console.info(`Request coming through!`, r.id);
    requestsMap.set(r, r.timestamp);
  });
  app.events.on(':afterResponse', (r) => {
    const requestTimestamp = requestsMap.get(r.request);
    console.info(`The server has responded.`, r.timestamp - (requestTimestamp ?? 0));
  });
});

const getAppWithPlugins = async () => {
  const app = server.createApp({
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
        count: schema.number(),
      },
      response: schema.number(),
    },
    handler(request) {
      const { params } = request;
      return params.count;
    },
  });
  return app;
};

const init = async () => {
  const app = await getAppWithPlugins();
  const server = await app.start();
  console.log(`🙌 Server started at ${server.address?.toString()}`);
};
init().catch(console.error);
