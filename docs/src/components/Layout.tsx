import { MDXProvider } from '@mdx-js/react';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

export const Layout = memo<PropsWithChildren<{}>>(({ children }) => {
  return (
    <div>
      <MDXProvider components={{}}>{children}</MDXProvider>
    </div>
  );
});
Layout.displayName = 'Layout';
