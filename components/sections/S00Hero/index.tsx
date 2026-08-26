'use client';

import { useRef } from 'react';
import { CV_HREF, HERO_CTAS, OPERATOR, SOCIALS } from '@/content/operator';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { DatamoshCanvas } from './DatamoshCanvas';
import { HudReadout } from './HudReadout';
import { Ticker } from './Ticker';
import styles from './S00Hero.module.css';

const VARIANT_CLASS = {
  solid: styles.ctaSolid,
  outline: styles.ctaOutline,
  ghost: styles.ctaGhost,
} as const;

/**
 * The hero. `bootDone` gates the intro timeline — it must not play until the
 * boot overlay has handed off, or the animation runs behind the overlay and is
 * over before anyone sees it.
 */
export function S00Hero({ bootDone }: { bootDone: boolean }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!bootDone) return;
      if (prefersReducedMotion()) return;

      gsap.from('[data-intro]', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      });

      // Parallax layers drift and fade as the hero scrolls away.
      gsap.to('[data-hero-parallax]', {
        y: -70,
        opacity: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: rootRef, dependencies: [bootDone], revertOnUpdate: true },
  );

  return (
    <section id="s00" ref={rootRef} className={styles.hero}>
      <DatamoshCanvas />

      <div className={styles.greebleStripes} data-px="6" data-hero-parallax aria-hidden="true" />
      <div className={styles.ringOuter} data-px="14" data-hero-parallax aria-hidden="true" />
      <div className={styles.ringInner} data-px="22" data-hero-parallax aria-hidden="true" />
      <div className={styles.bars} data-px="10" data-hero-parallax aria-hidden="true">
        <div className={styles.bar} style={{ width: '100%' }} />
        <div className={styles.bar} style={{ width: '72%' }} />
        <div className={styles.barAccent} style={{ width: '38%' }} />
        <div className={styles.bar} style={{ width: '88%' }} />
        <div className={styles.bar} style={{ width: '54%' }} />
        <div className={styles.bar} style={{ width: '66%' }} />
      </div>

      <div className={styles.grid}>
        <div data-px="-4">
          <div className={styles.status} data-intro>
            <span className={styles.pill}>{OPERATOR.title}</span>
            <span>{OPERATOR.since}</span>
            <span className={styles.dim} aria-hidden="true">·</span>
            <span>{OPERATOR.location}</span>
          </div>

          <div className={styles.prompt} data-intro>
            {OPERATOR.prompt}
            <span className={styles.cursor} aria-hidden="true">_</span>
          </div>

          <h1 className={styles.name} data-intro>
            <span className={styles.nameLine}>{OPERATOR.name[0]}</span>{' '}
            <span className={styles.nameAccent}>{OPERATOR.name[1]}</span>
          </h1>

          <p className={styles.intro} data-intro>{OPERATOR.intro}</p>

          <div className={styles.ctas} data-intro>
            {HERO_CTAS.map((cta) => (
              <a
                key={cta.label}
                href={cta.href === '/docs/cv.pdf' ? CV_HREF : cta.href}
                className={`${styles.cta} ${VARIANT_CLASS[cta.variant]}`}
                {...(cta.href.startsWith('/docs/') ? { download: true } : {})}
              >
                {cta.label}
              </a>
            ))}
          </div>

          <nav className={styles.socials} data-intro aria-label="Elsewhere">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={styles.social}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.label}
              </a>
            ))}
          </nav>
        </div>

        <div data-intro>
          <HudReadout />
        </div>
      </div>

      <Ticker />
    </section>
  );
}
