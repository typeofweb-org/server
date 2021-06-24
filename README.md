# @typeofweb/server

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![codecov](https://codecov.io/gh/typeofweb/server/branch/main/graph/badge.svg?token=6DNCIHEEUO)](https://codecov.io/gh/typeofweb/server)
[![npm](https://img.shields.io/npm/v/@typeofweb/server.svg)](https://www.npmjs.com/package/@typeofweb/server)

## Docs

## Sponsors

&lt;your name here>

See [opencollective.com/typeofweb](https://opencollective.com/typeofweb) or [github.com/sponsors/typeofweb](https://github.com/sponsors/typeofweb)! ❤️

<svg class="octicon octicon-heart text-pink" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.565 20.565 0 008 13.393a20.561 20.561 0 003.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.75.75 0 01-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5zM8 14.25l-.345.666-.002-.001-.006-.003-.018-.01a7.643 7.643 0 01-.31-.17 22.075 22.075 0 01-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.08 22.08 0 01-3.744 2.584l-.018.01-.006.003h-.002L8 14.25zm0 0l.345.666a.752.752 0 01-.69 0L8 14.25z"></path></svg>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://typeofweb.com/"><img src="https://avatars0.githubusercontent.com/u/1338731?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michał Miszczyszyn</b></sub></a><br /><a href="https://github.com/typeofweb/server/commits?author=mmiszy" title="Code">💻</a> <a href="#maintenance-mmiszy" title="Maintenance">🚧</a> <a href="#projectManagement-mmiszy" title="Project Management">📆</a> <a href="https://github.com/typeofweb/server/pulls?q=is%3Apr+reviewed-by%3Ammiszy" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Example

```ts
import { createApp } from '@typeofweb/server';

import { dbPlugin } from './dbPlugin';
import { authPlugin } from './authPlugin';

const app = await createApp({
  host: 'localhost',
  port: 3000,
});

app.plugin(dbPlugin);
app.plugin(authPlugin);

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
  async handler(request) {
    if (!request.plugins.auth.session) {
      throw new HttpError(HttpStatusCode.Unauthorized);
    }

    const { params } = request;
    const result = await request.server.plugins.db.user.findOne(params.count);

    request.events.emit('found', result);

    return result;
  },
});

const server = await app.listen();
```

```ts
// dbPlugin.ts

import { createPlugin } from '@typeofweb/server';

declare module '@typeofweb/server' {
  interface TypeOfWebServerMeta {
    readonly db: PrismaClient;
  }

  interface TypeOfWebRequestMeta {
    readonly auth: { readonly session: Session };
  }

  interface TypeOfWebServerEvents {
    readonly found: User;
  }
}

export const dbPlugin = createPlugin('db', async (app) => {
  return {
    server: new Prisma(),
  };
});
```

```ts
// authPlugin.ts

import { createPlugin } from '@typeofweb/server';

export const authPlugin = createPlugin('auth', async (app) => {
  return {
    request(request) {
      const session = await request.plugins.db.session.findOne({ id: request.cookies.session });
      return { session };
    },
  };
});
```
