'use client';

import { useRef } from 'react';
import { INDEX_COLUMNS, INDEX_INTRO, INDEX_NOTE, INDEX_ROWS } from '@/content/index-rows';
import { SPOTLIGHTS } from '@/content/spotlights';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import styles from './S04Index.module.css';

/** Derived, not hand-flagged, so the two sections cannot drift apart. */
const SPOTLIT = new Set(SPOTLIGHTS.map((project) => project.name));

/**
 * The full index: 16 rows, dense and low-contrast. Deliberately a lookup
 * table, not cards — so it is built as a real table rather than a grid of
 * divs, which is what makes it navigable.
 */
export function S04Index() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionReveal(rootRef, '[data-reveal]');

  return (
    <section id="s04" ref={rootRef} className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">04</div>
      <div className={styles.dots} data-py="-22" aria-hidden="true" />
      <div className={styles.hatch} data-py="-18" aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">04</span>
          <h2 className={styles.headTitle}>FULL INDEX</h2>
          <span className={styles.headNote}>16 RECORDS</span>
        </header>

        <p className={styles.intro} data-reveal>{INDEX_INTRO}</p>

        <div className={styles.tableWrap} data-reveal>
          <table className={styles.table}>
            <caption className="sr-only">
              Every system shipped, with its sector, key technologies, and access level.
            </caption>
            <thead>
              <tr>
                {INDEX_COLUMNS.map((column) => (
                  <th key={column} scope="col">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INDEX_ROWS.map((row) => (
                <tr key={row.n}>
                  <td className={styles.colId}>{row.n}</td>
                  <th
                    scope="row"
                    className={styles.colName}
                    data-spotlit={SPOTLIT.has(row.name) ? 'true' : 'false'}
                  >
                    {row.name}
                  </th>
                  <td className={styles.colSector}>{row.sector}</td>
                  <td className={styles.colTech}>{row.keyTech}</td>
                  <td className={styles.colAccess}>{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.note}>{INDEX_NOTE}</p>
      </div>
    </section>
  );
}
