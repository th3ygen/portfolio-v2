'use client';

import { useRef, type CSSProperties } from 'react';
import {
  MANIFEST,
  MANIFEST_COUNT,
  MANIFEST_EQUIPPED,
  MANIFEST_EQUIPPED_TAG,
  MANIFEST_UNIT,
} from '@/content/manifest';
import { useManifestReadout } from './useManifestReadout';
import styles from './S02Manifest.module.css';

/**
 * Each tagged row's place among the tagged rows, in reading order. The tags
 * step on in this order after the print, so the eye runs down the grid with
 * them instead of taking all nine in at once.
 */
const EQUIPPED_ORDER = new Map(
  MANIFEST.flatMap((c) => c.items)
    .filter((item) => MANIFEST_EQUIPPED.has(item))
    .map((item, index) => [item, index]),
);

/**
 * The full manifest: nine lettered categories, always open.
 *
 * The 8-item core loadout this contrasts against lives in s01 — the whole
 * point of the section is the gap between a curated eight and an honest
 * seventy-two, which is why the head counts the rows up as they print and the
 * eight are tagged where they sit.
 *
 * It used to sit behind a collapse toggle. Nobody needs to hide a list they
 * scrolled to on purpose, and the reopen animation it drove is now the reveal
 * on view instead.
 */
export function S02Manifest() {
  const rootRef = useRef<HTMLElement>(null);
  useManifestReadout(rootRef);

  return (
    <section id="s02" ref={rootRef} className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">02</div>
      <div className={styles.hatch} data-py="-18" aria-hidden="true" />
      <div className={styles.sideLabel} data-py="30" aria-hidden="true">
        SYS.NODE.02 // CHECKSUM OK // NO FAULTS LOGGED
      </div>

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">02</span>
          <h2 className={styles.headTitle}>FULL MANIFEST</h2>
          <span className={styles.headCount} aria-hidden="true">
            <span className={styles.headCountValue} data-manifest-count>
              {String(MANIFEST_COUNT).padStart(2, '0')}
            </span>{' '}
            {MANIFEST_UNIT}
          </span>
          <span className={styles.headNote}>EVERYTHING, INCLUDING THE UNGLAMOROUS PARTS</span>
        </header>

        <div className={styles.grid} data-manifest-grid>
          {MANIFEST.map((category) => (
            <div key={category.letter} className={styles.category} data-manifest-cell>
              <div className={styles.categoryHead}>
                <span className={styles.letter} aria-hidden="true" data-manifest-mark>
                  {category.letter}
                </span>
                <h3 className={styles.categoryTitle} data-manifest-mark>
                  {category.category}
                </h3>
              </div>
              <ul className={styles.items}>
                {category.items.map((item) => {
                  const order = EQUIPPED_ORDER.get(item);
                  if (order === undefined) return <li key={item}>{item}</li>;
                  return (
                    <li
                      key={item}
                      data-equipped={item}
                      style={{ '--eq-i': order } as CSSProperties}
                    >
                      {item}
                      <span className={styles.eq} aria-hidden="true">
                        {MANIFEST_EQUIPPED_TAG}
                      </span>
                      <span className="sr-only"> (core loadout)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
