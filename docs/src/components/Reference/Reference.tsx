import { memo } from 'react';
import { Accordion } from '../Accordion/Accordion';
import styles from './Reference.module.scss';

type ReferenceType = {
  heading: string;
  sections?: string[];
}[];

type ReferenceProps = {
  reference: ReferenceType;
};

const Reference = memo<ReferenceProps>(({ reference }) => (
  <section className={styles.reference}>
    {reference.map(({ heading, sections }) => (
      <Accordion key={heading} heading={heading} sections={sections} />
    ))}
  </section>
));

export { Reference };
export type { ReferenceType };
