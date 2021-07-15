---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L270
title: EventBus (Beta)
---

# EventBus

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="emit"><td><h3 aria-hidden="true" tabindex="-1" hidden>emit</h3><pre class="language-ts"><code>emit</code></pre></td><td><pre class="language-ts"><code>&lt;Name extends keyof <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>&gt;(name: Name, ...arg: undefined extends <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>[Name] ? readonly [arg?: <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>[Name]] : readonly [arg: <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>[Name]]) =&gt; void</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="off"><td><h3 aria-hidden="true" tabindex="-1" hidden>off</h3><pre class="language-ts"><code>off</code></pre></td><td><pre class="language-ts"><code>&lt;Name extends keyof <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>&gt;(name: Name, cb: Callback&lt;<a href="TypeOfWebEvents.md">TypeOfWebEvents</a>[Name]&gt;) =&gt; void</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="on"><td><h3 aria-hidden="true" tabindex="-1" hidden>on</h3><pre class="language-ts"><code>on</code></pre></td><td><pre class="language-ts"><code>&lt;Name extends keyof <a href="TypeOfWebEvents.md">TypeOfWebEvents</a>&gt;(name: Name, cb: Callback&lt;<a href="TypeOfWebEvents.md">TypeOfWebEvents</a>[Name]&gt;) =&gt; void</code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>
