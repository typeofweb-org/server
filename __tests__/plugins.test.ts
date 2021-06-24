import { performance } from 'perf_hooks';

import { jest } from '@jest/globals';
import { number } from '@typeofweb/schema';

import { createApp, createPlugin } from '../src';
import { ms } from '../src/utils/ms';
import { wait } from '../src/utils/utils';

declare module '../src' {
  interface TypeOfWebServerMeta {
    readonly myPlugin: {
      readonly someValue: number;
      getUserById(id: string): Promise<readonly number[]>;
    };
  }
}

describe('plugins', () => {
  it('should return function when cache is used', async () => {
    const plugin = createPlugin('myPlugin', (_app) => {
      return {
        server(_server) {
          return {
            someValue: 42,
            getUserById: {
              cache: {
                expireIn: ms('1 ms'),
              },
              fn: (id) => Promise.resolve(id.split('').map(Number)),
            },
          };
        },
      };
    });
    const app = createApp({}).route({
      path: '/cache',
      method: 'get',
      validation: {},
      handler: (request, _t) => {
        return request.server.plugins.myPlugin.getUserById('123');
      },
    });
    await app.plugin(plugin);

    const result = await app.inject({
      method: 'get',
      path: '/cache',
    });
    expect(result.body).toEqual([1, 2, 3]);
  });

  it('should call the function only once when in cache', async () => {
    const fn = jest.fn((id: string) => Promise.resolve(id.split('').map(Number)));

    const plugin = createPlugin('myPlugin', (_app) => {
      return {
        server(_server) {
          return {
            someValue: 42,
            getUserById: {
              cache: {
                expireAt: '00:00',
              },
              fn,
            },
          };
        },
      };
    });

    const app = createApp({}).route({
      path: '/cache',
      method: 'get',
      validation: {},
      handler: (request, _t) => {
        return request.server.plugins.myPlugin.getUserById('123');
      },
    });
    await app.plugin(plugin);

    await app.inject({
      method: 'get',
      path: '/cache',
    });
    const result = await app.inject({
      method: 'get',
      path: '/cache',
    });
    expect(result.body).toEqual([1, 2, 3]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the function multiple times when cache expires', async () => {
    const fn = jest.fn((id: string) => Promise.resolve(id.split('').map(Number)));

    const plugin = createPlugin('myPlugin', (_app) => {
      return {
        server(_server) {
          return {
            someValue: 42,
            getUserById: {
              cache: {
                expireIn: ms('10 ms'),
              },
              fn,
            },
          };
        },
      };
    });

    const app = createApp({}).route({
      path: '/cache',
      method: 'get',
      validation: {},
      handler: (request, _t) => {
        return request.server.plugins.myPlugin.getUserById('123');
      },
    });
    await app.plugin(plugin);

    await app.inject({
      method: 'get',
      path: '/cache',
    });
    await wait(100);
    await app.inject({
      method: 'get',
      path: '/cache',
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should differentiate functions by parameters', async () => {
    const fn = jest.fn((id: string) => Promise.resolve(id.split('').map(Number)));

    const plugin = createPlugin('myPlugin', (_app) => {
      return {
        server(_server) {
          return {
            someValue: 42,
            getUserById: {
              cache: {
                expireIn: ms('1 second'),
              },
              fn,
            },
          };
        },
      };
    });

    const app = createApp({}).route({
      path: '/cache/:seed',
      method: 'get',
      validation: {
        params: {
          seed: number(),
        },
      },
      handler: (request, _t) => {
        return request.server.plugins.myPlugin.getUserById(request.params.seed.toString());
      },
    });
    await app.plugin(plugin);

    const result1 = await app.inject({
      method: 'get',
      path: '/cache/123',
    });
    expect(result1.body).toEqual([1, 2, 3]);
    expect(fn).toHaveBeenCalledTimes(1);

    const result2 = await app.inject({
      method: 'get',
      path: '/cache/444',
    });
    expect(result2.body).toEqual([4, 4, 4]);
    expect(fn).toHaveBeenCalledTimes(2);

    const result3 = await app.inject({
      method: 'get',
      path: '/cache/123',
    });
    expect(result3.body).toEqual([1, 2, 3]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the function only once even when multiple requests are in parallel', async () => {
    const FUNCTION_STALLING = ms('1 second');

    const fn = jest.fn(async (id: string) => {
      await wait(FUNCTION_STALLING);
      return id.split('').map(Number);
    });

    const plugin = createPlugin('myPlugin', (_app) => {
      return {
        server(_server) {
          return {
            someValue: 42,
            getUserById: {
              cache: {
                expireIn: ms('1 minute'),
              },
              fn,
            },
          };
        },
      };
    });

    const app = createApp({}).route({
      path: '/cache',
      method: 'get',
      validation: {},
      handler: (request, _t) => {
        return request.server.plugins.myPlugin.getUserById('123');
      },
    });
    await app.plugin(plugin);

    const before = performance.now();
    await Promise.all(
      Array.from({ length: 100 }).map(() =>
        app.inject({
          method: 'get',
          path: '/cache',
        }),
      ),
    );
    const after = performance.now();
    expect(after - before).toBeLessThan(2 * FUNCTION_STALLING);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
