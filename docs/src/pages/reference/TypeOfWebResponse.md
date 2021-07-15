---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L220
title: TypeOfWebResponse (Beta)
---

# TypeOfWebResponse

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="payload"><td><h3 aria-hidden="true" tabindex="-1" hidden>payload</h3><pre class="language-ts"><code>payload</code></pre></td><td><pre class="language-ts"><code>Json &#124; null</code></pre></td><td><div><p>Response body. It should be always a valid JSON or <code>null</code>. </p></div><div><strong>Beta</strong></div></td></tr><tr id="request"><td><h3 aria-hidden="true" tabindex="-1" hidden>request</h3><pre class="language-ts"><code>request</code></pre></td><td><pre class="language-ts"><code><a href="TypeOfWebRequest.md">TypeOfWebRequest</a></code></pre></td><td><div><p>A reference to the related request. Useful during the <code>:afterResponse</code> event. </p></div><div><strong>Beta</strong></div></td></tr><tr id="statuscode"><td><h3 aria-hidden="true" tabindex="-1" hidden>statusCode</h3><pre class="language-ts"><code>statusCode</code></pre></td><td><pre class="language-ts"><code>number</code></pre></td><td><div><p>HTTP status code. Could be any number between 100 and 599. </p></div><div><strong>Beta</strong></div></td></tr><tr id="timestamp"><td><h3 aria-hidden="true" tabindex="-1" hidden>timestamp</h3><pre class="language-ts"><code>timestamp</code></pre></td><td><pre class="language-ts"><code>ReturnType&lt;typeof performance.now&gt;</code></pre></td><td><div><p>This is NOT a standard Unix timestamp. <code>response.timestamp</code> is a result of calling <code>require('perf_hooks').performance.now()</code> and should only be used for measuring performance.  </p></div><div><strong>Example 1</strong>
 
<pre><code class="language-ts">app.events.on(':afterResponse', (response) => {
  const elapsed = response.timestamp - response.request.timestamp;
  console.info(`The server has responded in:`, elapsed);
});

</code></pre>

 </div><div><strong>Beta</strong></div></td></tr></tbody></table>
