// @ts-check
const GrayMatter = require('gray-matter');
const Unified = require('unified');
const RemarkParse = require('remark-parse');
const Gfm = require('remark-gfm');
const RemarkRehype = require('remark-rehype');
const RehypeStringify = require('rehype-stringify');
const RehypeRaw = require('rehype-raw');

/**
 * @param {string} source
 * @param {import('unified').PluggableList} plugins
 * @returns {import('vfile').VFile}
 */
function toHtmlString(source, plugins) {
  const processor = Unified()
    .use(RemarkParse)
    .use(plugins)
    .use(RemarkRehype, { allowDangerousHtml: true })
    .use(RehypeRaw)
    .use(RehypeStringify);

  return processor.processSync(source);
}

/**
 * @type {import('webpack').LoaderDefinitionFunction<{remarkPlugins: import('unified').PluggableList}>}
 * @this {import('webpack').LoaderContext<{remarkPlugins: import('unified').PluggableList}>}
 */
module.exports = function loadMarkdownWithHtml(source, sourceMap, additionalData) {
  const callback = this.async();

  const { content, data } = GrayMatter(source);

  const html = toHtmlString(content, this.getOptions().remarkPlugins).contents;

  const code = `
import { Layout } from '/src/components/Layout';
export const meta = ${JSON.stringify(data)};
const Page = ({ children, ...props }) => (
  <Layout meta={meta} {...props}><div dangerouslySetInnerHTML={{__html: ${JSON.stringify(html)} }} /></Layout>
);
export default Page;
`.trim();

  return callback(null, code);
};
