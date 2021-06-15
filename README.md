# @typeofweb/server

```ts
const app = await createApp({
  host: 'localhost',
  port: 3000,
});

app.plugin(dbPlugin);
app.plugin(authPlugin);

app._rawRouter;

app.route({
  path: '/health-check/:count',
  method: 'GET',
  validation: {
    query: {},
    params: {
      count: number(),
    },
    payload: {},
    response: {},
  },
  _rawMiddlewares: [],
  async handler(request) {
    const { query, params, payload, response } = request;
    await request.plugins.db.findOne();

    request.events.emit('health-check', params.count);

    request._rawReq;
    request._rawRes;
  },
});

const server = await app.listen();
```

```ts
// dbPlugin.ts

declare module '@typeofweb/server' {
  interface TypeOfWebServerMeta {
    readonly db: PrismaClient;
  }

  interface TypeOfWebRequestMeta {
    readonly auth: { readonly session: Session };
  }

  interface TypeOfWebServerEvents {
    readonly 'health-check': number;
  }
}

export const dbPlugin = createPlugin('db', async (app) => {
  return {
    server: new Prisma(),
  };
});

export const authPlugin = createPlugin('auth', async (app) => {
  return {
    request(request) {
      const session = await request.plugins.db.sessions.findOne({ id: request.cookies.session });
      return { session };
    },
  };
});
```
