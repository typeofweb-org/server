import { memo } from 'react';
import styles from './TableOfContents.module.scss';

type TableOfContentsProps = {
  headings: string[];
  activeHeading: string;
};
const TableOfContents = memo<TableOfContentsProps>(({ headings, activeHeading }) => {
  return (
    <section className={styles.tableOfContentsWrapper}>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li className={styles.listItem} key={heading}>
            <a className={`${styles.anchor} ${heading === activeHeading ? styles.anchorActive : ''}`}>{heading}</a>
          </li>
        ))}
      </ol>
    </section>
  );
});
TableOfContents.displayName = 'TableOfContents';

export { TableOfContents };
