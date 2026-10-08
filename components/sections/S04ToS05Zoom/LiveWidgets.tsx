import type { CSSProperties } from 'react';
import { COMMS } from '@/content/uptime';
import { SHIFT, bpm, coffee, lastWeek, myt, pad2, shift, type Shift } from '@/lib/uptime/live';
import type { GitHubState } from './useLive';
import styles from './UptimeWidgets.module.css';

/**
 * The live widgets on the UPTIME summary's bands: LOC.TIME, SYS.PULSE,
 * FUEL.COFFEE and COMMS.LINK. All chrome — each fades with the frames as the
 * clock assembles; nothing of theirs flies into it.
 *
 * `now` is null on the server and until the first client tick (see useNow):
 * they render their placeholders until then.
 */

export function LocalTime({ now }: { now: Date | null }) {
  const t = now ? myt(now) : null;
  const state: Shift | null = t ? shift(t) : null;
  return (
    <section className={`${styles.widget} ${styles.tile}`} data-w-widget data-live="time">
      <div className={styles.frame} data-w-chrome />
      <header className={styles.head} data-w-chrome>
        <span>LOC.TIME</span>
        <span>GMT+8</span>
      </header>
      <div className={styles.tileBody} data-w-chrome>
        <div className={styles.timeRow}>
          <span className={styles.big}>{t ? `${pad2(t.hours)}:${pad2(t.minutes)}` : '--:--'}</span>
          <span className={styles.timeSec}>{t ? pad2(t.seconds) : '--'}</span>
        </div>
        {/* The day in hours: asleep dim, working hours marked, now lit. */}
        <div className={styles.hours} aria-hidden="true">
          {Array.from({ length: 24 }, (_, h) => {
            const kind =
              t && h === t.hours
                ? 'now'
                : h >= SHIFT.sleep && h < SHIFT.wake
                  ? 'sleep'
                  : h >= SHIFT.start && h < SHIFT.end
                    ? 'work'
                    : 'free';
            return <span key={h} data-hour={kind} />;
          })}
        </div>
      </div>
      <footer className={styles.foot} data-w-chrome>
        KUALA LUMPUR · <span className={state === 'ON SHIFT' ? styles.accentText : undefined}>{state ?? '--'}</span>
      </footer>
    </section>
  );
}

/** One heartbeat, 60 units wide: flat, a small P, the QRS spike, a T, flat. */
const BEAT = 'L12 15 L15 12.5 L18 15 L22 15 L24 18 L27 2 L30 26 L33 15 L38 15 L42 10.5 L47 15 L60 15';
const beats = (n: number) =>
  `M0 15 ${Array.from({ length: n }, (_, i) => BEAT.replace(/L(\d+(?:\.\d+)?)/g, (_, x: string) => `L${Number(x) + i * 60}`)).join(' ')}`;
/** Four beats: two to show, and two more so the loop can scroll seamlessly. */
const TRACE = beats(4);

export function Pulse({ github }: { github: GitHubState }) {
  const week = github.status === 'ready' ? lastWeek(github.days) : null;
  const rate = week === null ? null : bpm(week);
  return (
    <section className={`${styles.widget} ${styles.tile}`} data-w-widget data-live="pulse">
      <div className={styles.frame} data-w-chrome />
      <header className={styles.head} data-w-chrome>
        <span>SYS.PULSE</span>
        {rate !== null ? <span className={styles.live}>LIVE</span> : <span>{github.status === 'lost' ? 'NO SIGNAL' : 'SYNC'}</span>}
      </header>
      <div className={styles.tileBody} data-w-chrome>
        <div className={styles.pulseRow}>
          <span className={styles.big}>{rate !== null ? String(rate).padStart(3, '0') : '---'}</span>
          <span className={styles.unit}>BPM</span>
        </div>
        {/* Two beats wide, scrolling a beat at a time at the rate: flat until there is one. */}
        <div className={styles.ecg} aria-hidden="true">
          <svg
            viewBox="0 0 240 30"
            preserveAspectRatio="none"
            className={rate !== null ? styles.ecgRun : undefined}
            style={rate !== null ? ({ '--beat': `${(60 / rate) * 2}s` } as CSSProperties) : undefined}
          >
            <path d={rate !== null ? TRACE : 'M0 15 L240 15'} />
          </svg>
        </div>
      </div>
      <footer className={styles.foot} data-w-chrome>
        {week !== null ? `LOAD 7D · ${pad2(week)} CONTRIB` : github.status === 'lost' ? 'GITHUB UNREACHABLE' : 'SYNCING…'}
      </footer>
    </section>
  );
}

const SEGMENTS = 10;

export function Coffee({ now }: { now: Date | null }) {
  const c = now ? coffee(myt(now)) : null;
  const low = c !== null && (c.status === 'LOW' || c.status === 'CRITICAL');
  const lit = c ? Math.round((c.level / 100) * SEGMENTS) : 0;
  return (
    <section className={`${styles.widget} ${styles.tile}`} data-w-widget data-live="coffee">
      <div className={styles.frame} data-w-chrome />
      <header className={styles.head} data-w-chrome>
        <span>FUEL.COFFEE</span>
        <span className={low ? styles.warnText : styles.headValue}>{c?.status ?? '--'}</span>
      </header>
      <div className={styles.tileBody} data-w-chrome>
        <div className={styles.pulseRow}>
          <span className={styles.big}>{c ? pad2(c.level) : '--'}</span>
          <span className={styles.unit}>%</span>
        </div>
        <div className={styles.tank} data-low={low || undefined} aria-hidden="true">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} data-lit={i < lit || undefined} />
          ))}
        </div>
      </div>
      <footer className={styles.foot} data-w-chrome>
        {c ? `CUPS ${c.cups}/3 · NEXT ${c.next}` : 'CUPS -/3 · NEXT --:--'}
      </footer>
    </section>
  );
}

export function Comms({ now }: { now: Date | null }) {
  const state = now ? shift(myt(now)) : null;
  const line =
    state === 'ON SHIFT' ? 'OPERATOR ONLINE' : state === 'OFF SHIFT' ? 'AFTER HOURS' : state === 'ASLEEP' ? `QUEUED · READ AFTER ${pad2(SHIFT.wake)}:00` : '--';
  // Asleep, a message waits: the lines are up, but the signal is low.
  const bars = state === 'ASLEEP' ? 1 : state === 'OFF SHIFT' ? 3 : 4;
  return (
    <section className={`${styles.widget} ${styles.comms}`} data-w-widget data-live="comms">
      <div className={styles.frame} data-w-chrome />
      <header className={styles.head} data-w-chrome>
        <span>COMMS.LINK</span>
        <span className={styles.live}>{COMMS.availability}</span>
      </header>
      <ul className={styles.channels} data-w-chrome>
        {COMMS.channels.map((channel) => (
          <li key={channel}>
            <span className={styles.channelName}>{channel}</span>
            <span className={styles.signal} aria-hidden="true">
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} data-on={(state !== null && i < bars) || undefined} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.commsLine} data-w-chrome>
        {line}
      </div>
      <footer className={styles.foot} data-w-chrome>
        REPLY {COMMS.reply} · NOTICE {COMMS.notice.replace(' DAYS', 'D')}
      </footer>
    </section>
  );
}
