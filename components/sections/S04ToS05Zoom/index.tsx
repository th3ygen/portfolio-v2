'use client';

import { useRef, useState } from 'react';
import { TRAJECTORY_LABEL } from '@/content/trajectory';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { zoomScale } from '@/lib/zoom/camera';
import { handAngles, rewindLabel } from '@/lib/zoom/clock';
import { BrutalistClock } from './BrutalistClock';
import { ZoomWords, TRAIL_OFFSETS, TRAIL_OPACITY } from './ZoomWords';
import styles from './S04ToS05Zoom.module.css';

/** The year the trajectory rewinds to — POST.01. */
const END_YEAR = 2020;

/**
 * Where SINCE <year> takes over. UPTIME's column has fully faded by 0.16, so
 * this leaves a beat of empty frame between the two rather than crossing them.
 */
const HANDOFF = 0.17;

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

      // Camera writes the transform attribute directly. GSAP resolves
      // transformOrigin against the element's *bounding box*, and this group's
      // bbox moves every frame as UPTIME leaves and SINCE arrives — so a GSAP
      // scale would drift the zoom target frame by frame. The content is
      // authored around the dot at 0,0 and the parent group centres it, so a
      // bare SVG scale() flies into the dot exactly.
      const setCamera = (p: number) => {
        scaler.setAttribute('transform', `scale(${zoomScale(p).toFixed(4)})`);
      };
      setCamera(0);

      const clones = gsap.utils.toArray<SVGElement>('[data-clone]');
      const trail1 = gsap.utils.toArray<SVGElement>('[data-trail="1"]');
      const trailIn = (index: number) => TRAIL_OPACITY[index] ?? 0;
      const trailOut = (index: number) => -(TRAIL_OFFSETS[index] ?? 0);
      /** Each clone's landing place, read off the element that owns it. */
      const cloneY = (_i: number, el: Element) =>
        Number.parseFloat(el.getAttribute('data-clone-y') ?? '0');

      gsap.set('[data-zw="1"]', { opacity: 0, y: TRAIL_OFFSETS[0] });
      // Clones start stacked exactly on the solid word, so the explosion has
      // somewhere to come from.
      gsap.set(clones, { opacity: 0, y: 0 });
      gsap.set(trail1, { opacity: 0, y: (i: number) => trailOut(i) });
      gsap.set('[data-clock]', { opacity: 0 });

      const camera = { p: 0 };
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: 0.5,
        },
      });

      // Camera. Linear in p; the curve lives in zoomScale.
      timeline.to(
        camera,
        {
          p: 1,
          duration: 1,
          onUpdate: () => setCamera(camera.p),
        },
        0,
      );

      // UPTIME detonates into a vertical column of hollow copies of itself,
      // then the whole column is shoved off the top. SINCE <year> steps up from
      // below to replace it.
      //
      // from:'center' so the pair nearest the word leaves first and the outer
      // ones chase — a blast outward, not a sweep down the column.
      timeline
        .to(clones, {
          opacity: 1,
          y: cloneY,
          duration: 0.075,
          ease: 'power3.out',
          stagger: { each: 0.011, from: 'center' },
        }, 0)
        .to('[data-zw="0"]', { y: -520, duration: 0.09, ease: 'power2.in' }, 0.06)
        .to(clones, { opacity: 0, duration: 0.05, stagger: { each: 0.01, from: 'center' }, ease: 'power1.in' }, 0.085)
        // The whole group fades rather than snapping, and finishes before
        // SINCE starts — the two never share a frame.
        .to('[data-zw="0"]', { opacity: 0, duration: 0.055, ease: 'power2.in' }, 0.105)
        .set('[data-zw="0"]', { opacity: 0 }, 0.16)
        .to('[data-zw="1"]', { opacity: 1, duration: 0.035, ease: 'power1.out' }, HANDOFF)
        .to(trail1, { opacity: trailIn, y: 0, duration: 0.05, stagger: 0.016, ease: 'power2.out' }, HANDOFF)
        .to('[data-zw="1"]', { y: 0, duration: 0.09, ease: 'power3.out' }, HANDOFF);

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
          onComplete: () => setYear(END_YEAR),
        },
        // Starts with the handoff, not before it: the rewind has to be seen
        // from the current year, and the odometer is invisible until then.
        HANDOFF,
      );

      // Clock. Keeps spinning through the whole zoom and never fades out.
      const clock = { p: 0 };
      timeline
        .fromTo('[data-clock]', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.08)
        .to(
          clock,
          {
            p: 1,
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

      // Chrome clears out early; the flood snaps green as the dot fills the frame.
      timeline
        .to(`.${styles.meta}`, { opacity: 0, duration: 0.1 }, 0)
        .to(`.${styles.grid}`, { opacity: 0, duration: 0.3 }, 0)
        .fromTo(`.${styles.flood}`, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.96);
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
