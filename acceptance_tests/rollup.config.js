// @ts-check
import BuiltinModules from 'builtin-modules';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import prettier from 'rollup-plugin-prettier';
import license from 'rollup-plugin-license';
import json from '@rollup/plugin-json';

import pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);

/**
 * @type {import('rollup').RollupOptions[]}
 */
const rollupConfig = [
  {
    input: 'src/index.ts',
    output: [
      {
        name: '@typeofweb/server',
        format: 'es',
        dir: './dist',
        entryFileNames: 'index.mjs',
      },
      {
        name: '@typeofweb/server',
        format: 'cjs',
        dir: './dist',
        entryFileNames: 'index.cjs',
      },
    ],
    plugins: [
      json(),
      commonjs({
        include: 'node_modules/**',
      }),
      typescript({
        tsconfig: 'tsconfig.json',
        rootDir: 'src/',
        include: ['src/**/*.ts'],
      }),
      license({
        banner: `
<%= pkg.name %>@<%= pkg.version %>
Copyright (c) <%= moment().format('YYYY') %> Type of Web - Michał Miszczyszyn

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
`.trim(),
      }),
      prettier({
        parser: 'typescript',
      }),
    ],
    external: [...dependencies, ...BuiltinModules],
  },
];
// eslint-disable-next-line import/no-default-export
export default rollupConfig;
