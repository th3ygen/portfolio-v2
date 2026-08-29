'use client';

import { useRef } from 'react';
import { OPERATOR_ROLES } from '@/content/operator';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './TitleStage.module.css';

/** The fixed half of the lockup. Every title in the column reads against it. */
const SUFFIX = 'dev';

/** Opacity the lockup settles at once it becomes the section's backdrop. */
const GHOST = 0.055;

/** Beat positions on a 0-1 timeline. Named because the order is the design. */
const ROLE_IN = 0.05;
const CENTRE = 0.15;
const CYCLE_START = 0.3;
const CYCLE_END = 0.84;
const RECEDE = 0.87;

/**
 * The s01 opening sequence.
 *
 * `dev` alone at centre, the title column dropping in to its left and pushing
 * it right as the pair settles, then the column riding upward one title at a
 * time — every title is present as a hollow outline and the one in the active
 * slot is solid accent. The whole thing then recedes to a backdrop the rest of
 * the section sits on.
 *
 * The column replaced a per-letter glyph scramble, which read as noise rather
 * than as a system reporting state.
 *
 * The stage is held by a ScrollTrigger pin with `pinSpacing: false`, running
 * for the section's whole length, so the lockup stays put as a backdrop once
 * its beats are done. `position: sticky` was the obvious way to do that and is
 * inert here — measured, the stage tracked the section top exactly rather than
 * holding at zero. Pinning is also what the s04-to-s05 zoom already uses.
 *
 * `aria-hidden` throughout. The column holds five titles and only one is true
 * at a time; the section's real `<h2>` carries the accessible name.
 */
export function TitleStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const lockup = lockupRef.current;
      const column = columnRef.current;
      const stage = stageRef.current;
      if (!lockup || !column || !stage) return;

      const section = stage.parentElement;
      if (!section) return;

      const items = gsap.utils.toArray<HTMLElement>('[data-role-item]', column);
      const first = items[0];
      if (!first) return;

      const activate = (index: number) => {
        items.forEach((item, i) => {
          item.dataset.roleActive = i === index ? 'true' : 'false';
        });
      };

      if (prefersReducedMotion()) {
        // Final state only: the backdrop, parked on the last title.
        const last = items.length - 1;
        activate(last);
        gsap.set(column, { y: -last * first.offsetHeight });
        gsap.set(lockup, { opacity: GHOST });
        return;
      }

      // How far the pair must slide so `dev` reads as centred on its own first.
      // The lockup is a centred flex row with the column on the left, so `dev`
      // sits half the row's remainder to the RIGHT of centre; shifting the row
      // left by that much puts it on centre, and animating back to 0 is the
      // column arriving and pushing it right. The column's width is the widest
      // title's and does not change as titles switch, so `dev` never jumps
      // mid-cycle — and the titles are right-aligned inside it, so the gap
      // before `dev` is constant however short the active title is.
      const stacked = getComputedStyle(lockup).flexDirection === 'column';
      const gap = Number.parseFloat(getComputedStyle(lockup).columnGap) || 0;
      const offset = stacked ? 0 : -(column.getBoundingClientRect().width + gap) / 2;

      // Applied immediately, NOT as .set() calls inside the timeline. A scrubbed
      // timeline sitting at progress 0 has never rendered, and setting progress
      // to the value it already holds is a no-op — so the opening state never
      // reached the DOM and the lockup simply sat in its assembled HTML state.
      activate(0);
      gsap.set(lockup, { x: offset });
      gsap.set(column, { y: 0, opacity: 0 });
      gsap.set(column, { y: -80 });

      // Held for the section's whole length, not just the beats, so the lockup
      // is still there to be a backdrop. pinSpacing: false because the runway
      // below already provides the scroll distance — a spacer would add it twice.
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: stage,
        pinSpacing: false,
      });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          scrub: 0.4,
        },
      });

      timeline
        .to(column, { opacity: 1, y: 0, duration: 0.09, ease: 'power2.out' }, ROLE_IN)
        .to(lockup, { x: 0, duration: 0.12, ease: 'power3.inOut' }, CENTRE);

      // The column rides up one row per step. Row height is measured rather than
      // assumed: it is the display face's line box, which the clamp on font-size
      // makes viewport-dependent.
      const step = (CYCLE_END - CYCLE_START) / (items.length - 1);
      for (let index = 1; index < items.length; index += 1) {
        const at = CYCLE_START + (index - 1) * step;
        timeline
          .to(
            column,
            {
              y: () => -index * first.offsetHeight,
              duration: step * 0.62,
              ease: 'power3.inOut',
            },
            at,
          )
          // Hard switch rather than a cross-fade: the column's travel is the
          // smooth part, and a title is either the current one or it is not.
          .set(items, { onComplete: () => activate(index) }, at + step * 0.31)
          .set(items, { onReverseComplete: () => activate(index - 1) }, at + step * 0.31);
      }

      timeline.to(lockup, { opacity: GHOST, duration: 0.13, ease: 'power2.in' }, RECEDE);
    },
    { scope: stageRef, revertOnUpdate: true },
  );

  return (
    <div className={styles.stage} ref={stageRef} aria-hidden="true">
      <div className={styles.lockup} ref={lockupRef} data-title-lockup>
        <div className={styles.column} ref={columnRef} data-title-column>
          {OPERATOR_ROLES.map((title) => (
            <span key={title} className={styles.item} data-role-item data-role-active="false">
              {title}
            </span>
          ))}
        </div>
        <span className={styles.suffix} data-title-suffix>
          {SUFFIX}
        </span>
      </div>
    </div>
  );
}
