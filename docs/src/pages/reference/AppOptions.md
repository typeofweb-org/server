---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L41
title: AppOptions (Beta)
---

# AppOptions

## Summary

Options you can provide when creating your app.

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="cookies"><td><h3 aria-hidden="true" tabindex="-1" hidden>cookies</h3><pre class="language-ts"><code>cookies</code></pre></td><td><pre class="language-ts"><code><a href="AppOptionsCookies.md">AppOptionsCookies</a></code></pre></td><td><div><p>Mind that cookies cannot be encrypted unless you provide a random 32 characters value as <code>secret</code>.  </p></div><div><strong>Beta</strong></div><div><strong>default: </strong>
 
<pre><code class="language-ts">{
  encrypted: true,
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
}

</code></pre>

 </div></td></tr><tr id="cors"><td><h3 aria-hidden="true" tabindex="-1" hidden>cors</h3><pre class="language-ts"><code>cors</code></pre></td><td><pre class="language-ts"><code>    &#123;
        readonly origin: <a href="CorsOrigin.md">CorsOrigin</a> &#124; <a href="CorsOriginFunction.md">CorsOriginFunction</a>;
        readonly credentials: boolean;
    &#125; &#124; false</code></pre></td><td><div><p>CORS is enabled by default for all origins. Set to <code>false</code> to disable it completely.  </p></div><div><strong>Beta</strong></div><div><strong>default: </strong>
<code>{ origin: true, credentials: true }</code></div></td></tr><tr id="hostname"><td><h3 aria-hidden="true" tabindex="-1" hidden>hostname</h3><pre class="language-ts"><code>hostname</code></pre></td><td><pre class="language-ts"><code>string</code></pre></td><td><div><strong>Beta</strong></div><div><strong>default: </strong>
<code>"localhost"</code></div></td></tr><tr id="openapi"><td><h3 aria-hidden="true" tabindex="-1" hidden>openapi</h3><pre class="language-ts"><code>openapi</code></pre></td><td><pre class="language-ts"><code>    &#123;
        readonly title: string;
        readonly description: string;
        readonly version: string;
        readonly path?: string;
    &#125; &#124; false</code></pre></td><td><div><p>Whether automatic generation of Swagger (OpenAPI) definitions should be enabled. It also includes a UI for testing requests.  </p></div><div><strong>Beta</strong></div><div><strong>default: </strong>
<code>false</code></div></td></tr><tr id="port"><td><h3 aria-hidden="true" tabindex="-1" hidden>port</h3><pre class="language-ts"><code>port</code></pre></td><td><pre class="language-ts"><code>number</code></pre></td><td><div><strong>Beta</strong></div><div><strong>default: </strong>
<code>3000</code></div></td></tr><tr id="router"><td><h3 aria-hidden="true" tabindex="-1" hidden>router</h3><pre class="language-ts"><code>router</code></pre></td><td><pre class="language-ts"><code>    &#123;
        readonly strictTrailingSlash: boolean;
    &#125;</code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>
