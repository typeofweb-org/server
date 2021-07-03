import { MDXProvider } from '@mdx-js/react';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

export const Layout = memo<PropsWithChildren<{}>>(({ children }) => {
  return (
    <article>
      <MDXProvider components={{}}>{children}</MDXProvider>
    </article>
  );
});
Layout.displayName = 'Layout';
