// @ts-check

const Path = require('path');

/**
 * @type {import('unified').PluggableList}
 */
const remarkPlugins = [
  require('remark-gfm'),
  require('remark-frontmatter'),
  require('remark-slug'),
  [
    require('remark-autolink-headings'),
    {
      behavior: 'append',
      linkProperties: {
        class: ['anchor'],
        title: 'Direct link to heading',
      },
    },
  ],
  require('remark-emoji'),
  require('remark-images'),
  [require('remark-github'), { repository: 'https://github.com/typeofweb/server' }],
  require('remark-unwrap-images'),
  [require('remark-prism'), { plugins: ['inline-color'] }],
];

const rehypePlugins = [];

/**
 * @type {Partial<import('next/dist/next-server/server/config-shared').NextConfig>}
 */
const config = {
  pageExtensions: ['tsx', 'ts', 'mdx', 'md'],
  webpack: (config, { dev, isServer, ...options }) => {
    config.module.rules.push({
      test: /.md$/,
      use: [options.defaultLoaders.babel, { loader: Path.join(__dirname, './md-loader'), options: { remarkPlugins } }],
    });

    config.module.rules.push({
      test: /.mdx$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins,
            rehypePlugins,
          },
        },
        Path.join(__dirname, './md-layout'),
      ],
    });

    return config;
  },
};

config.redirects = async () => {
  return [
    {
      source: '/:paths(.*).m(dx?)',
      destination: '/:paths',
      permanent: false,
    },
    {
      source: '/reference',
      destination: '/reference/index',
      permanent: false,
    },
  ];
};

config.rewrites = async () => {
  return [
    {
      source: '/reference/index',
      destination: '/reference',
    },
  ];
};

module.exports = config;
