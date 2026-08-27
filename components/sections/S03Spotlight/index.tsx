'use client';

import { useRef } from 'react';
import { SPOTLIGHTS, SPOTLIGHT_INTRO } from '@/content/spotlights';
import { FramedImage } from '@/components/media/FramedImage';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import styles from './S03Spotlight.module.css';

/**
 * Hover push. Small on purpose: the image is already drifting on scroll, and a
 * larger jump reads as two unrelated motions rather than one surface.
 */
const HOVER_SCALE = 1.05;

/**
 * Four detailed projects. Cards alternate image side so the eye zig-zags down
 * the column.
 *
 * Each image drifts in 2.5D inside a fixed frame on scroll: the frame stays
 * put, the image (rendered oversized by FramedImage's `drifts` mode) travels
 * within it.
 */
export function S03Spotlight() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionReveal(rootRef, '[data-reveal]');

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      for (const frame of gsap.utils.toArray<HTMLElement>(`.${styles.mediaFrame}`)) {
        const image = frame.querySelector('img');
        if (!image) continue;
        gsap.fromTo(
          image,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  // Hover: the image pushes toward the viewer inside its fixed frame.
  //
  // Pointer-fine only — a hover tween on touch latches on first tap and never
  // reverses. quickTo rather than a fresh gsap.to per event: the interpolator
  // is created once per card and re-aimed, so flicking across the list does
  // not allocate a tween per crossing. The reverse is the same interpolator
  // aimed back at 1, so a fast pointer-out can never strand a card scaled up.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const teardowns: (() => void)[] = [];

      for (const card of gsap.utils.toArray<HTMLElement>(`.${styles.card}`)) {
        const image = card.querySelector<HTMLElement>('img');
        if (!image) continue;

        const scaleTo = gsap.quickTo(image, 'scale', { duration: 0.55, ease: 'power3.out' });
        const enter = () => {
          image.style.willChange = 'transform';
          scaleTo(HOVER_SCALE);
        };
        const leave = () => {
          // quickTo takes only a value, so the release hangs off the tween it
          // hands back rather than a vars object.
          scaleTo(1).eventCallback('onComplete', () => {
            image.style.willChange = '';
          });
        };

        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        teardowns.push(() => {
          card.removeEventListener('pointerenter', enter);
          card.removeEventListener('pointerleave', leave);
          image.style.willChange = '';
        });
      }

      return () => {
        for (const teardown of teardowns) teardown();
      };
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <section id="s03" ref={rootRef} className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">03</div>
      <div className={styles.squares} data-py="14" aria-hidden="true">
        <div className={styles.squaresInner} />
      </div>

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">03</span>
          <h2 className={styles.headTitle}>SPOTLIGHT</h2>
          <span className={styles.headNote}>04 OF 16 SELECTED</span>
        </header>

        <p className={styles.intro}>{SPOTLIGHT_INTRO}</p>

        <ul className={styles.list}>
          {SPOTLIGHTS.map((project, index) => (
            <li
              key={project.id}
              className={styles.card}
              data-reversed={index % 2 === 1 ? 'true' : 'false'}
              data-spotlight={project.id}
              data-reveal
            >
              <div className={styles.media}>
                <FramedImage
                  className={styles.mediaFrame}
                  src={project.image}
                  alt={`${project.name} — ${project.tagline.toLowerCase()}`}
                  width={1440}
                  height={900}
                  drifts
                />
                <div className={styles.chips} aria-hidden="true">
                  <span className={styles.chipCode}>{project.code}</span>
                  <span className={styles.chipYears}>{project.years}</span>
                </div>
              </div>

              <div className={styles.copy}>
                <div className={styles.tags}>
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className={`${styles.tag} ${tagIndex === 0 ? styles.tagLead : ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className={styles.name}>{project.name}</h3>
                <div className={styles.tagline}>{project.tagline}</div>
                <p className={styles.blurb}>{project.blurb}</p>

                <dl className={styles.meta}>
                  {project.meta.map((cell) => (
                    <div key={cell.label} className={styles.metaCell}>
                      <dt className={styles.metaLabel}>{cell.label}</dt>
                      <dd className={styles.metaValue}>{cell.value}</dd>
                    </div>
                  ))}
                  <div className={styles.stackCell}>
                    <dt className={styles.metaLabel}>STACK</dt>
                    <dd className={styles.stackValue}>{project.stack}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
