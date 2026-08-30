'use client';

import { useRef } from 'react';
import { OPERATOR_OPENERS, OPERATOR_ROLES, SUFFIX_FROM } from '@/content/operator';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import styles from './TitleStage.module.css';

/** The fixed half of the lockup. Every title from SUFFIX_FROM reads against it. */
const SUFFIX = 'dev';

/** The column, in order: two opening lines, then the roles. */
const TITLES = [...OPERATOR_OPENERS, ...OPERATOR_ROLES] as const;

/**
 * The width below which the lockup stacks.
 *
 * Exported because it is a coupling, not a detail: the same breakpoint appears
 * in TitleStage.module.css, and the stacked layout is what makes the centring
 * offset zero. If the two drift apart, the sequence measures a row layout while
 * the page renders a column. There is a test on them agreeing.
 */
export const STACK_BREAKPOINT = 760;

/**
 * Scroll distance the beats are spread across, as a percentage of viewport
 * height.
 *
 * Exported because it is a coupling: .titleRunway in S01Operator.module.css
 * must be the same number. The runway is what the pinned stage is scrolled
 * through, and the timeline is mapped onto it — if they disagree the sequence
 * either finishes early and holds, or is cut off before it ends. Tested.
 */
export const RUNWAY_VH = 500;

/** Beat positions on a 0-1 timeline. Named because the order is the design. */
const INTRO_IN = 0;

/**
 * The cycle runs from zero to RECEDE, divided into one equal slot per title.
 *
 * It starts at zero rather than after an intro beat because the first title is
 * on screen from the first frame: give the grid any head start and that title
 * silently collects it on top of its own slot. Measured, an 0.06 head start
 * left the opening line holding about 1.5x what the others did.
 */
const RECEDE = 0.92;

/**
 * How far before its slot boundary a title's travel begins, as a fraction of a
 * slot. The switch itself lands exactly on the boundary — which is what keeps
 * the slots equal — while the column starts moving slightly earlier, so the
 * highlight never jumps ahead of the motion.
 */
const LEAD = 0.22;

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

      const pad = (value: number) => String(value).padStart(2, '0');

      const activate = (index: number) => {
        items.forEach((item, i) => {
          item.dataset.roleActive = i === index ? 'true' : 'false';
        });
        // The readout is driven from the same call that moves the highlight, so
        // it cannot disagree with what is on screen. Index -1 means the sequence
        // has released its reading; the count holds at its last value rather
        // than winding back to 00, which read as a fault.
        if (readoutRef.current && index >= 0) {
          readoutRef.current.textContent = `${pad(index + 1)}/${pad(items.length)}`;
        }
      };

      /** Row height, read live: the clamp on font-size makes it viewport-dependent. */
      const rowHeight = () => first.offsetHeight;

      /**
       * How far the row must slide so the READING is centred, per title.
       *
       * Centring the lockup box is not the same thing. The column is as wide as
       * the widest title and its rows are right-aligned, so a short title like
       * `im a` leaves dead space to its left inside the box — and centring the
       * box therefore pushes the visible words right of centre by half that
       * space. The correction is to shift left by half the column's unused
       * width, recomputed for whichever title is active.
       *
       * Before `dev` appears there is a second correction: the suffix and its
       * gap are part of the box but not yet part of the reading, so the row
       * shifts right by half of what they occupy.
       *
       * Zero when stacked: the two are on separate rows there and neither
       * displaces the other.
       */
      const centreFor = (index: number, stacked: boolean) => {
        if (stacked) return 0;
        const suffix = suffixRef.current;
        const title = items[index];
        if (!suffix || !title) return 0;

        const gap = Number.parseFloat(getComputedStyle(lockup).columnGap) || 0;
        const unused = column.getBoundingClientRect().width - title.getBoundingClientRect().width;
        const suffixShown = index >= SUFFIX_FROM;
        return -unused / 2 + (suffixShown ? 0 : (suffix.getBoundingClientRect().width + gap) / 2);
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
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: `+=${RUNWAY_VH}%`,
              scrub: 0.4,
              // Every measured value below is a function, and this is what makes
              // them re-run. Without it they are captured once and survive a
              // resize as numbers describing a layout that has changed.
              invalidateOnRefresh: true,
            },
          });

          // The column rides up one row per step. Step length is needed before
          // the beats below, because the suffix and the instrument are timed
          // against the step that reaches `im a`, not against fixed positions.
          // One equal slot per title, including the first and the last.
          // Dividing by (length - 1) instead gives the opening and closing
          // titles whatever is left over at either end, which is exactly the
          // lopsided pacing this replaced.
          const step = RECEDE / items.length;

          /** When the column reaches the first title that reads against `dev`. */
          const SUFFIX_IN = SUFFIX_FROM * step;
          /** The instrument follows the suffix, once the line is a whole phrase. */
          const DIGITAL_IN = SUFFIX_IN + step * 0.5;

          // fromTo, not a set() ahead of the timeline: fromTo renders its start
          // state immediately at build time AND recomputes it on refresh. A
          // .set() inside the timeline did neither — a scrubbed timeline parked
          // at progress 0 has never rendered, and setting progress to the value
          // it already holds is a no-op, so the opening state never reached the
          // DOM at all.
          timeline.fromTo(
            column,
            { opacity: 0, y: -80 },
            { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' },
            INTRO_IN,
          );

          // `hello world!` stands alone, so the row opens with the column on
          // centre and `dev` absent. Both land together at the step that reaches
          // `im a`: the suffix blinks on and the row slides over to give it half
          // the line. Stepped, like everything here that is not the column.
          const suffix = suffixRef.current;
          if (suffix) {
            timeline.fromTo(
              suffix,
              { opacity: 0 },
              { opacity: 1, duration: 0.03, ease: 'steps(2)' },
              SUFFIX_IN,
            );
          }

          // The brackets converge and the readout blinks on, both stepped. The
          // column's travel is the only smooth thing in this sequence; the
          // instrument around it snaps, the way the reticle's lock-on does.
          const slot = slotRef.current;
          const readout = readoutRef.current;
          if (slot) {
            timeline.fromTo(
              slot,
              { '--slot-spread': 46, '--slot-alpha': 0 },
              {
                '--slot-spread': 0,
                '--slot-alpha': 0.34,
                duration: 0.05,
                ease: 'steps(3)',
              },
              DIGITAL_IN,
            );
          }
          if (readout) {
            timeline.fromTo(
              readout,
              { opacity: 0 },
              { opacity: 1, duration: 0.035, ease: 'steps(2)' },
              DIGITAL_IN + 0.02,
            );
          }

          for (let index = 1; index < items.length; index += 1) {
            // The switch lands exactly on the slot boundary at index * step, so
            // every title holds for precisely one slot. The travel starts a
            // fraction earlier so the column is already moving when it happens.
            const at = index * step - step * LEAD;
            const travel = { duration: step * 0.45, ease: 'power3.inOut' } as const;
            timeline
              .to(column, { y: () => -index * rowHeight(), ...travel }, at)
              // The row re-centres on every switch, because each title leaves a
              // different amount of the column unused. fromTo on the first one
              // so the opening position is rendered at build time.
              .fromTo(
                lockup,
                index === 1 ? { x: () => centreFor(0, stacked) } : {},
                { x: () => centreFor(index, stacked), ...travel },
                at,
              )
              // Hard switch rather than a cross-fade: the column's travel is the
              // smooth part, and a title is either the current one or it is not.
              .set(items, { onComplete: () => activate(index) }, at + step * LEAD)
              .set(items, { onReverseComplete: () => activate(index - 1) }, at + step * LEAD);
          }

          // The lockup does NOT fade. The last title simply stops being the
          // active one, so it falls back to the hollow outline every other title
          // already wears — the sequence ends by releasing its reading rather
          // than by dimming the screen. The instrument steps out with it,
          // because a reading head pointed at nothing is just furniture.
          timeline
            .set(items, { onComplete: () => activate(-1) }, RECEDE)
            .set(items, { onReverseComplete: () => activate(items.length - 1) }, RECEDE);

          const parting = { duration: 0.05, ease: 'steps(2)' } as const;
          if (slot) timeline.to(slot, { '--slot-alpha': 0, ...parting }, RECEDE);
          if (readout) timeline.to(readout, { opacity: 0, ...parting }, RECEDE);
          if (suffix) timeline.to(suffix, { opacity: 0, ...parting }, RECEDE);
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
