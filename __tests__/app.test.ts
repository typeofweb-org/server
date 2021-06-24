import { createApp } from '../src';

describe('cors', () => {
  it('should enable cors by default', async () => {
    const app = createApp({});
    const result = await app.inject({
      method: 'options',
      path: '/',
    });

    expect(result.headers['access-control-allow-credentials']).toEqual('true');
    expect(result.headers['access-control-allow-methods']).toEqual('GET,HEAD,PUT,PATCH,POST,DELETE');
  });

  it('should accept cors options', async () => {
    const ORIGIN = 'lo';

    const app = createApp({
      cors: {
        credentials: false,
        origin: ORIGIN,
      },
    });
    const result = await app.inject({
      method: 'options',
      path: '/',
    });

    expect(result.headers['access-control-allow-credentials']).not.toEqual('true');
    expect(result.headers['access-control-allow-origin']).toEqual(ORIGIN);
    expect(result.headers['access-control-allow-methods']).toEqual('GET,HEAD,PUT,PATCH,POST,DELETE');
  });

  it('should disable cors', async () => {
    const app = createApp({
      cors: false,
    });
    const result = await app.inject({
      method: 'options',
      path: '/',
    });

    expect(result.headers['access-control-allow-credentials']).toEqual(undefined);
    expect(result.headers['access-control-allow-methods']).toEqual(undefined);
  });

  it('should accept function for origin', async () => {
    const app = createApp({
      cors: {
        credentials: true,
        origin: (requestOrigin) => {
          expect(requestOrigin).toEqual('siema.com');
          return 'lo';
        },
      },
    });
    const result = await app.inject({
      method: 'options',
      path: '/',
      headers: {
        Origin: 'siema.com',
      },
    });

    expect(result.headers['access-control-allow-credentials']).toEqual('true');
    expect(result.headers['access-control-allow-origin']).toEqual('lo');
    expect(result.headers['access-control-allow-methods']).toEqual('GET,HEAD,PUT,PATCH,POST,DELETE');
  });

  it('should handle function for origin which throws', async () => {
    const app = createApp({
      cors: {
        credentials: true,
        origin: (_requestOrigin) => {
          throw new Error('Siema');
        },
      },
    });
    const result = await app.inject({
      method: 'options',
      path: '/',
      headers: {
        Origin: 'siema.com',
      },
    });

    expect(result.statusCode).toEqual(500);
  });
});
