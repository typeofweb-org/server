---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L123
title: TypeOfWebRequestToolkit (Beta)
---

# TypeOfWebRequestToolkit

## Summary

Request Toolkit is a set of functions used to modify resulting http response.

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="removecookie"><td><h3 aria-hidden="true" tabindex="-1" hidden>removeCookie</h3><pre class="language-ts"><code>removeCookie</code></pre></td><td><pre class="language-ts"><code>(name: string, options: <a href="SetCookieOptions.md">SetCookieOptions</a>) => MaybeAsync&lt;void&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="setcookie"><td><h3 aria-hidden="true" tabindex="-1" hidden>setCookie</h3><pre class="language-ts"><code>setCookie</code></pre></td><td><pre class="language-ts"><code>(name: string, value: string, options: <a href="SetCookieOptions.md">SetCookieOptions</a>) => MaybeAsync&lt;void&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="setheader"><td><h3 aria-hidden="true" tabindex="-1" hidden>setHeader</h3><pre class="language-ts"><code>setHeader</code></pre></td><td><pre class="language-ts"><code>(headerName: string, value: string) => MaybeAsync&lt;void&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="setstatus"><td><h3 aria-hidden="true" tabindex="-1" hidden>setStatus</h3><pre class="language-ts"><code>setStatus</code></pre></td><td><pre class="language-ts"><code>(statusCode: <a href="HttpStatusCode.md">HttpStatusCode</a>) => MaybeAsync&lt;void&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>

## Examples

### Example 1

```ts
app.route({
  path: '/actionable',
  method: 'post',
  validation: {},
  handler: async (req, t) => {
    await t.setStatus(HttpStatusCode.Accepted);
    return null;
  },
});
```
