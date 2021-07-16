import { memo } from 'react';
import { Accordion } from '../Accordion/Accordion';
import styles from './Reference.module.scss';

export type ReferenceType = {
  heading: string;
  sections?: string[];
}[];

type ReferenceProps = {
  reference: ReferenceType;
  menuOpened: boolean;
};

export const Reference = memo<ReferenceProps>(({ reference, menuOpened }) => (
  <section className={`${styles.reference} ${menuOpened ? styles.referenceOpened : ''}`}>
    {reference.map(({ heading, sections }) => (
      // isActive should be derived from the current url
      <Accordion isActive={false} key={heading} heading={heading} sections={sections} />
    ))}
  </section>
));
Reference.displayName = 'Reference';
