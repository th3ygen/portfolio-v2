import { READOUT, READOUT_HEAD } from '@/content/operator';
import styles from './HudReadout.module.css';

/** The floating SYS.READOUT panel beside the hero copy. */
export function HudReadout() {
  return (
    <div className={styles.panel} data-px="8" data-readout>
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />
      <div className={styles.head}>
        <span>{READOUT_HEAD.title}</span>
        <span className={styles.live}>{READOUT_HEAD.state}</span>
      </div>
      <dl>
        {READOUT.map((row) => {
          if (row.kind === 'chips') {
            return (
              <div key={row.label} className={styles.chipsRow}>
                <dt className={styles.chipsLabel}>{row.label}</dt>
                <dd className={styles.chips}>
                  {row.items.map((item) => (
                    <span key={item} className={styles.chip}>{item}</span>
                  ))}
                </dd>
              </div>
            );
          }
          return (
            <div key={row.label} className={styles.row}>
              <dt className={styles.label}>{row.label}</dt>
              <dd
                className={
                  row.kind === 'numeral'
                    ? styles.numeral
                    : row.kind === 'status'
                      ? styles.statusValue
                      : styles.text
                }
              >
                {row.kind === 'status' ? (
                  <span className={styles.statusDot} aria-hidden="true" />
                ) : null}
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
