import { memo, useCallback, useState } from 'react';
import styles from './Accordion.module.scss';

type AccordionProps = {
  heading: string;
  isActive: boolean;
  sections?: string[];
};
export const Accordion = memo<AccordionProps>(({ heading, isActive, sections }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const hasSections = sections && sections.length > 0;
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);
  return (
    <div className={styles.accordionWrapper}>
      <header className={styles.accordionHeader} onClick={toggleExpanded}>
        <h3 className={`${styles.accordionHeading} ${isActive ? styles.accordionHeadingActive : ''}`}>{heading}</h3>
        {hasSections && (
          <img
            className={`${styles.accordionChevron} ${expanded ? styles.accordionChevronExpanded : ''}`}
            src="/icons/chevron-down.svg"
            alt={expanded ? 'Accordion expanded' : 'Accordion collapsed'}
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
