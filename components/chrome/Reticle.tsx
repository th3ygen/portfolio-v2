'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/components/motion/gsap';
import { EASE } from '@/components/motion/tokens';
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

/** Bracket arm length; must match .bracket in the stylesheet. */
const ARM = 13;
/** How far outside the target's edges the brackets settle. */
const INSET = -5;
/** How far outside that they start, before converging inward. */
const APPROACH = 26;
/** Acquisition is stepped, not eased — it snaps shut like a lock, not a glide. */
const LOCK_EASE = EASE.snapFine;
const LOCK_S = 0.2;
const RELEASE_S = 0.12;

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

    // Read out of the DOM rather than held in four refs: an array built during
    // render is a new value every pass and would have to be an effect dependency
    // even though the nodes never change. Document order is TL, TR, BL, BR,
    // which is the order cornersFor returns.
    const brackets = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[data-lock-bracket]') ?? [],
    );
    let locked: HTMLElement | null = null;
    let lockLabel = '';
    // While set, the crosshair is pinned here instead of chasing the pointer.
    let lockCentre: { x: number; y: number } | null = null;

    /** Corner positions for a rect, in the order the bracket refs are declared. */
    const cornersFor = (rect: DOMRect, spread: number) => [
      { x: rect.left - spread, y: rect.top - spread },
      { x: rect.right + spread - ARM, y: rect.top - spread },
      { x: rect.left - spread, y: rect.bottom + spread - ARM },
      { x: rect.right + spread - ARM, y: rect.bottom + spread - ARM },
    ];

    const place = (target: HTMLElement, animate: boolean) => {
      const rect = target.getBoundingClientRect();
      lockCentre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const settled = cornersFor(rect, INSET);
      const approach = cornersFor(rect, APPROACH);

      brackets.forEach((bracket, index) => {
        const to = settled[index];
        const from = approach[index];
        if (!to || !from) return;
        if (!animate) {
          gsap.set(bracket, { x: to.x, y: to.y });
          return;
        }
        gsap.fromTo(
          bracket,
          { x: from.x, y: from.y, opacity: 0 },
          { x: to.x, y: to.y, opacity: 1, duration: LOCK_S, ease: LOCK_EASE, overwrite: true },
        );
      });
    };

    const acquire = (target: HTMLElement) => {
      locked = target;
      lockLabel = target.dataset.lock || '';
      place(target, true);
      // Deliberately NOT snapped to the centre here: leaving x/y alone lets the
      // paint loop's existing lerp carry the crosshair across, so it glides onto
      // the target. The brackets are the part that snaps — stepped converge
      // against a smooth travel is the contrast that sells the acquisition.
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const release = () => {
      locked = null;
      lockLabel = '';
      // Cleared before the next frame, so the crosshair eases back out to
      // wherever the pointer has got to rather than teleporting.
      lockCentre = null;
      if (!frame) frame = window.requestAnimationFrame(paint);
      gsap.to(brackets, {
        opacity: 0,
        duration: RELEASE_S,
        ease: EASE.snap,
        overwrite: true,
      });
    };

    // Delegated rather than one listener pair per element: the lockable set is
    // spread across sections and a table of sixteen rows, and delegation also
    // survives anything re-rendering underneath.
    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-lock]');
      if (!target || target === locked) return;
      acquire(target);
    };

    const onOut = (event: PointerEvent) => {
      if (!locked) return;
      const next = event.relatedTarget as Node | null;
      // Moving between children of the same target is not a release.
      if (next && locked.contains(next)) return;
      release();
    };

    // The rect moves under the pointer while the page scrolls, so a held lock
    // has to be repositioned. Written with set, not tweened: this is correcting
    // for the page moving, not a new acquisition.
    const reposition = () => {
      if (!locked) return;
      place(locked, false);
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const paint = () => {
      // Pinned to the target while locked, chasing the pointer otherwise.
      const toX = lockCentre ? lockCentre.x : targetX;
      const toY = lockCentre ? lockCentre.y : targetY;
      x += (toX - x) * LERP;
      y += (toY - y) * LERP;

      const fx = x.toFixed(2);
      const fy = y.toFixed(2);
      if (xRef.current) xRef.current.style.transform = `translate3d(${fx}px,0,0)`;
      if (yRef.current) yRef.current.style.transform = `translate3d(0,${fy}px,0)`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${fx}px,${fy}px,0)`;
      if (labelRef.current) {
        // Rides the raw pointer while locked, rather than the pinned crosshair.
        // Pinned, it parked the target's name on top of the target's own
        // content; parking it outside the rect just moved the collision into
        // whatever sits below. Following the cursor never rests on anything.
        const lx = lockCentre ? targetX.toFixed(2) : fx;
        const ly = lockCentre ? targetY.toFixed(2) : fy;
        labelRef.current.style.transform = `translate3d(${lx}px,${ly}px,0)`;
        // The readout tracks the pointer itself, not the eased position — the
        // crosshair is allowed to lag, the coordinates are not. While locked it
        // names the target instead: the crosshair has stopped reporting where it
        // is and started reporting what it has.
        labelRef.current.textContent = lockLabel
          ? `▸ ${lockLabel}`
          : `${pad(targetX)} · ${pad(targetY)}`;
      }

      const moving = Math.abs(toX - x) > SETTLED || Math.abs(toY - y) > SETTLED;
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
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('scroll', reposition);
      window.removeEventListener('resize', reposition);
      if (frame) window.cancelAnimationFrame(frame);
      gsap.killTweensOf(brackets);
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
      <div className={`${styles.bracket} ${styles.bracketTL}`} data-lock-bracket />
      <div className={`${styles.bracket} ${styles.bracketTR}`} data-lock-bracket />
      <div className={`${styles.bracket} ${styles.bracketBL}`} data-lock-bracket />
      <div className={`${styles.bracket} ${styles.bracketBR}`} data-lock-bracket />
    </div>
  );
}
