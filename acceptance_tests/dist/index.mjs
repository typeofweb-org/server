/**
 * @typeofweb/server_acceptance_tests@1.0.0
 * Copyright (c) 2021 Type of Web - Michał Miszczyszyn
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { number, array, object, string } from '@typeofweb/schema';
import { createPlugin, HttpError, HttpStatusCode, createApp } from '@typeofweb/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const usersServicePlugin = createPlugin('usersService', (app) => {
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
        createUser(data) {
          return server.plugins.db.run('INSERT INTO users VALUES(?,?,?)', undefined, data.name, data.age);
        },
      };
    },
  };
});

const usersPlugin = createPlugin('users', async (app) => {
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

const dbPlugin = createPlugin('db', () => {
  return {
    async server() {
      const db = await open({
        filename: '/tmp/database.db',
        driver: sqlite3.Database,
      });
      return db;
    },
  };
});

const loggerPlugin = createPlugin('logger', (app) => {
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

const init = async () => {
  const app = await getAppWithPlugins();
  const server = await app.start();
  console.log(`🙌 Server started at ${server.address?.toString()}`);
};
init().catch(console.error);
