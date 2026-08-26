'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { HEADER } from '@/content/sections';
import {
  BOOT_LINES,
  BOOT_TASKS,
  BOOT_TIMEOUT_MS,
  LERP_RATE,
  SESSION_KEY,
  TEARDOWN_DELAY_MS,
  WIPE_DELAY_MS,
  bootTarget,
  lerp,
  logIndexFor,
  stateLabelFor,
} from './bootProgress';
import styles from './BootOverlay.module.css';

type Phase = 'idle' | 'running' | 'exiting' | 'wiping';

/** sessionStorage throws in some privacy modes; a boot overlay is not worth a crash. */
function alreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

/**
 * The cold-boot overlay. Plays once per session, before anything else.
 *
 * Exit is the three-stage sequence from the handoff: panels stagger up and
 * fade, the overlay wipes upward via clip-path, and a glowing bar rides the
 * wipe's bottom edge. The earlier green strobe flash at handoff was explicitly
 * rejected — the wipe is the intended treatment. Do not add it back.
 */
export function BootOverlay({ onComplete }: { onComplete: () => void }) {
  // 'idle' until an effect decides. The decision depends on sessionStorage and
  // a media query, neither of which exists on the server — computing it during
  // render would make the client's first pass disagree with the server's HTML
  // and break hydration. So the server and the first client render both emit
  // nothing, and the effect takes it from there.
  const [phase, setPhase] = useState<Phase>('idle');
  const active = phase !== 'idle';
  const [shown, setShown] = useState(0);
  const [state, setState] = useState<'POST' | 'LOAD' | 'HANDOFF'>('POST');

  const counterRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Kept current in an effect, not during render — mutating a ref mid-render
  // is unsafe when React can render speculatively. useRef's initialiser
  // already covers the mount pass, which is when the boot effect reads it.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (alreadyPlayed() || prefersReducedMotion()) {
      markPlayed();
      onCompleteRef.current();
      return;
    }

    markPlayed();
    // Deliberate: mount-gated UI cannot avoid a state change after mount. The
    // alternative is deciding during render, which is the hydration mismatch
    // this structure exists to prevent. One extra render is the intended cost.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase('running');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let frame = 0;
    let value = 0;
    let start: number | null = null;
    const timers: number[] = [];

    const teardown = () => {
      document.body.style.overflow = previousOverflow;
      onCompleteRef.current();
    };

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      if (frame) window.cancelAnimationFrame(frame);

      setPhase('exiting');
      timers.push(
        window.setTimeout(() => {
          setPhase('wiping');
          timers.push(window.setTimeout(teardown, TEARDOWN_DELAY_MS));
        }, WIPE_DELAY_MS),
      );
    };

    const safety = window.setTimeout(finish, BOOT_TIMEOUT_MS);
    timers.push(safety);

    const step = (now: number) => {
      if (start === null) start = now;
      const target = bootTarget(now - start);
      value = lerp(value, target, LERP_RATE);

      const rounded = Math.min(100, Math.round(value));
      if (counterRef.current) {
        counterRef.current.textContent = String(rounded).padStart(3, '0');
      }
      if (barRef.current) barRef.current.style.width = `${rounded}%`;

      setShown(logIndexFor(rounded));
      setState(stateLabelFor(rounded));

      if (rounded >= 100) {
        window.clearTimeout(safety);
        finish();
        return;
      }
      frame = window.requestAnimationFrame(step);
    };

    frame = window.requestAnimationFrame(step);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      for (const timer of timers) window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
    // Runs once on mount; the boot plays at most one time per session.
  }, []);

  if (!active) return null;

  return (
    <>
      <div
        className={styles.overlay}
        data-phase={phase}
        data-boot
        role="status"
        aria-busy="true"
        aria-label="System boot"
      >
        <div className={styles.scanline} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={`${styles.bracket} ${styles.bracketTL}`} data-boot-bracket aria-hidden="true" />
        <div className={`${styles.bracket} ${styles.bracketTR}`} data-boot-bracket aria-hidden="true" />
        <div className={`${styles.bracket} ${styles.bracketBL}`} data-boot-bracket aria-hidden="true" />
        <div className={`${styles.bracket} ${styles.bracketBR}`} data-boot-bracket aria-hidden="true" />

        <div className={`${styles.panel} ${styles.head}`}>
          <span className={styles.sys}>
            <span className={styles.dot} aria-hidden="true" />
            {HEADER.sys}
          </span>
          <span className={styles.slash} aria-hidden="true">/</span>
          <span>COLD BOOT</span>
          <span className={styles.spacer} />
          <span className={styles.state}>{state}</span>
          <span className={styles.slash} aria-hidden="true">/</span>
          <span>KRNL 2026.08</span>
        </div>

        <div className={`${styles.panel} ${styles.body}`}>
          <div className={styles.log}>
            {BOOT_LINES.map((line, index) => (
              <div
                key={line.label}
                className={styles.logLine}
                data-boot-log
                data-shown={index < shown ? 'true' : 'false'}
              >
                {line.label}
                {line.value ? <span className={styles.logValue}> {line.value}</span> : null}
                {index === BOOT_LINES.length - 1 ? (
                  <span className={styles.cursor} aria-hidden="true">_</span>
                ) : null}
              </div>
            ))}
          </div>

          <div className={styles.counterWrap}>
            <div className={styles.loading}>LOADING</div>
            <div ref={counterRef} className={styles.counter}>000</div>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.foot}`}>
          <div className={styles.barTrack}>
            <div ref={barRef} className={styles.bar} />
          </div>
          <div className={styles.footMeta}>
            <span>{BOOT_TASKS[Math.max(0, shown - 1)] ?? BOOT_TASKS[0]}</span>
            <span>M.AIDIL SYAZWAN HAMDAN · KUALA LUMPUR</span>
          </div>
        </div>
      </div>
      <div className={styles.edge} data-phase={phase} aria-hidden="true" />
    </>
  );
}
