'use client';

import { useRef } from 'react';
import { SPOTLIGHTS, SPOTLIGHT_INTRO } from '@/content/spotlights';
import { FramedImage } from '@/components/media/FramedImage';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './S03Spotlight.module.css';

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
