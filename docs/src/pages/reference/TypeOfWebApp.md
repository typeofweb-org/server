---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L329
title: TypeOfWebApp (Beta)
---

# TypeOfWebApp

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="events"><td><h3 aria-hidden="true" tabindex="-1" hidden>events</h3><pre class="language-ts"><code>events</code></pre></td><td><pre class="language-ts"><code><a href="EventBus.md">EventBus</a></code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="inject"><td><h3 aria-hidden="true" tabindex="-1" hidden>inject</h3><pre class="language-ts"><code>inject</code></pre></td><td><pre class="language-ts"><code>    (injection: &#123;
        readonly method: <a href="HttpMethod.md">HttpMethod</a>;
        readonly path: string;
        readonly payload?: string &#124; object &#124; undefined;
        readonly headers?: Record&lt;string, string&gt;;
        readonly cookies?: readonly `$&#123;string&#125;=$&#123;string&#125;`[];
    &#125;) => Promise&lt;Superagent.Response&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="plugin"><td><h3 aria-hidden="true" tabindex="-1" hidden>plugin</h3><pre class="language-ts"><code>plugin</code></pre></td><td><pre class="language-ts"><code>(plugin: <a href="TypeOfWebPlugin.md">TypeOfWebPlugin</a>&lt;string&gt;) => MaybeAsync&lt;<a href="TypeOfWebApp.md">TypeOfWebApp</a>&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="route"><td><h3 aria-hidden="true" tabindex="-1" hidden>route</h3><pre class="language-ts"><code>route</code></pre></td><td><pre class="language-ts"><code>(config: <a href="RouteConfig.md">RouteConfig</a>&lt;Path, ParamsKeys, Params, Query, Payload, Response&gt;) => <a href="TypeOfWebApp.md">TypeOfWebApp</a></code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="start"><td><h3 aria-hidden="true" tabindex="-1" hidden>start</h3><pre class="language-ts"><code>start</code></pre></td><td><pre class="language-ts"><code>() => Promise&lt;<a href="TypeOfWebServer.md">TypeOfWebServer</a>&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="stop"><td><h3 aria-hidden="true" tabindex="-1" hidden>stop</h3><pre class="language-ts"><code>stop</code></pre></td><td><pre class="language-ts"><code>() => Promise&lt;void&gt;</code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>
