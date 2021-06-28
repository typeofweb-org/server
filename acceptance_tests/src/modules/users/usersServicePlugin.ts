import { createPlugin } from '@typeofweb/server';

declare module '@typeofweb/server' {
  interface TypeOfWebServerMeta {
    usersService: {
      findUserById: (id: User['id']) => Promise<User | undefined>;
      findAllUsers: (args?: { skip: number; limit: number }) => Promise<User[]>;
      createUser: (data: Omit<User, 'id'>) => Promise<User['id']>;
    };
  }

  interface TypeOfWebEvents {
    'user-created': User;
  }
}

interface User {
  id: number;
  name: string;
  age: number;
}

export const usersServicePlugin = createPlugin('usersService', (app) => {
  return {
    async server(server) {
      await server.plugins.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER
      );`);

      return {
        findUserById(id) {
          return server.plugins.db.get<User>('SELECT * FROM users WHERE id = :id', {
            ':id': id,
          });
        },
        findAllUsers(args) {
          console.log(server.plugins.db);
          if (args) {
            return server.plugins.db.all<User[]>('SELECT * FROM users LIMIT :limit OFFSET :skip', {
              ':limit': args.limit,
              ':skip': args.skip,
            });
          }
          return server.plugins.db.all<User[]>('SELECT * FROM users');
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
