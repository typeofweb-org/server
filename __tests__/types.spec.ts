import Path, { join } from 'path';
import Url from 'url';

import Globby from 'globby';
import TsdModule from 'tsd';

import type { Diagnostic } from 'tsd/dist/lib/interfaces';

// @ts-expect-error @todo
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
const tsd = (TsdModule as { readonly default: typeof TsdModule }).default;

const assertTsd = (diagnostics: readonly Diagnostic[]) => {
  if (diagnostics.length > 0) {
    const errorMessage = diagnostics.map((test) => {
      return (
        [test.fileName, test.line, test.column].filter((x) => !!x).join(':') + ` - ${test.severity} - ${test.message}`
      );
    });
    throw new Error('\n' + errorMessage.join('\n') + '\n');
  }
};

describe('@typeofweb/schema', () => {
  const typesTests = Globby.sync(['./__tests__/*.test-d.ts']);
  it.concurrent.each(
    typesTests.map((path) => ({ path, name: path.replace('./__tests__/', '').replace('.test-d.ts', '') })),
  )('tsd $name', async (dir) => {
    assertTsd(
      await tsd({
        cwd: join(Path.dirname(Url.fileURLToPath(import.meta.url)), '..'),
        typingsFile: './dist/index.d.ts',
        testFiles: [dir.path],
      }),
    );
  });
});
