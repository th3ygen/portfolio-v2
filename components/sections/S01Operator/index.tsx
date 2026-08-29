'use client';

import Image from 'next/image';
import { useRef } from 'react';
import {
  CORE_LOADOUT,
  LOADOUT_HEAD,
  OPERATOR,
  OPERATOR_CARD,
  PORTRAIT,
} from '@/content/operator';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './S01Operator.module.css';

/**
 * The operator section.
 *
 * The scan is scrubbed over a deliberately long window (top 78% → top -30%)
 * so it finishes on screen rather than below the fold.
 *
 * The portrait has no reveal of its own. It carried the page-wide box reveal
 * for a while, but the accent block sweeping across it fought the cutout
 * drifting over the top — two competing motions on one card. The cutout is the
 * treatment now.
 *
 * It is NOT wiped open by a moving edge. The earlier steps(5) clip-path wipe
 * was dropped once a real photograph went in: a hard horizontal cut across a
 * face is the visual signature of a half-loaded progressive JPEG, and `scrub`
 * parks it there whenever scrolling stops. It also never lined up with the
 * scan line — that line is positioned against the section while the clip was a
 * percentage of the portrait box, so the two edges were in different
 * coordinate spaces and on different durations. Do not reintroduce an
 * edge-based reveal here.
 */
export function S01Operator() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        // Final state, no scrub: copy in place. Neither the portrait nor the
        // cutout needs anything here — useBoxReveal has its own reduced-motion
        // branch, and the cutout is never hidden in the first place.
        gsap.set('[data-op-line]', {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
        });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 78%',
          end: 'top -30%',
          scrub: 0.45,
        },
      });

      timeline
        .fromTo(
          `.${styles.scan}`,
          { top: '0%', opacity: 1 },
          { top: '100%', opacity: 1, ease: 'none', duration: 0.8 },
          0,
        )
        .to(`.${styles.scan}`, { opacity: 0, duration: 0.2 }, 0.8)
        .fromTo(`.${styles.tag}`, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0)
        .to(`.${styles.tag}`, { opacity: 0, duration: 0.1 }, 0.55);

      timeline.fromTo(
        '[data-op-line]',
        { opacity: 0, y: 14, clipPath: 'inset(0 100% 0 0)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.07,
        },
        0.15,
      );
    },
    { scope: rootRef, revertOnUpdate: true },
  );

  return (
    <section id="s01" ref={rootRef} className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">
        01
      </div>
      <div className={styles.ticks} data-py="26" aria-hidden="true">
        {[22, 38, 16, 46].map((width, index) => (
          <div key={width} className={styles.tick}>
            <div className={styles.tickLine} style={{ width }} />
            <div className={index === 1 ? styles.tickBoxLive : styles.tickBox} />
          </div>
        ))}
      </div>
      <div className={styles.dots} data-py="-22" aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">
            01
          </span>
          <h2 className={styles.headTitle}>OPERATOR</h2>
          <span className={styles.headNote}>WHO IS RUNNING THIS</span>
        </header>

        <div className={styles.scan} aria-hidden="true" />
        <div className={styles.tag} data-tag="acquiring" aria-hidden="true">
          ACQUIRING OPERATOR
        </div>

        <div className={styles.grid}>
          <div className={styles.card} data-px="5">
            <div className={styles.cardFrame}>
              <div className={styles.portrait} data-lock={PORTRAIT.filename}>
                {PORTRAIT.src ? (
                  <Image
                    className={styles.portraitImage}
                    src={PORTRAIT.src}
                    alt={PORTRAIT.alt}
                    width={971}
                    height={1413}
                  />
                ) : (
                  <div className={styles.portraitPending} data-portrait-pending>
                    PORTRAIT PENDING
                    <br />
                    AWAITING SOURCE FILE
                  </div>
                )}
              </div>
              {/* Decorative duplicate: same subject, background removed,
                    drifting over the flat original to give the frame depth.
                    Announcing it again would just repeat the alt text. Sits
                    between the photo and .cardMeta on purpose — that paint
                    order is what sends the feet behind the meta bar. Never
                    faded or hidden: it is simply always there. */}
              {PORTRAIT.src ? (
                <div
                  className={styles.portraitAlpha}
                  data-portrait-alpha
                  data-py="5"
                  aria-hidden="true"
                >
                  <div className={styles.portraitAlphaInner} data-px="6">
                    <Image
                      className={styles.portraitAlphaImage}
                      src={PORTRAIT.alphaSrc}
                      alt=""
                      width={971}
                      height={1413}
                    />
                  </div>
                </div>
              ) : null}

              <div className={styles.cardMeta}>
                <span>{PORTRAIT.filename}</span>
                <span className={styles.verified}>VERIFIED</span>
              </div>
            </div>
            <div className={styles.cardCornerTL} aria-hidden="true" />
            <div className={styles.cardCornerBR} aria-hidden="true" />

            <dl className={styles.idCard}>
              {OPERATOR_CARD.map((row) => (
                <div key={row.label} className={styles.idRow}>
                  <dt className={styles.idLabel}>{row.label}</dt>
                  <dd className={row.label === 'CALL SIGN' ? styles.idCallSign : undefined}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className={styles.lead} data-box-reveal>
              {OPERATOR.lead[0]} <span className={styles.leadAccent}>{OPERATOR.lead[1]}</span>{' '}
              {OPERATOR.lead[2]}
            </p>

            {OPERATOR.body.map((block) => (
              <p key={block} className={styles.body} data-box-reveal>
                {block}
              </p>
            ))}

            <div className={styles.loadoutHead} data-op-line>
              <span className={styles.loadoutTitle}>{LOADOUT_HEAD.title}</span>
              <span className={styles.loadoutNote}>{LOADOUT_HEAD.note}</span>
            </div>

            <ul className={styles.loadout}>
              {CORE_LOADOUT.map((item) => (
                <li key={item.name} className={styles.loadoutItem} data-lock={item.name}>
                  <div className={styles.loadoutName} data-accent={item.accent ? 'true' : 'false'}>
                    {item.name}
                  </div>
                  <div className={styles.loadoutDetail}>{item.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
