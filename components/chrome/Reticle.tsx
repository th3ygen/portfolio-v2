'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './Reticle.module.css';

const pad = (value: number) => String(Math.round(value)).padStart(4, '0');

/**
 * How hard the crosshair chases the pointer each frame. Painting the raw
 * event position is 1:1 and reads as steppy — the crosshair jumps by whatever
 * distance the pointer covered between events. Interpolating toward it instead
 * turns those jumps into a glide.
 */
const LERP = 0.16;
/** Below this the chase is over; stop the frame loop rather than idling. */
const SETTLED = 0.05;

/**
 * Crosshair that tracks the pointer, with a live coordinate readout.
 *
 * Pointer-driven only: it never appears for touch or keyboard users, and is
 * skipped entirely under reduced motion. Positions are written straight to
 * style in a rAF rather than through React state — this fires on every
 * mousemove and must not re-render the tree.
 */
export function Reticle() {
  const rootRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let started = false;

    const paint = () => {
      x += (targetX - x) * LERP;
      y += (targetY - y) * LERP;

      const fx = x.toFixed(2);
      const fy = y.toFixed(2);
      if (xRef.current) xRef.current.style.transform = `translate3d(${fx}px,0,0)`;
      if (yRef.current) yRef.current.style.transform = `translate3d(0,${fy}px,0)`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${fx}px,${fy}px,0)`;
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${fx}px,${fy}px,0)`;
        // The readout tracks the pointer itself, not the eased position — the
        // crosshair is allowed to lag, the coordinates are not.
        labelRef.current.textContent = `${pad(targetX)} · ${pad(targetY)}`;
      }

      const moving =
        Math.abs(targetX - x) > SETTLED || Math.abs(targetY - y) > SETTLED;
      frame = moving ? window.requestAnimationFrame(paint) : 0;
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      // First sighting: land on the pointer instead of gliding in from 0,0.
      if (!started) {
        started = true;
        x = targetX;
        y = targetY;
      }
      setVisible(true);
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.reticle}
      data-reticle
      {...(visible ? { 'data-visible': 'true' as const } : {})}
      aria-hidden="true"
    >
      <div ref={yRef} className={styles.crossY} />
      <div ref={xRef} className={styles.crossX} />
      <div ref={dotRef} className={styles.dot} />
      <div ref={labelRef} className={styles.label}>0000 · 0000</div>
    </div>
  );
}
