import styles from './BrutalistClock.module.css';

const TICKS = Array.from({ length: 60 }, (_, i) => i);

/**
 * The clock behind the zoom. Purely presentational — the parent's single
 * ScrollTrigger drives the hands and label by data attribute, so there is one
 * timeline for the whole stage rather than one per moving part.
 */
export function BrutalistClock() {
  return (
    <div className={styles.wrap} data-clock aria-hidden="true">
      <div className={styles.face}>
        <div className={styles.rimOuter} />
        <div className={styles.rimInner} />

        <div className={styles.ticks}>
          {TICKS.map((index) => (
            <div
              key={index}
              className={`${styles.tick} ${index % 5 === 0 ? styles.tickMajor : styles.tickMinor}`}
              style={{ transform: `rotate(${index * 6}deg)` }}
            />
          ))}
        </div>

        <div className={`${styles.hand} ${styles.handHour}`} data-clock-hand="h" />
        <div className={`${styles.hand} ${styles.handMinute}`} data-clock-hand="m" />
        <div className={`${styles.hand} ${styles.handSecond}`} data-clock-hand="s" />
        <div className={styles.centre} />

        <div className={styles.label} data-clock-label>ELAPSED</div>
      </div>
    </div>
  );
}
