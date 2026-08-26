'use client';

import { useRef, useState } from 'react';
import { TRAJECTORY_LABEL } from '@/content/trajectory';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { zoomScale } from '@/lib/zoom/camera';
import { handAngles, rewindLabel } from '@/lib/zoom/clock';
import { BrutalistClock } from './BrutalistClock';
import { ZoomWords, TRAIL } from './ZoomWords';
import styles from './S04ToS05Zoom.module.css';

/** The year the trajectory rewinds to — POST.01. */
const END_YEAR = 2020;

/**
 * The pinned s04 → s05 transition.
 *
 * One ScrollTrigger, one timeline. A single linear tween drives `p`; scale
 * comes from `zoomScale(p)` and is never tweened directly, because apparent
 * zoom speed is the slope of ln(scale). All positions below are normalised
 * progress of the pinned scroll.
 */
export function S04ToS05Zoom({ startYear }: { startYear: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<SVGGElement>(null);
  const [year, setYear] = useState(startYear);

  useGSAP(
    () => {
      const scaler = scalerRef.current;
      const root = rootRef.current;
      if (!scaler || !root) return;

      if (prefersReducedMotion()) {
        // No pin, no zoom: land on the final state and cross-fade into s05.
        setYear(END_YEAR);
        gsap.set('[data-zw="0"]', { autoAlpha: 0 });
        gsap.set('[data-zw="1"]', { autoAlpha: 1, y: 0 });
        gsap.set(`.${styles.flood}`, { opacity: 1 });
        gsap.set('[data-clock]', { opacity: 0 });
        return;
      }

      gsap.set('[data-zw="1"]', { autoAlpha: 0 });
      gsap.set('[data-clock]', { opacity: 0 });

      const camera = { p: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      // Camera. Linear in p; the curve lives in zoomScale.
      timeline.to(
        camera,
        {
          p: 1,
          ease: 'none',
          duration: 1,
          onUpdate: () => {
            gsap.set(scaler, { scale: zoomScale(camera.p), transformOrigin: '50% 50%' });
          },
        },
        0,
      );

      // UPTIME's trail: ghosts start collapsed onto the word, then stagger out.
      TRAIL.forEach((ghost, index) => {
        timeline.fromTo(
          `[data-trail="0"]:nth-of-type(${index + 1})`,
          { y: -ghost.y, opacity: 0 },
          { y: 0, opacity: ghost.opacity, duration: 0.05, ease: 'power2.out' },
          0 + index * 0.016,
        );
      });

      timeline
        .to('[data-word="uptime"]', { y: -320, duration: 0.085, ease: 'power2.in' }, 0)
        .set('[data-zw="0"]', { autoAlpha: 0 }, 0.135)
        .to('[data-zw="1"]', { autoAlpha: 1, duration: 0.02 }, 0.13)
        .fromTo(
          '[data-since-block]',
          { y: 150 },
          { y: 0, duration: 0.09, ease: 'power3.out' },
          0.13,
        );

      TRAIL.forEach((ghost, index) => {
        timeline.fromTo(
          `[data-trail="1"]:nth-of-type(${index + 1})`,
          { opacity: 0 },
          { opacity: ghost.opacity, duration: 0.05, ease: 'power2.out' },
          0.13 + index * 0.016,
        );
      });

      // Year rolls backwards. The numeric counter is the source of truth; the
      // odometer reacts to it.
      const counter = { value: startYear };
      timeline.to(
        counter,
        {
          value: END_YEAR,
          duration: 0.3,
          ease: 'power1.inOut',
          onUpdate: () => setYear(Math.round(counter.value)),
        },
        0.1,
      );

      // Clock. Keeps spinning through the whole zoom and never fades out.
      const clock = { p: 0 };
      timeline
        .to('[data-clock]', { opacity: 1, duration: 0.06 }, 0.1)
        .to(
          clock,
          {
            p: 1,
            ease: 'none',
            duration: 0.88,
            onUpdate: () => {
              const angles = handAngles(clock.p);
              gsap.set('[data-clock-hand="h"]', { rotate: angles.hour });
              gsap.set('[data-clock-hand="m"]', { rotate: angles.minute });
              gsap.set('[data-clock-hand="s"]', { rotate: angles.second });
              const label = root.querySelector('[data-clock-label]');
              if (label) label.textContent = rewindLabel(clock.p);
            },
          },
          0.1,
        );

      // Flood: full green as the dot fills the viewport.
      timeline.to(`.${styles.flood}`, { opacity: 1, ease: 'power2.in', duration: 0.16 }, 0.84);
      timeline.to(`.${styles.meta}`, { opacity: 0, duration: 0.1 }, 0.2);
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className={styles.stage} data-zoom-stage>
      <div className={styles.grid} aria-hidden="true" />
      <BrutalistClock />

      <svg
        className={styles.svg}
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g transform="translate(500 200)">
          <g ref={scalerRef} data-zoom-scaler>
            <ZoomWords year={year} />
          </g>
        </g>
      </svg>

      <div className={styles.flood} aria-hidden="true" />
      <div className={styles.meta}>
        <span>{TRAJECTORY_LABEL}</span>
        <span className={styles.metaRule} aria-hidden="true" />
      </div>
    </div>
  );
}
