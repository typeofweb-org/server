import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import Head from 'next/head';
import { FrontmatterMeta } from '../../tools/types';

interface LayoutProps {
  meta?: FrontmatterMeta;
}

export const ReferenceLayout = memo<PropsWithChildren<LayoutProps>>(({ meta, children }) => {
  const titleSuffix = meta?.title ? ` · ${meta.title}` : '';
  return (
    <>
      <Head><title>@typeofweb/server{titleSuffix}</title></Head>
      <article>
        {meta?.fileDestination && (
          <a
            href={`https://github.com/typeofweb/server/edit/main/${meta.fileDestination}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Edit this file
          </a>
        )}
        {children}
      </article>
    </>
  );
});
ReferenceLayout.displayName = 'Layout';
