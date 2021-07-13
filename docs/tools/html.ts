type Html = string | (string | undefined | null | false)[];

export function toString(c: Html) {
  return typeof c === 'string' ? c : c.filter((x) => !!x).join('');
}

const INDENT = '    ';

export function code(c: Html) {
  const val = toString(c);
  if (val.trim().includes('\n')) {
    return `<pre class="language-ts"><code>${INDENT}${val}</code></pre>`;
  }
  return `<pre class="language-ts"><code>${val.trim()}</code></pre>`;
}

export function anchor(fragment: string) {
  return `<span id="${fragment}"></span>`;
}

export function a(href: string, text?: string) {
  return `<a href="${href}">${getHtmlEscapedText(text || href)}</a>`;
}

export function table(c: Html) {
  return `<table>${toString(c)}</table>`;
}

export function em(c: Html) {
  return `<em>${toString(c)}</em>`;
}

export function strong(c: Html) {
  return `<strong>${toString(c)}</strong>`;
}

export function thead(c: Html) {
  return `<thead>${toString(c)}</thead>`;
}

export function tbody(c: Html) {
  return `<tbody>${toString(c)}</tbody>`;
}

export function th(c: Html) {
  return `<th>${toString(c)}</th>`;
}

export function tr(c: Html) {
  return `<tr>${toString(c)}</tr>`;
}

export function td(c: Html) {
  return `<td>${toString(c)}</td>`;
}

export function p(c: Html) {
  return `<p>${toString(c)}</p>`;
}

export function div(c: Html) {
  return `<div>${toString(c)}</div>`;
}

export function getHtmlEscapedText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '&#124;');
}
