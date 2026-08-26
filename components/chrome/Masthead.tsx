'use client';

import { useEffect, useState } from 'react';
import { HEADER } from '@/content/sections';
import styles from './Masthead.module.css';

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kuala_Lumpur',
});

/**
 * Fixed masthead. The clock renders a placeholder on the server and until the
 * first client tick — a real time rendered during SSR would never match what
 * the client computes a moment later.
 */
export function Masthead() {
  const [clock, setClock] = useState<string>(HEADER.clockPlaceholder);

  useEffect(() => {
    const tick = () => setClock(`${TIME_FORMAT.format(new Date())} MYT`);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className={styles.masthead}>
      <span className={styles.sys}>
        <span className={styles.dot} data-status-dot aria-hidden="true" />
        {HEADER.sys}
      </span>
      <span className={styles.slash} aria-hidden="true">/</span>
      <span>{HEADER.operator}</span>
      <span className={`${styles.slash} ${styles.optional}`} aria-hidden="true">/</span>
      <span className={styles.optional}>{HEADER.build}</span>
      <span className={styles.spacer} />
      <span className={styles.clock}>{clock}</span>
      <span className={`${styles.slash} ${styles.optional}`} aria-hidden="true">/</span>
      <span className={styles.optional}>{HEADER.coordinates}</span>
      <span className={`${styles.slash} ${styles.optional}`} aria-hidden="true">/</span>
      <span className={`${styles.coffee} ${styles.optional}`}>{HEADER.coffee}</span>
    </header>
  );
}
