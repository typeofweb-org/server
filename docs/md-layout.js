const GrayMatter = require('gray-matter');

// makes mdx in next.js suck less by injecting necessary exports so that
// the docs are still readable on github
// (Shamelessly stolen from React Query docs)
// (Which was shamelessly stolen from Expo.io docs)
// @see https://github.com/tannerlinsley/react-query/blob/16b7d290c70639b627d9ada32951d211eac3adc3/docs/src/lib/docs/md-loader.js
// @see https://github.com/expo/expo/blob/303cb7b689603223401c091c6a2e1e01f182d355/docs/common/md-loader.js

module.exports = function addLayoutToMdx(source) {
  const callback = this.async();

  const { content, data } = GrayMatter(source);
  const code =
    `import { Layout } from '/src/components/Layout';
export const meta = ${JSON.stringify(data)};
export default ({ children, ...props }) => (
  <Layout meta={meta} {...props}>{children}</Layout>
);
` + content.replace(/<!-- (.*?) -->/g, '');

  return callback(null, code);
};
