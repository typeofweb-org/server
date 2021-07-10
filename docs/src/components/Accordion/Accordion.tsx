import { memo, useCallback, useState } from 'react';
import styles from './Accordion.module.scss';

type AccordionProps = {
  heading: string;
  sections?: string[];
};
const Accordion = memo<AccordionProps>(({ heading, sections }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const hasSections = sections && sections.length > 0;
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);
  return (
    <div className={styles.accordionWrapper}>
      <header className={styles.accordionHeader} onClick={toggleExpanded}>
        <h3 className={styles.accordionHeading}>{heading}</h3>
        {hasSections && (
          <img
            className={`${styles.accordionChevron} ${expanded ? styles.accordionChevronExpanded : ''}`}
            src="/icons/chevron-down.svg"
          />
        )}
      </header>
      {hasSections && expanded && (
        <ul className={styles.accordionSectionList}>
          {sections?.map((section) => (
            <li className={styles.accordionSection} key={section}>
              <a className={styles.accordionSectionAnchor} href="#">
                {section}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
Accordion.displayName = 'Accordion';

export { Accordion };
