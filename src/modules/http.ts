import BodyParser from 'body-parser';
import Express from 'express';
import Stoppable from 'stoppable';

import type { AppOptions } from './shared';

export const initApp = () => {
  const app = Express();

  app.use(BodyParser.json());
  app.disable('x-powered-by');

  return app;
};

export const listenExpressServer = (app: Express.Application, { port, hostname }: AppOptions) => {
  return new Promise<Stoppable.StoppableServer>((resolve, reject) => {
    app.once('error', reject);

    const server = Stoppable(
      app.listen(port, hostname, () => {
        app.off('error', reject);
        resolve(server);
      }),
      1000,
    );

    const stopServer = (_signal: 'SIGTERM' | 'SIGINT') => {
      server.stop();
    };

    process.on('SIGTERM', () => stopServer('SIGTERM'));
    process.on('SIGINT', () => stopServer('SIGINT'));
  });
};
