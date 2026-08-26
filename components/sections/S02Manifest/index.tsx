'use client';

import { useState } from 'react';
import { MANIFEST, MANIFEST_LABEL } from '@/content/manifest';
import styles from './S02Manifest.module.css';

/**
 * The full manifest: nine lettered categories behind a toggle.
 *
 * Defaults to open, matching the prototype. The 8-item core loadout this
 * contrasts against lives in s01 — the whole point of the section is the gap
 * between a curated eight and an honest seventy-two.
 */
export function S02Manifest() {
  const [open, setOpen] = useState(true);

  return (
    <section id="s02" className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">02</div>
      <div className={styles.hatch} data-py="-18" aria-hidden="true" />
      <div className={styles.sideLabel} data-py="30" aria-hidden="true">
        SYS.NODE.02 // CHECKSUM OK // NO FAULTS LOGGED
      </div>

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">02</span>
          <h2 className={styles.headTitle}>FULL MANIFEST</h2>
          <span className={styles.headNote}>EVERYTHING, INCLUDING THE UNGLAMOROUS PARTS</span>
        </header>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="manifest-grid"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? MANIFEST_LABEL.open : MANIFEST_LABEL.closed}</span>
        </button>

        {open ? (
          <div className={styles.grid} id="manifest-grid">
            {MANIFEST.map((category) => (
              <div key={category.letter} className={styles.category}>
                <div className={styles.categoryHead}>
                  <span className={styles.letter} aria-hidden="true">{category.letter}</span>
                  <h3 className={styles.categoryTitle}>{category.category}</h3>
                </div>
                <ul className={styles.items}>
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
