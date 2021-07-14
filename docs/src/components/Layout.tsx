import { MDXProvider } from '@mdx-js/react';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import Head from 'next/head';

interface LayoutProps {
  meta?: {
    fileDestination?: string;
    releaseTag?: string;
    title?: string;
  };
}

export const Layout = memo<PropsWithChildren<LayoutProps>>(({ meta, children }) => {
  return (
    <>
      <Head>{meta?.title && <title>{meta.title}</title>}</Head>
      <article>
        {meta?.fileDestination && (
          <a href={`https://github.com/typeofweb/server/tree/main/${meta.fileDestination}`}>Edit this file</a>
        )}
        <MDXProvider components={{}}>{children}</MDXProvider>
      </article>
    </>
  );
});
Layout.displayName = 'Layout';
