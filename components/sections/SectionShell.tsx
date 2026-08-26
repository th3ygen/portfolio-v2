import styles from './SectionShell.module.css';

type Props = {
  id: string;
  number: string;
  title: string;
  /** Right-aligned strapline in the section header. */
  note?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared wrapper giving every section its id, padding, and header.
 *
 * Section numbers fade in over .45s power2.out on reveal. The earlier 6-cycle
 * yoyo opacity flicker read as a flashing bug and was rejected — do not
 * reintroduce it.
 */
export function SectionShell({ id, number, title, note, children, className }: Props) {
  return (
    <section id={id} className={[styles.section, className].filter(Boolean).join(' ')}>
      <div className={styles.ghost} data-ghost-numeral aria-hidden="true">{number}</div>
      <div className={styles.inner}>
        <header className={styles.head} data-title-reveal>
          <span className={styles.number} aria-hidden="true">{number}</span>
          <h2 className={styles.title}>{title}</h2>
          {note ? <span className={styles.note}>{note}</span> : null}
        </header>
        {children}
      </div>
    </section>
  );
}
