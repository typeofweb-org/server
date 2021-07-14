import { MDXProvider } from '@mdx-js/react';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

interface LayoutProps {
  meta?: {
    fileDestination?: string;
    releaseTag?: string;
  }
}

export const Layout = memo<PropsWithChildren<LayoutProps>>(({ children }) => {
  return (
    <article>
      <MDXProvider components={{}}>{children}</MDXProvider>
    </article>
  );
});
Layout.displayName = 'Layout';
