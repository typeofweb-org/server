// @ts-check

const Path = require('path');

const remarkPlugins = [
  require('remark-slug'),
  require('./remark-plugins').remarkParagraphAlerts,
  require('./remark-plugins').fixMarkdownLinks,
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
  require('./remark-plugins').toc,
];

const rehypePlugins = [];

/**
 * @type {Partial<import('next/dist/next-server/server/config-shared').NextConfig>}
 */
const config = {
  pageExtensions: ['tsx', 'ts', 'mdx', 'md'],
  webpack: (config, { dev, isServer, ...options }) => {
    config.module.rules.push({
      test: /.mdx?$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins,
            rehypePlugins,
          },
        },
        Path.join(__dirname, './md-loader'),
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
