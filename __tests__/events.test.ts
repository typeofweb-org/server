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

    app.events.on(':server', (server) => expect(server).toBeDefined());
    app.events.on(':request', (request) => {
      expect(request.params).toEqual({ userId: 123, invoiceId: 'bbb' });
      expect(request.query).toEqual({});
      expect(request.payload).toEqual({ test: 'test' });
    });
    app.events.on(':response', (response) => expect(response).toEqual({ message: 'OKEJ' }));

    await app.inject({
      method: 'post',
      path: '/users/123/invoices/bbb',
      payload: { test: 'test' },
    });
    expect.assertions(5);
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
    let mutableI = 0;

    app.events.on('HELLO_EVENTS_TEST', (id) => expect(id).toEqual(payload[mutableI++]?.id));

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
    expect.assertions(3);
  });
});
