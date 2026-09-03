import { EASE } from '@/components/motion/tokens';
import type { BeatTiming } from './titleStage.motion';

/**
 * Builds the s01 title beats onto a timeline it is handed.
 *
 * It creates no trigger, reads no media query and measures nothing itself —
 * every measured value arrives as a function so the caller decides when it is
 * safe to read layout, and GSAP re-runs them on refresh. What is left is just
 * the order of the beats, which is the part worth reading on its own.
 */

export type BeatTargets = {
  readonly lockup: HTMLElement;
  readonly column: HTMLElement;
  readonly items: readonly HTMLElement[];
  readonly suffix: HTMLElement | null;
  readonly slot: HTMLElement | null;
  readonly readout: HTMLElement | null;
};

export type BeatMeasures = {
  /** Row height, read live: the clamp on font-size makes it viewport-dependent. */
  readonly rowHeight: () => number;
  /** Where the row sits before `dev` is on screen. Zero once it has arrived. */
  readonly openingOffset: () => number;
};

export function buildBeats(
  timeline: gsap.core.Timeline,
  targets: BeatTargets,
  measures: BeatMeasures,
  timing: BeatTiming,
  activate: (index: number) => void,
): gsap.core.Timeline {
  const { lockup, column, items, suffix, slot, readout } = targets;
  const { flicker } = timing;

  // fromTo, not a set() ahead of the timeline: fromTo renders its start state
  // immediately at build time AND recomputes it on refresh. A .set() inside the
  // timeline did neither — a scrubbed timeline parked at progress 0 has never
  // rendered, and setting progress to the value it already holds is a no-op, so
  // the opening state never reached the DOM at all.
  timeline.fromTo(
    column,
    { opacity: 0, y: -80 },
    { opacity: 1, y: 0, duration: flicker.intro, ease: EASE.enterSoft },
    timing.introIn,
  );

  // `hello world!` stands alone, so the row opens with the column on centre and
  // `dev` absent. Both land together at the step that reaches `im a`: the suffix
  // blinks on and the row slides over to give it half the line. Stepped, like
  // everything here that is not the column.
  if (suffix) {
    timeline
      .fromTo(
        suffix,
        { opacity: 0 },
        { opacity: 1, duration: flicker.suffix, ease: EASE.snap },
        timing.suffixIn,
      )
      // The only horizontal move in the sequence: the row giving up half the
      // line as `dev` takes its place on it.
      .fromTo(
        lockup,
        { x: () => measures.openingOffset() },
        { x: 0, ...timing.travel },
        timing.suffixIn,
      );
  }

  // The brackets converge and the readout blinks on, both stepped. The column's
  // travel is the only smooth thing in this sequence; the instrument around it
  // snaps, the way the reticle's lock-on does.
  if (slot) {
    timeline.fromTo(
      slot,
      { '--slot-spread': 46, '--slot-alpha': 0 },
      {
        '--slot-spread': 0,
        '--slot-alpha': 0.34,
        duration: flicker.slot,
        ease: EASE.snapFine,
      },
      timing.digitalIn,
    );
  }
  if (readout) {
    timeline.fromTo(
      readout,
      { opacity: 0 },
      { opacity: 1, duration: flicker.readout, ease: EASE.snap },
      timing.digitalIn + 0.02,
    );
  }

  /**
   * Arms the eased release. The transition itself lives in CSS, gated on this
   * attribute so it covers ONLY the final beat — leave it on and every hard
   * switch softens with it.
   *
   * Disarmed on the way back up rather than on the way down, and BEFORE the
   * switch it sits on, so scrolling back out of the release does not drag the
   * easing onto the switch below it.
   */
  const releasing = (on: boolean) => {
    lockup.dataset.releasing = on ? 'true' : 'false';
  };
  releasing(false);

  const lastIndex = items.length - 1;

  for (let index = 1; index < items.length; index += 1) {
    timeline
      .to(
        column,
        { y: () => -index * measures.rowHeight(), ...timing.travel },
        timing.travelAt(index),
      )
      // Hard switch rather than a cross-fade: the column's travel is the smooth
      // part, and a title is either the current one or it is not.
      .set(items, { onComplete: () => activate(index) }, timing.switchAt(index))
      .set(
        items,
        {
          onReverseComplete: () => {
            if (index === lastIndex) releasing(false);
            activate(index - 1);
          },
        },
        timing.switchAt(index),
      );
  }

  // The lockup does NOT fade. The last title simply stops being the active one,
  // so it falls back to the hollow outline every other title already wears — the
  // sequence ends by releasing its reading rather than by dimming the screen.
  // The instrument steps out with it, because a reading head pointed at nothing
  // is just furniture.
  timeline
    .set(
      items,
      {
        onComplete: () => {
          releasing(true);
          activate(-1);
        },
      },
      timing.recede,
    )
    // Still armed on the way back, so the reading is picked up as smoothly as
    // it was let go of.
    .set(items, { onReverseComplete: () => activate(lastIndex) }, timing.recede);

  const parting = { duration: flicker.part, ease: EASE.snap } as const;
  if (slot) timeline.to(slot, { '--slot-alpha': 0, ...parting }, timing.recede);
  if (readout) timeline.to(readout, { opacity: 0, ...parting }, timing.recede);
  // `dev` is NOT faded here. It goes hollow with the last title, in activate(-1)
  // — the whole lockup releases together rather than one half of it dimming out.

  return timeline;
}
