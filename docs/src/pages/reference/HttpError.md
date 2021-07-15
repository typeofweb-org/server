---
releaseTag: Beta
fileDestination: src/utils/errors.ts#L50
title: HttpError (Beta)
---

# HttpError

## Summary

`HttpError` should be used for returning erroneous HTTP responses. `HttpError` can be thrown synchronously or asynchronously inside the handler. It'll be caught and automatically turned into a proper Node.js HTTP response.

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="constructor"><td><h3 aria-hidden="true" tabindex="-1" hidden>(constructor)</h3><pre class="language-ts"><code>(constructor)</code></pre></td><td><pre class="language-ts"><code>(statusCode: <a href="HttpStatusCode.md">HttpStatusCode</a>, message: string, body: unknown)</code></pre></td><td><div><p>Constructs a new instance of the <code>HttpError</code> class  </p></div><div><strong>Beta</strong></div></td></tr><tr id="body"><td><h3 aria-hidden="true" tabindex="-1" hidden>body</h3><pre class="language-ts"><code>body</code></pre></td><td><pre class="language-ts"><code>unknown</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="statuscode"><td><h3 aria-hidden="true" tabindex="-1" hidden>statusCode</h3><pre class="language-ts"><code>statusCode</code></pre></td><td><pre class="language-ts"><code><a href="HttpStatusCode.md">HttpStatusCode</a></code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>

## Examples

### Example 1

```ts
import { HttpError, HttpStatusCode } from '@typeofweb/server';

import { app } from './app';

app.route({
  path: '/teapot/coffe',
  method: 'get',
  validation: {},
  handler() {
    throw new HttpError(HttpStatusCode.ImaTeapot, 'Try using the coffe machine instead!');
  },
});
```
