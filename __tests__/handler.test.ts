import { number, object, string } from '@typeofweb/schema';

import { createApp } from '../src';

describe('handler', () => {
  describe('validation', () => {
    it('should error on invalid parameters', async () => {
      const app = createApp({}).route({
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

      const result = await app.inject({
        method: 'get',
        path: '/users/aaa/invoices/bbb',
      });
      expect(result.statusCode).toEqual(400);
      expect(result.body).toMatchInlineSnapshot(`
Object {
  "body": Object {
    "details": Object {
      "errors": Array [
        Object {
          "error": Object {
            "expected": "number",
            "got": "aaa",
          },
          "path": "userId",
        },
      ],
      "expected": "object",
      "got": Object {
        "invoiceId": "bbb",
        "userId": "aaa",
      },
    },
    "name": "ValidationError",
  },
  "message": "BadRequest",
  "name": "HttpError",
}
`);
    });

    it('should error on invalid query', async () => {
      const app = createApp({}).route({
        path: '/users',
        method: 'get',
        validation: {
          query: {
            aaa: string(),
          },
        },
        handler: () => null,
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });
      expect(result.statusCode).toEqual(400);
      expect(result.body).toMatchInlineSnapshot(`
Object {
  "body": Object {
    "details": Object {
      "errors": Array [
        Object {
          "error": Object {
            "expected": "string",
          },
          "path": "aaa",
        },
      ],
      "expected": "object",
      "got": Object {},
    },
    "name": "ValidationError",
  },
  "message": "BadRequest",
  "name": "HttpError",
}
`);
    });

    it('should error on invalid payload', async () => {
      const app = createApp({}).route({
        path: '/users',
        method: 'post',
        validation: {
          payload: object({
            aaa: string(),
          })(),
        },
        handler: () => null,
      });

      const result = await app.inject({
        method: 'post',
        path: '/users',
        payload: { bbb: 123 },
      });
      expect(result.statusCode).toEqual(400);
      expect(result.body).toMatchInlineSnapshot(`
Object {
  "body": Object {
    "details": Object {
      "errors": Array [
        Object {
          "error": Object {
            "expected": "unknownKey",
            "got": 123,
          },
          "path": "bbb",
        },
        Object {
          "error": Object {
            "expected": "string",
          },
          "path": "aaa",
        },
      ],
      "expected": "object",
      "got": Object {
        "bbb": 123,
      },
    },
    "name": "ValidationError",
  },
  "message": "BadRequest",
  "name": "HttpError",
}
`);
    });

    it('should return 500 on invalid response', async () => {
      const app = createApp({}).route({
        path: '/users',
        method: 'get',
        validation: {
          response: number(),
        },
        // @ts-expect-error
        handler: () => null,
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });
      expect(result.statusCode).toEqual(500);
      expect(result.body).toMatchInlineSnapshot(`
Object {
  "body": Object {
    "expected": "number",
    "got": null,
  },
  "message": "Invalid type! Expected number but got null!",
  "name": "HttpError",
}
`);
    });

    it('should parse and validate query, params and payload', async () => {
      const app = createApp({}).route({
        path: '/users/:userId/invoices/:invoiceId',
        method: 'post',
        validation: {
          params: {
            userId: number(),
            invoiceId: string(),
          },
          query: {
            search: string(),
          },
          payload: object({
            id: number(),
          })(),
        },
        handler: (request) => {
          expect(request.params).toEqual({ userId: 123, invoiceId: 'aaaa-bbb' });
          expect(request.query).toEqual({ search: 'kkk' });
          expect(request.payload).toEqual({ id: 123 });
          return null;
        },
      });

      await app.inject({
        method: 'post',
        path: '/users/123/invoices/aaaa-bbb?search=kkk',
        payload: { id: 123 },
      });
      expect.assertions(3);
    });
  });

  describe('happy path', () => {
    it('should return data when all validation passes', async () => {
      const app = createApp({}).route({
        path: '/users/:userId/invoices/:invoiceId',
        method: 'post',
        validation: {
          params: {
            userId: number(),
            invoiceId: string(),
          },
          query: {
            search: string(),
          },
          payload: object({
            id: number(),
          })(),
        },
        handler: () => {
          return { message: 'Wszystko ok!' };
        },
      });

      const result = await app.inject({
        method: 'post',
        path: '/users/123/invoices/aaaa-bbb?search=kkk',
        payload: { id: 123 },
      });
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual({ message: 'Wszystko ok!' });
    });

    it('should return 204 on empty response', async () => {
      const app = createApp({}).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: () => null,
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });
      expect(result.statusCode).toEqual(204);
    });

    it('include request and server ids', async () => {
      const uniqueRequestIds = new Set<string>();
      const uniqueServerIds = new Set<string>();

      const app = createApp({}).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: (request) => {
          expect(request.id).toEqual(expect.any(String));
          expect(request.server.id).toEqual(expect.any(String));

          uniqueRequestIds.add(request.id);
          uniqueServerIds.add(request.server.id);
          return null;
        },
      });

      // eslint-disable-next-line functional/no-loop-statement -- test
      for (let i = 0; i < 100; ++i) {
        await app.inject({
          method: 'get',
          path: '/users',
        });
      }

      // should have unique id per each request
      expect(uniqueRequestIds.size).toEqual(100);

      // should have only a single id for all server
      expect(uniqueServerIds.size).toEqual(1);

      expect.assertions(202);
    });
  });
});
