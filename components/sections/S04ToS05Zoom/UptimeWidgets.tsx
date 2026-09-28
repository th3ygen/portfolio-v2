import {
  CLIENT_COUNT,
  DEPLOYMENTS,
  DEPLOYMENTS_PRIVATE,
  DEPLOYMENTS_PUBLIC,
  DEPLOYMENT_SECTORS,
  POSTS_PER_YEAR,
  RUNNING,
  STACK_COUNT,
  UPTIME_SINCE,
  UPTIME_YEARS,
} from '@/content/uptime';
import styles from './UptimeWidgets.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const BAR_MAX = Math.max(1, ...POSTS_PER_YEAR.map((b) => b.count));
const SECTOR_MAX = Math.max(1, ...DEPLOYMENT_SECTORS.map((s) => s.count));

/**
 * The gauge is a ring cut into a segment per year, each its own arc so each
 * can be lit on its own. pathLength makes the cut independent of the ring's
 * size: each year is SEGMENT long, less the gap.
 */
const SEGMENT = 10;
const GAP = 1.4;

/**
 * The UPTIME summary: four readouts around the word, two a side.
 *
 * Built for the handoff to the clock, so every widget is split in two:
 *
 * - its chrome — frame, headings, labels, numbers — marked `data-w-chrome`,
 *   which fades out as the clock assembles;
 * - its data — the gauge ring, the year bars, the project cells, the process
 *   dots — which flies into the clock and becomes a part of it: the rim, the
 *   years on the ring, the ticks, the hub.
 *
 * Decorative to assistive tech: it restates, in figures, what s01, s04 and
 * s05 say in words, and a reader meets those in order.
 */
export function UptimeWidgets() {
  return (
    <div className={styles.widgets} aria-hidden="true">
      <div className={`${styles.side} ${styles.left}`}>
        <section className={styles.widget} data-w-widget>
          <div className={styles.frame} data-w-chrome />
          <header className={styles.head} data-w-chrome>
            <span>SYS.UPTIME</span>
            <span className={styles.live}>ONLINE</span>
          </header>
          <div className={styles.gaugeRow}>
            <div className={styles.gauge} data-w-gauge>
              <svg viewBox="-50 -50 100 100">
                <circle r={44} className={styles.gaugeTrack} />
                {Array.from({ length: UPTIME_YEARS }, (_, i) => (
                  <circle
                    key={i}
                    r={44}
                    className={styles.gaugeArc}
                    data-w-arc
                    pathLength={UPTIME_YEARS * SEGMENT}
                    strokeDasharray={`${SEGMENT - GAP} ${UPTIME_YEARS * SEGMENT}`}
                    strokeDashoffset={-i * SEGMENT}
                    transform="rotate(-90)"
                  />
                ))}
              </svg>
            </div>
            <div className={styles.gaugeText} data-w-chrome>
              <span className={styles.big} data-w-count={UPTIME_YEARS}>
                {pad(UPTIME_YEARS)}
              </span>
              <span className={styles.unit}>YRS ONLINE</span>
            </div>
          </div>
          <footer className={styles.foot} data-w-chrome>
            SINCE {UPTIME_SINCE} · {pad(RUNNING.length)} POSTS RUNNING
          </footer>
        </section>

        <section className={styles.widget} data-w-widget>
          <div className={styles.frame} data-w-chrome />
          <header className={styles.head} data-w-chrome>
            <span>POSTS OPENED / YR</span>
          </header>
          <div className={styles.bars} data-w-bars>
            <span className={styles.baseline} data-w-chrome />
            {POSTS_PER_YEAR.map((bar) => (
              <div key={bar.year} className={styles.barCol}>
                <div className={styles.barTrack} data-w-bar-track>
                  <div
                    className={bar.count > 0 ? styles.bar : styles.barEmpty}
                    data-w-bar={bar.year}
                    style={{ height: `${Math.max(6, (bar.count / BAR_MAX) * 100)}%` }}
                  />
                </div>
                <span className={styles.barYear} data-w-chrome>
                  {String(bar.year).slice(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`${styles.side} ${styles.right}`}>
        <section className={styles.widget} data-w-widget>
          <div className={styles.frame} data-w-chrome />
          <header className={styles.head} data-w-chrome>
            <span>DEPLOYMENTS</span>
            <span className={styles.headValue} data-w-count={DEPLOYMENTS.length}>
              {pad(DEPLOYMENTS.length)}
            </span>
          </header>
          <div className={styles.cells}>
            {DEPLOYMENTS.map((cell) => (
              <span key={cell.n} className={cell.public ? styles.cellPublic : styles.cell} data-w-cell />
            ))}
          </div>
          <div className={styles.legend} data-w-chrome>
            <span>PRIVATE {pad(DEPLOYMENTS_PRIVATE)}</span>
            <span className={styles.legendPublic}>PUBLIC {pad(DEPLOYMENTS_PUBLIC)}</span>
          </div>
          <ul className={styles.sectors} data-w-chrome>
            {DEPLOYMENT_SECTORS.map((row) => (
              <li key={row.sector}>
                <span className={styles.sectorName}>{row.sector}</span>
                <span className={styles.sectorBar} style={{ width: `${(row.count / SECTOR_MAX) * 100}%` }} />
                <span className={styles.sectorCount}>{pad(row.count)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.widget} data-w-widget>
          <div className={styles.frame} data-w-chrome />
          <header className={styles.head} data-w-chrome>
            <span>RUNNING</span>
            <span className={styles.headValue}>{pad(RUNNING.length)}</span>
          </header>
          <ul className={styles.procs}>
            {RUNNING.map((proc) => (
              <li key={proc.org}>
                <span className={styles.procDot} data-w-proc />
                <span className={styles.procOrg} data-w-chrome>
                  {proc.org}
                </span>
                <span className={styles.procSince} data-w-chrome>
                  SINCE {proc.since}
                </span>
              </li>
            ))}
          </ul>
          <footer className={styles.foot} data-w-chrome>
            CLIENTS {pad(CLIENT_COUNT)} · STACK {STACK_COUNT}
          </footer>
        </section>
      </div>
    </div>
  );
}
