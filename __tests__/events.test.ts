import { jest } from '@jest/globals';
import { number, object, string } from '@typeofweb/schema';

import { createApp } from '../src';
declare module '../src' {
  interface TypeOfWebEvents {
    readonly HELLO_EVENTS_TEST: number;
  }
}

describe('events', () => {
  it('should emit system events server, request and response', async () => {
    const app = createApp({}).route({
      path: '/users/:userId/invoices/:invoiceId',
      method: 'post',
      validation: {
        params: {
          userId: number(),
          invoiceId: string(),
        },
      },
      handler: () => {
        return { message: 'OKEJ' };
      },
    });

    const onServer = jest.fn();
    const onRequest = jest.fn();
    const onAfterResponse = jest.fn();

    app.events.on(':server', onServer);
    app.events.on(':request', onRequest);
    app.events.on(':afterResponse', onAfterResponse);

    await app.inject({
      method: 'post',
      path: '/users/123/invoices/bbb',
      payload: { test: 'test' },
    });

    expect(onServer).toHaveBeenCalledTimes(1);

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { userId: 123, invoiceId: 'bbb' },
        query: {},
        payload: { test: 'test' },
      }),
    );

    expect(onAfterResponse).toHaveBeenCalledTimes(1);
    expect(onAfterResponse).toHaveBeenCalledWith(expect.objectContaining({ payload: { message: 'OKEJ' } }));
  });

  it('should allow emitting custom events', async () => {
    const app = createApp({}).route({
      path: '/users',
      method: 'post',
      validation: {
        payload: object({
          id: number(),
        })(),
      },
      handler: (request) => {
        request.server.events.emit('HELLO_EVENTS_TEST', request.payload.id);
        return null;
      },
    });

    const payload = [{ id: Math.random() }, { id: Math.random() }, { id: Math.random() }];

    // eslint-disable-next-line functional/prefer-readonly-type -- ok
    const onHelloEvent = jest.fn();

    app.events.on('HELLO_EVENTS_TEST', onHelloEvent);

    await app.inject({
      method: 'post',
      path: '/users',
      payload: payload[0],
    });
    await app.inject({
      method: 'post',
      path: '/users',
      payload: payload[1],
    });
    await app.inject({
      method: 'post',
      path: '/users',
      payload: payload[2],
    });

    expect(onHelloEvent).toHaveBeenCalledTimes(3);
    expect(onHelloEvent).toHaveBeenNthCalledWith(1, payload[0]?.id);
    expect(onHelloEvent).toHaveBeenNthCalledWith(2, payload[1]?.id);
    expect(onHelloEvent).toHaveBeenNthCalledWith(3, payload[2]?.id);
  });

  it('should allow removing listeners', async () => {
    const app = createApp({}).route({
      path: '/test',
      method: 'get',
      validation: {},
      handler: () => {
        return null;
      },
    });

    const handler = jest.fn();

    app.events.on(':afterResponse', handler);
    await app.inject({
      method: 'get',
      path: '/test',
    });
    expect(handler).toHaveBeenCalledTimes(1);

    app.events.off(':afterResponse', handler);
    await app.inject({
      method: 'get',
      path: '/test',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
