'use client';

import { TICKER } from '@/content/operator';
import { useReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './S00Hero.module.css';

/**
 * Scrolling tech ticker at the foot of the hero.
 *
 * The list is rendered twice so om-tick's -50% translation loops seamlessly.
 * Decorative and duplicated, so the whole rail is hidden from assistive tech —
 * the same terms appear as real content in the s02 manifest.
 */
export function Ticker() {
  const reduced = useReducedMotion();

  return (
    <div className={styles.tickerWrap} aria-hidden="true">
      <div
        className={styles.tickerRail}
        {...(reduced ? { 'data-static': 'true' as const } : {})}
        data-ticker
      >
        {[0, 1].map((copy) => (
          <span key={copy} className={styles.tickerGroup}>
            {TICKER.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
