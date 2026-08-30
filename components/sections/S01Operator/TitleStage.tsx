'use client';

import { useRef } from 'react';
import { OPERATOR_ROLES } from '@/content/operator';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import styles from './TitleStage.module.css';

/** The fixed half of the lockup. Every title in the column reads against it. */
const SUFFIX = 'dev';

/** Opacity the lockup settles at once it becomes the section's backdrop. */
const GHOST = 0.055;

/**
 * The width below which the lockup stacks.
 *
 * Exported because it is a coupling, not a detail: the same breakpoint appears
 * in TitleStage.module.css, and the stacked layout is what makes the centring
 * offset zero. If the two drift apart, the sequence measures a row layout while
 * the page renders a column. There is a test on them agreeing.
 */
export const STACK_BREAKPOINT = 760;

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
  const readoutRef = useRef<HTMLSpanElement>(null);

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

      const pad = (value: number) => String(value).padStart(2, '0');

      const activate = (index: number) => {
        items.forEach((item, i) => {
          item.dataset.roleActive = i === index ? 'true' : 'false';
        });
        // The readout is driven from the same call that moves the highlight, so
        // it cannot disagree with what is on screen.
        if (readoutRef.current) {
          readoutRef.current.textContent = `${pad(index + 1)}/${pad(items.length)}`;
        }
      };

      /** Row height, read live: the clamp on font-size makes it viewport-dependent. */
      const rowHeight = () => first.offsetHeight;

      /**
       * How far the pair must slide so `dev` reads as centred on its own first.
       *
       * The lockup is a centred flex row with the column on the left, so `dev`
       * sits half the row's remainder to the RIGHT of centre; shifting the row
       * left by that much puts it on centre, and animating back to 0 is the
       * column arriving and pushing it right. Zero when stacked — `dev` is
       * already centred under the column and sliding it would only move it off.
       */
      const centreOffset = (stacked: boolean) => {
        if (stacked) return 0;
        const gap = Number.parseFloat(getComputedStyle(lockup).columnGap) || 0;
        return -(column.getBoundingClientRect().width + gap) / 2;
      };

      // matchMedia rather than a one-shot check of the media queries. Everything
      // created inside a condition is reverted automatically when that condition
      // stops matching, so resizing across the breakpoint or toggling the motion
      // preference rebuilds the sequence instead of leaving values measured for
      // a layout that no longer exists.
      const mm = gsap.matchMedia();

      mm.add(
        {
          // `row` is not decoration: matchMedia runs the callback only when at
          // least one condition matches, so without the complement of `stacked`
          // a wide viewport with no motion preference matched nothing and the
          // whole sequence never built.
          //
          // Both widths MUST stay in step with the breakpoint in
          // TitleStage.module.css; the stacked layout is what makes the centring
          // offset zero. There is a test on the two agreeing.
          row: `(min-width: ${STACK_BREAKPOINT + 1}px)`,
          stacked: `(max-width: ${STACK_BREAKPOINT}px)`,
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { stacked, reduce } = context.conditions as {
            row: boolean;
            stacked: boolean;
            reduce: boolean;
          };

          if (reduce) {
            // A static title card, not the backdrop. Nothing is pinned here, so
            // the stage simply scrolls past like any other block — and at
            // backdrop opacity it would read as a blank screen rather than as a
            // title. The runway collapses to zero in CSS to match.
            const last = items.length - 1;
            activate(last);
            gsap.set(column, { y: -last * rowHeight() });
            return;
          }

          activate(0);

          // Held for the section's whole length, not just the beats, so the
          // lockup is still there to be a backdrop. pinSpacing: false because
          // the runway below already provides the scroll distance — a spacer
          // would add it twice.
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
              // Every measured value below is a function, and this is what makes
              // them re-run. Without it they are captured once and survive a
              // resize as numbers describing a layout that has changed.
              invalidateOnRefresh: true,
            },
          });

          // fromTo, not a set() ahead of the timeline: fromTo renders its start
          // state immediately at build time AND recomputes it on refresh. A
          // .set() inside the timeline did neither — a scrubbed timeline parked
          // at progress 0 has never rendered, and setting progress to the value
          // it already holds is a no-op, so the opening state never reached the
          // DOM at all.
          timeline
            .fromTo(
              column,
              { opacity: 0, y: -80 },
              { opacity: 1, y: 0, duration: 0.09, ease: 'power2.out' },
              ROLE_IN,
            )
            .fromTo(
              lockup,
              { x: () => centreOffset(stacked) },
              { x: 0, duration: 0.12, ease: 'power3.inOut' },
              CENTRE,
            );

          // The column rides up one row per step.
          const step = (CYCLE_END - CYCLE_START) / (items.length - 1);
          for (let index = 1; index < items.length; index += 1) {
            const at = CYCLE_START + (index - 1) * step;
            timeline
              .to(
                column,
                {
                  y: () => -index * rowHeight(),
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
      );

      // Kept even though useGSAP's context very likely reverts this too: revert
      // is idempotent, and the cost of being wrong about who owns the cleanup is
      // a leaked pin that keeps a section fixed forever.
      return () => mm.revert();
    },
    { scope: stageRef, revertOnUpdate: true },
  );

  return (
    <div className={styles.stage} ref={stageRef} aria-hidden="true">
      <div className={styles.lockup} ref={lockupRef} data-title-lockup>
        <div className={styles.columnWrap}>
          {/* The active slot, marked and static. The column rides through it,
              so the brackets say "this row is the reading" rather than
              decorating whichever title happens to be solid. */}
          <div className={styles.slot} data-title-slot />
          <div className={styles.column} ref={columnRef} data-title-column>
            {OPERATOR_ROLES.map((title) => (
              <span key={title} className={styles.item} data-role-item data-role-active="false">
                {title}
              </span>
            ))}
          </div>
        </div>

        <span className={styles.tail}>
          <span className={styles.suffix} data-title-suffix>
            {SUFFIX}
          </span>
          <span className={styles.readout} ref={readoutRef} data-title-readout>
            01/{String(OPERATOR_ROLES.length).padStart(2, '0')}
          </span>
        </span>
      </div>
    </div>
  );
}
