import Crypto from 'crypto';

import { createApp, HttpStatusCode } from '../src';
import { unseal } from '../src/utils/encryptCookies';

declare module '../src' {
  interface TypeOfWebEvents {
    readonly HELLO_EVENTS_TEST: number;
  }
}

describe('router', () => {
  describe('cookies', () => {
    it('should set cookies', async () => {
      const app = createApp({ cookies: { secret: 'a'.repeat(32) } }).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: async (_request, t) => {
          await t.setCookie('test', 'testowa', { encrypted: false });
          return null;
        },
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });

      expect(result.headers['set-cookie']).toEqual([`test=testowa; Path=/; HttpOnly; Secure; SameSite=Lax`]);
    });

    it('should set encrypted cookies', async () => {
      const secret = Crypto.randomBytes(22).toString('base64');
      const app = createApp({ cookies: { secret } }).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: async (_request, t) => {
          await t.setCookie('test', 'testowa', { encrypted: true });
          return null;
        },
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });

      expect(result.headers['set-cookie']).toHaveLength(1);
      const [key, val] = (result.headers['set-cookie'] as readonly [string])[0].split(';')[0]!.split('=');
      expect(key).toEqual('test');
      expect(await unseal({ sealed: val!, secret })).toEqual('testowa');
    });

    it('should read all cookies', async () => {
      const app = createApp({ cookies: { secret: 'a'.repeat(32) } }).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: (request) => {
          expect(request.cookies['test']).toEqual('testowa');
          expect(request.cookies['secret']).toEqual('testowa');
          return null;
        },
      });

      await app.inject({
        method: 'get',
        path: '/users',
        cookies: [
          'test=testowa',
          'secret=Fe26.2**n0Jf_bWyQEP8IGbXE2USt82PE9W_dGIvOSlLTeKvwnA*a_fJJWNvbhjvvy0yBg2APw*PzP5xlZ63c6EImBsgDaZ7A**LF1tHWLrtR1pckVC9moT-V2b8LVmE_NYWfsgYqYhZwk*i40hiIKMSNNpwQUmd2HalR9KEvODTfDRPLah2H_q2JqdPg3ecHW6PvnJTC2YAHGUiwvIERWqE5LvaSjCyULvbQ',
        ],
      });

      expect.assertions(2);
    });

    it('should not accept multiple params in path segment', () => {
      const app = createApp({});

      return expect(() =>
        app.route({
          path: '/currencies/:from-:to',
          method: 'get',
          validation: {
            params: {} as any,
          },

          handler: () => {
            return { message: 'OKEJ' };
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`"RouteValidationError: Each path segment can contain at most one param."`);
    });

    it('should not accept regexes', () => {
      const app = createApp({});

      return expect(() =>
        app.route({
          path: '/currencies/:from(\\d+)',
          method: 'get',
          validation: {
            params: {} as any,
          },

          handler: () => {
            return { message: 'OKEJ' };
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `"RouteValidationError: Don't use regular expressions in routes. Use validators instead."`,
      );
    });
  });

  describe('status code', () => {
    it('should allow overriding status codes', async () => {
      const app = createApp({}).route({
        path: '/users',
        method: 'get',
        validation: {},
        handler: async (req, t) => {
          await t.setStatus(HttpStatusCode.Accepted);
          return null;
        },
      });

      const result = await app.inject({
        method: 'get',
        path: '/users',
      });
      expect(result.statusCode).toEqual(202);
    });
  });
});
