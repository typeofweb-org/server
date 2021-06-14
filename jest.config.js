import Defaults from 'jest-config';

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  // preset: 'ts-jest/presets/default-esm',
  testPathIgnorePatterns: ['<rootDir>[/\\\\](node_modules)[/\\\\]'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.ts$'],
  transform: {
    // '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['./jest-setup-after-env.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: [...Defaults.defaults.moduleFileExtensions, 'ts', 'tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

export default config;
