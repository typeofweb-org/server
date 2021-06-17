import { createApp } from '../src';

declare module '../src' {
  interface TypeOfWebEvents {
    readonly HELLO_EVENTS_TEST: number;
  }
}

describe('router', () => {
  it.only('should set cookies', async () => {
    const app = createApp({ cookies: { secret: 'a'.repeat(32) } }).route({
      path: '/users',
      method: 'get',
      validation: {},
      handler: (_request, t) => {
        t.setCookie('test', 'testowa');
        return null;
      },
    });

    const result = await app.inject({
      method: 'get',
      path: '/users',
    });

    expect(result.headers['set-cookie']).toEqual([`test=j%3A%7B%7D; Path=/; HttpOnly; Secure; SameSite=Lax`]);
  });

  it.only('should read all cookies', async () => {
    const app = createApp({ cookies: { secret: 'a'.repeat(32) } }).route({
      path: '/users',
      method: 'get',
      validation: {},
      handler: (request) => {
        expect(request.cookies['test']).toEqual('testowa');
        expect(request.cookies['notSigned']).toEqual('123');
        return null;
      },
    });

    await app.inject({
      method: 'get',
      path: '/users',
      cookies: ['test=testowa', 'notSigned=123'],
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
