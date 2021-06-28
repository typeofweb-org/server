import { createPlugin, TypeOfWebRequest } from '@typeofweb/server';

export const loggerPlugin = createPlugin('logger', (app) => {
  const requestsMap = new WeakMap<TypeOfWebRequest, number>();

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
