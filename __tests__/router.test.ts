import { createApp } from '../src';

declare module '../src' {
  interface TypeOfWebEvents {
    readonly HELLO_EVENTS_TEST: number;
  }
}

describe('router', () => {
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
