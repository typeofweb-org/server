---
releaseTag: Beta
fileDestination: src/modules/shared.ts#L286
title: RouteConfig (Beta)
---

# RouteConfig

## Signatures

<table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr id="handler"><td><h3 aria-hidden="true" tabindex="-1" hidden>handler</h3><pre class="language-ts"><code>handler</code></pre></td><td><pre class="language-ts"><code>(request: <a href="TypeOfWebRequest.md">TypeOfWebRequest</a>&lt;Path, TypeOfRecord&lt;Params&gt;, TypeOfRecord&lt;Query&gt;, Pretty&lt;TypeOf&lt;Payload&gt;&gt;&gt;, toolkit: <a href="TypeOfWebRequestToolkit.md">TypeOfWebRequestToolkit</a>) => MaybeAsync&lt;TypeOf&lt;Response&gt;&gt;</code></pre></td><td><div><p>Handler should be a sync or async function and must return a value or throw an error.  </p>
<p>- Any value returned for the handler will be used as the response body. HTTP status code 200 is used by default.  </p>
<p>- Return <code>null</code> for an empty response and 204 HTTP status code.  </p>
<p>- Throwing an object compatible with the <a href="StatusError.md" title=""><code>StatusError</code></a> interface (an instance of <a href="HttpError.md" title=""><code>HttpError</code></a> class in particular) will result in returning an HTTP error with the given status code.  </p>
<p>- Throwing any other value will result in a generic 500 error being returned.  </p>
<p>^^ Returning <code>undefined</code> is also allowed but not recommended and will issue a runtime warning. </p></div><div><strong>Beta</strong></div></td></tr><tr id="method"><td><h3 aria-hidden="true" tabindex="-1" hidden>method</h3><pre class="language-ts"><code>method</code></pre></td><td><pre class="language-ts"><code><a href="HttpMethod.md">HttpMethod</a></code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="path"><td><h3 aria-hidden="true" tabindex="-1" hidden>path</h3><pre class="language-ts"><code>path</code></pre></td><td><pre class="language-ts"><code>Path</code></pre></td><td><div><strong>Beta</strong></div></td></tr><tr id="validation"><td><h3 aria-hidden="true" tabindex="-1" hidden>validation</h3><pre class="language-ts"><code>validation</code></pre></td><td><pre class="language-ts"><code>    &#123;
        readonly params?: Params;
        readonly query?: Query;
        readonly payload?: Payload;
        readonly response?: Response;
    &#125;</code></pre></td><td><div><strong>Beta</strong></div></td></tr></tbody></table>
