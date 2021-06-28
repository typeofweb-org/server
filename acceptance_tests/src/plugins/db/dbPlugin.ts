import { createPlugin } from '@typeofweb/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

declare module '@typeofweb/server' {
  interface TypeOfWebServerMeta {
    readonly db: Database;
  }
}

export const dbPlugin = createPlugin('db', () => {
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
