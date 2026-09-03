'use client';

import { useRef } from 'react';
import { OPERATOR_OPENERS, OPERATOR_ROLES } from '@/content/operator';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { EASE, SCRUB } from '@/components/motion/tokens';
import { buildBeats } from './titleStage.beats';
import { beatTiming, RUNWAY_VH, STACK_BREAKPOINT } from './titleStage.motion';
import { createReading } from './titleStage.reading';
import styles from './TitleStage.module.css';

/** The fixed half of the lockup. Every title from SUFFIX_FROM reads against it. */
const SUFFIX = 'dev';

/** The column, in order: two opening lines, then the roles. */
const TITLES = [...OPERATOR_OPENERS, ...OPERATOR_ROLES] as const;

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
 * This component owns four things and nothing else: the markup, the refs, the
 * two live measurements, and the responsive branch. The beat ORDER lives in
 * titleStage.beats.ts, the NUMBERS in titleStage.motion.ts, and the reading
 * state in titleStage.reading.ts. It was one 360-line effect holding all four.
 *
 * The stage is held by a ScrollTrigger pin with `pinSpacing: false`, running
 * for the section's whole length, so the lockup stays put as a backdrop once
 * its beats are done. `position: sticky` was the obvious way to do that and is
 * inert here — measured, the stage tracked the section top exactly rather than
 * holding at zero. Pinning is also what the s04-to-s05 zoom already uses.
 *
 * `aria-hidden` throughout. The column holds several titles and only one is
 * true at a time; the section's real `<h2>` carries the accessible name.
 */
export function TitleStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);

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

      const activate = createReading({
        items,
        readout: readoutRef.current,
        suffix: suffixRef.current,
      });

      /** Row height, read live: the clamp on font-size makes it viewport-dependent. */
      const rowHeight = () => first.offsetHeight;

      /**
       * How far the row must sit from the flex-centred position, in the ONE
       * state where that differs: before `dev` is on screen.
       *
       * The suffix and its gap are part of the lockup's box but not yet part of
       * the reading, so the row shifts right by half of what they occupy and
       * animates back to zero as `dev` arrives.
       *
       * Deliberately NOT recomputed per title. A per-title correction does
       * centre every reading exactly — the column is as wide as its widest title
       * and its rows are right-aligned, so a short title like `im a` leaves dead
       * space to its left and the words sit right of centre by half of it — but
       * paying for that means sliding the whole row up to ~130px on every
       * switch, motion layered on the column's own travel. The titles align to
       * the slot's right edge instead and the row holds still; the empty part of
       * the column reads as a field with a right-aligned value, which is the
       * logic the bracketed slot already states.
       *
       * Zero when stacked: the two are on separate rows there and neither
       * displaces the other.
       */
      const openingOffset = (stacked: boolean) => {
        if (stacked) return 0;
        const suffix = suffixRef.current;
        if (!suffix) return 0;
        const gap = Number.parseFloat(getComputedStyle(lockup).columnGap) || 0;
        return (suffix.getBoundingClientRect().width + gap) / 2;
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
          // TitleStage.module.css. There is a test on the two agreeing.
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
            // A static title card. Nothing is pinned here, so the stage simply
            // scrolls past like any other block; the runway collapses to zero
            // in CSS to match.
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
            defaults: { ease: EASE.linear },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: `+=${RUNWAY_VH}%`,
              scrub: SCRUB.tight,
              // Every measured value in the beats is a function, and this is
              // what makes them re-run. Without it they are captured once and
              // survive a resize as numbers describing a layout that has
              // changed.
              invalidateOnRefresh: true,
            },
          });

          buildBeats(
            timeline,
            {
              lockup,
              column,
              items,
              suffix: suffixRef.current,
              slot: slotRef.current,
              readout: readoutRef.current,
            },
            { rowHeight, openingOffset: () => openingOffset(stacked) },
            beatTiming(items.length),
            activate,
          );
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
          <div className={styles.slot} ref={slotRef} data-title-slot />
          <div className={styles.column} ref={columnRef} data-title-column>
            {TITLES.map((title) => (
              <span key={title} className={styles.item} data-role-item data-role-active="false">
                {title}
              </span>
            ))}
          </div>
        </div>

        <span className={styles.tail}>
          <span className={styles.suffix} ref={suffixRef} data-title-suffix>
            {SUFFIX}
          </span>
          <span className={styles.readout} ref={readoutRef} data-title-readout>
            01/{String(TITLES.length).padStart(2, '0')}
          </span>
        </span>
      </div>
    </div>
  );
}
