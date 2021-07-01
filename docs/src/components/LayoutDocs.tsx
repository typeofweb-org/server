import { MDXProvider } from '@mdx-js/react';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

export const LayoutDocs = memo<PropsWithChildren<{}>>(({ children }) => {
  return (
    <div>
      <MDXProvider components={{}}>{children}</MDXProvider>
    </div>
  );
});
LayoutDocs.displayName = 'LayoutDocs';
