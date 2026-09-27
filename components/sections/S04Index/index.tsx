'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { INDEX_INTRO, INDEX_NOTE, INDEX_ROWS } from '@/content/index-rows';
import { SPOTLIGHTS } from '@/content/spotlights';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import styles from './S04Index.module.css';

/** Derived, not hand-flagged, so the two sections cannot drift apart. */
const SPOTLIT = new Map(SPOTLIGHTS.map((project) => [project.name, project]));

/**
 * The full index: 16 tiles in a bento grid. The four projects that also
 * appear in s03 take 2×2 tiles; `grid-auto-flow: dense` backfills the
 * singles around them, and 4 × 4 + 12 × 1 cells fills seven rows of four
 * with no holes.
 *
 * At rest a tile is type only. Hovering it wipes the project's screen up
 * from the bottom edge behind the type — the hero reveal. The screen is
 * decoration here (s03 carries the described images), so it is alt="".
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

        <p className={styles.intro} data-box-reveal>{INDEX_INTRO}</p>

        <ul className={styles.grid} aria-label="Every system shipped">
          {INDEX_ROWS.map((row) => {
            const spotlight = SPOTLIT.get(row.name);
            return (
              <li
                key={row.n}
                className={styles.tile}
                data-size={spotlight ? 'hero' : 'cell'}
                data-spotlit={spotlight ? 'true' : 'false'}
                data-lock={row.name}
                data-reveal
              >
                <div className={styles.reveal} aria-hidden="true">
                  {row.image ? (
                    <Image
                      className={styles.revealImage}
                      src={row.image}
                      alt=""
                      fill
                      sizes={spotlight ? '(max-width: 700px) 100vw, 700px' : '(max-width: 700px) 100vw, 350px'}
                    />
                  ) : (
                    <div className={styles.revealEmpty}>NO VISUAL ON FILE</div>
                  )}
                </div>
                <div className={styles.scan} aria-hidden="true" />

                <div className={styles.top}>
                  <span className={styles.id}>{row.n}</span>
                  {spotlight && <span className={styles.code}>{spotlight.code}</span>}
                  <span className={styles.access} data-access={row.access}>{row.access}</span>
                </div>

                <div className={styles.body}>
                  <span className={styles.sector}>{row.sector}</span>
                  <h3 className={styles.name}>{row.name}</h3>
                  {spotlight && <span className={styles.tagline}>{spotlight.tagline}</span>}
                  <span className={styles.tech}>{row.keyTech}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <p className={styles.note} data-box-reveal>{INDEX_NOTE}</p>
      </div>
    </section>
  );
}
