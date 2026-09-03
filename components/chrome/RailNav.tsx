'use client';

import { useRef, useState } from 'react';
import { SECTIONS } from '@/content/sections';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { EASE, SCRUB } from '@/components/motion/tokens';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './RailNav.module.css';

/**
 * Fixed left rail. Carries its own progress track on its right edge — the
 * handoff's "right-side progress track" means the right side of the rail, not
 * of the viewport.
 */
export function RailNav() {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      if (progressRef.current && !reduced) {
        gsap.to(progressRef.current, {
          scaleY: 1,
          ease: EASE.linear,
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: SCRUB.locked },
        });
      } else if (progressRef.current) {
        gsap.set(progressRef.current, { scaleY: 1 });
      }

      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        ScrollTrigger.create({
          trigger: element,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActive(section.id);
          },
        });
      }
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <nav ref={rootRef} className={styles.rail} data-rail-nav aria-label="Section navigation">
      <div className={styles.track} aria-hidden="true">
        <div ref={progressRef} className={styles.progress} />
      </div>
      <div className={styles.indicator} aria-hidden="true" />
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={styles.link}
          {...(active === section.id ? { 'aria-current': 'true' as const } : {})}
        >
          <span className={styles.number} aria-hidden="true">{section.number}</span>
          <span className={styles.label}>{section.rail}</span>
        </a>
      ))}
    </nav>
  );
}
