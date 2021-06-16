import { array, number, object, optional, string } from '@typeofweb/schema';
import { expectType } from 'tsd';

import { createApp } from '../src';

const app = createApp({});

void app.route({
  path: '/users/:userId/invoices/:invoiceId',
  method: 'get',
  validation: {
    // @ts-expect-error Missing userId and invoiceId
    params: {},
  },
  handler: () => null,
});

void app.route({
  path: '/users/:userId/invoices/:invoiceId',
  method: 'get',
  validation: {
    // @ts-expect-error Missing invoiceId
    params: {
      userId: number(),
    },
  },
  handler: () => null,
});

void app.route({
  path: '/users/:userId/invoices/:invoiceId',
  method: 'get',
  validation: {
    params: {
      userId: number(),
      invoiceId: string(),
    },
  },
  handler: () => null,
});

void app.route({
  path: '/dsa',
  method: 'get',
  validation: {
    response: number(),
  },
  // @ts-expect-error number
  handler: () => null,
});

void app.route({
  path: '/users/:userId/invoices/:invoiceId',
  method: 'post',
  validation: {
    params: {
      userId: number(),
      invoiceId: string(),
    },
    query: {
      search: optional(string()),
    },
    payload: object({ id: optional(number()) })(),
    response: array(number())(),
  },
  handler(request) {
    expectType<number>(request.params.userId);
    expectType<string>(request.params.invoiceId);
    expectType<{ readonly search: string | undefined }>(request.query);
    expectType<{ readonly id?: number }>(request.payload);

    return [1, 2, 3];
  },
});
