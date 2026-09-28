'use client';

import { useRef } from 'react';
import { TRAJECTORY_LABEL } from '@/content/trajectory';
import { ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { useSmoothScroll } from '@/components/motion/SmoothScrollProvider';
import { rewindLabel } from '@/lib/zoom/clock';
import { RewindWorld } from './RewindWorld';
import { STREAK_DASH, buildRewind, setOpeningFrame } from './rewindTimeline';
import { UptimeWidgets } from './UptimeWidgets';
import { UPTIME_SINCE } from '@/content/uptime';
import { createRewindGate } from './rewindGate';
import styles from './S04ToS05Zoom.module.css';

/** The year the trajectory rewinds to: the first post's. */
const END_YEAR = UPTIME_SINCE;

/**
 * The warp streaks, as angles around the dot. Evenly spaced with a fixed
 * jitter, so the tunnel is irregular but identical on every visit and on the
 * server.
 */
const STREAKS = Array.from({ length: 32 }, (_, i) => {
  const jitter = ((i * 37) % 11) - 5;
  const angle = ((i * 360) / 32 + jitter) * (Math.PI / 180);
  const inner = 60 + ((i * 53) % 7) * 12;
  // Rounded: the server's and the browser's trig disagree in the last digit,
  // and an unrounded coordinate is a hydration mismatch.
  const at = (r: number, f: (a: number) => number) => Math.round(f(angle) * r * 10) / 10;
  return { x1: at(inner, Math.cos), y1: at(inner, Math.sin), x2: at(760, Math.cos), y2: at(760, Math.sin) };
});

/**
 * The s04 → s05 transition, in two sections on one stage.
 *
 * 1. UPTIME. The word, with a summary around it — years online, posts opened
 *    per year, deployments, what is still running. A place to read, not a
 *    transition: it builds in as the page arrives and then waits.
 * 2. The clock. One scroll and the summary's data flies into a clock — the
 *    gauge becomes the rim, the years' bars land on the year ring, the
 *    project cells become ticks, the running processes and UPTIME fall into
 *    the hub — which winds smoothly back until 2020 is in the window at
 *    twelve. The next scroll dives through its dot onto s05's ground.
 *
 * It is triggered, not scrubbed: each scroll plays one of those through at
 * its own speed and the page waits for the next; see rewindGate. The stage is
 * one screen tall and never pinned — the page is held at its top edge.
 */
export function S04ToS05Zoom({ startYear }: { startYear: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<SVGGElement>(null);
  const smooth = useSmoothScroll();
  const years = startYear - END_YEAR;

  useGSAP(
    () => {
      const scaler = scalerRef.current;
      const root = rootRef.current;
      if (!scaler || !root) return;

      setOpeningFrame(root, scaler, startYear);
      const { master, stops } = buildRewind({ root, scaler, startYear, endYear: END_YEAR });

      if (prefersReducedMotion()) {
        // No hold, no clock: the summary, built and still, and the page
        // scrolls on past it.
        master.time(stops[1]);
        return;
      }

      // The flights into the clock are measured from the layout. A resize
      // moves both ends, so drop the measurements and re-render where the
      // playhead is.
      const remeasure = () => {
        const time = master.time();
        master.invalidate().time(0).time(time);
      };
      ScrollTrigger.addEventListener('refresh', remeasure);

      // Without the provider there is no page to hold — a component test.
      if (!smooth) {
        return () => ScrollTrigger.removeEventListener('refresh', remeasure);
      }
      const gate = createRewindGate({
        stage: root,
        master,
        stops,
        smooth,
        onHold: (held) => {
          root.dataset.held = String(held);
        },
      });
      return () => {
        ScrollTrigger.removeEventListener('refresh', remeasure);
        gate.destroy();
      };
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className={styles.stage} data-zoom-stage data-held="false">
      <div className={styles.grid} data-rewind-grid aria-hidden="true" />

      <div className={styles.shake} data-rewind-shake>
        {/*
          Units are a thousandth of the viewport's shorter side, centred: the
          clock fills the same share of a phone as of a monitor.
        */}
        <svg
          className={styles.svg}
          viewBox="-500 -500 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* The camera. See writeCamera. */}
          <g ref={scalerRef} data-zoom-scaler>
            <RewindWorld startYear={startYear} endYear={END_YEAR} label={rewindLabel(years)} />
          </g>
        </svg>
      </div>

      {/* Screen space, not camera space: the tunnel is the lens's, not the world's. */}
      <svg
        className={styles.warp}
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        data-warp
        aria-hidden="true"
      >
        {STREAKS.map((line, i) => (
          <line
            key={i}
            {...line}
            data-streak
            pathLength={100}
            strokeDasharray={`${STREAK_DASH} 200`}
            strokeDashoffset={STREAK_DASH}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <UptimeWidgets />

      <div className={styles.meta} data-rewind-meta>
        <span>{TRAJECTORY_LABEL}</span>
        <span className={styles.metaRule} aria-hidden="true" />
      </div>

    </div>
  );
}
