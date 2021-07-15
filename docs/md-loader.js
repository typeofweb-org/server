// @ts-check
const GrayMatter = require('gray-matter');
const Unified = require('unified');
const RemarkParse = require('remark-parse');
const RemarkRehype = require('remark-rehype');
const RehypeStringify = require('rehype-stringify');
const RehypeRaw = require('rehype-raw');

/**
 * @typedef {{remarkPlugins: import('unified').PluggableList, rehypePlugins: import('unified').PluggableList}} MdLoaderOptions
 */

/**
 * @param {string} source
 * @param {MdLoaderOptions} options
 * @returns {import('vfile').VFile}
 */
function toHtmlString(source, options) {
  const processor = Unified()
    .use(RemarkParse)
    .use(options.remarkPlugins)
    .use(RemarkRehype, { allowDangerousHtml: true })
    .use(RehypeRaw)
    .use(options.rehypePlugins)
    .use(RehypeStringify);

  return processor.processSync(source);
}

/**
 * @type {import('webpack').LoaderDefinitionFunction<MdLoaderOptions>}
 * @this {import('webpack').LoaderContext<MdLoaderOptions>}
 */
module.exports = function loadMarkdownWithHtml(source, sourceMap, additionalData) {
  const callback = this.async();

  const { content, data } = GrayMatter(source);

  const html = toHtmlString(content, this.getOptions()).contents;

  const code = `
import { ReferenceLayout } from '/src/components/Layout';
export const meta = ${JSON.stringify(data)};
const Page = ({ children, ...props }) => (
  <ReferenceLayout meta={meta} {...props}><div dangerouslySetInnerHTML={{__html: ${JSON.stringify(
    html,
  )} }} /></ReferenceLayout>
);
export default Page;
`.trim();

  return callback(null, code);
};
