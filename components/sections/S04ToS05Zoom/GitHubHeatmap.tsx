import type { CSSProperties } from 'react';
import { daysBetween, summarise, type ContributionDay } from '@/lib/github/contributions';
import { GITHUB_USER } from '@/content/operator';
import type { GitHubState } from './useLive';
import styles from './UptimeWidgets.module.css';

/** A year of weeks, a column each, Sunday at the top — GitHub's own layout. */
const WEEKS = 53;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** Days into week columns, padded before the first so each column starts on a Sunday. */
function toWeeks(days: readonly ContributionDay[]): (ContributionDay | null)[][] {
  const first = days[0];
  const lead = first ? new Date(`${first.date}T00:00:00Z`).getUTCDay() : 0;
  const cells: (ContributionDay | null)[] = [...Array<null>(lead).fill(null), ...days];
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks.slice(-WEEKS);
}

/** Month names over the first week each month starts in, skipping one too close to the last. */
function monthLabels(weeks: (ContributionDay | null)[][]): { week: number; name: string }[] {
  const labels: { week: number; name: string }[] = [];
  let last = -1;
  weeks.forEach((week, i) => {
    const first = week.find((d) => d !== null);
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month === last) return;
    last = month;
    const previous = labels.at(-1);
    if (!previous || i - previous.week >= 3) labels.push({ week: i, name: MONTHS[month] ?? '' });
  });
  return labels;
}

function ago(from: string, today: string): string {
  const n = daysBetween(from, today);
  return n <= 0 ? 'TODAY' : n === 1 ? 'YESTERDAY' : `${pad(n)}D AGO`;
}

/**
 * GIT.ACTIVITY: the last year of GitHub contributions, a cell a day (see
 * useContributions). Until it arrives, and if it never does, the grid stays
 * dark — an empty year is never shown as if it were the real one.
 */
export function GitHubHeatmap({ github: state }: { github: GitHubState }) {
  const days = state.status === 'ready' ? state.days : [];
  const weeks = days.length ? toWeeks(days) : Array.from({ length: WEEKS }, () => Array<null>(7).fill(null));
  const today = days.at(-1)?.date ?? '';
  const summary = days.length ? summarise(days, today) : null;

  return (
    <section className={`${styles.widget} ${styles.heat}`} data-w-widget data-heatmap={state.status}>
      <div className={styles.frame} data-w-chrome />
      <header className={styles.head} data-w-chrome>
        <span>GIT.ACTIVITY · @{GITHUB_USER.toUpperCase()}</span>
        <span className={styles.headValue}>{summary ? pad(summary.total, 4) : '----'}</span>
      </header>
      <div className={styles.heatBody} data-w-chrome>
        <div className={styles.heatMonths} style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--heat-cell))` }}>
          {monthLabels(weeks).map((label) => (
            <span key={label.week} style={{ gridColumn: label.week + 1 }}>
              {label.name}
            </span>
          ))}
        </div>
        <div className={styles.heatGrid}>
          {weeks.map((week, w) =>
            Array.from({ length: 7 }, (_, d) => {
              const day = week[d];
              if (days.length && !day) return <span key={`${w}-${d}`} className={styles.heatPad} />;
              const level = day?.level ?? 0;
              return (
                <span
                  key={`${w}-${d}`}
                  className={day?.date === today ? `${styles.heatDay} ${styles.heatToday}` : styles.heatDay}
                  data-level={level}
                  data-today={day?.date === today ? '' : undefined}
                  style={{ '--week': w } as CSSProperties}
                />
              );
            }),
          )}
        </div>
      </div>
      <footer className={styles.foot} data-w-chrome>
        {state.status === 'loading' && <span className={styles.heatSync}>SYNCING…</span>}
        {state.status === 'lost' && <span>SIGNAL LOST · GITHUB UNREACHABLE</span>}
        {summary && (
          <span>
            {summary.lastActive ? `LAST PUSH ${ago(summary.lastActive, today)}` : 'NO PUSHES THIS YEAR'} · STREAK{' '}
            {pad(summary.streak)}D · PEAK {pad(summary.best)}/D
          </span>
        )}
      </footer>
    </section>
  );
}
