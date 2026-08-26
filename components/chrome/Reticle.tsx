'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './Reticle.module.css';

const pad = (value: number) => String(Math.round(value)).padStart(4, '0');

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
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      if (xRef.current) xRef.current.style.transform = `translateX(${x}px)`;
      if (yRef.current) yRef.current.style.transform = `translateY(${y}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${x}px, ${y}px)`;
        labelRef.current.textContent = `${pad(x)} · ${pad(y)}`;
      }
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
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
