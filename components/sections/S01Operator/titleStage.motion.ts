import { EASE } from '@/components/motion/tokens';
import { SUFFIX_FROM } from '@/content/operator';

/**
 * Every tunable number in the s01 title sequence, and the timing derived from
 * them. Nothing here touches the DOM or GSAP state — it is the sequence's
 * configuration, readable and changeable without reading the animation code.
 *
 * The beats used to be constants beside the timeline that consumed them, which
 * meant answering "how long does each title hold?" required reading a 360-line
 * effect. The numbers are the design; they belong somewhere you can see them
 * all at once.
 */

/**
 * The width below which the lockup stacks.
 *
 * A coupling, not a detail: the same breakpoint appears in
 * TitleStage.module.css, and the stacked layout is what makes the centring
 * offset zero. If the two drift apart, the sequence measures a row layout while
 * the page renders a column. CSS media queries cannot read a custom property,
 * so this number genuinely has to exist in both languages; there is a test on
 * them agreeing.
 */
export const STACK_BREAKPOINT = 760;

/**
 * Scroll distance the beats are spread across, as a percentage of viewport
 * height.
 *
 * The runway element in S01Operator takes its height from this value, so the
 * distance the pin is dragged through and the distance the timeline is mapped
 * onto are the same number by construction.
 */
export const RUNWAY_VH = 300;

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

/** How much of a slot the column spends actually moving. The rest it holds. */
const TRAVEL_OF_STEP = 0.45;

/** The instrument follows the suffix by half a slot, once the line is a phrase. */
const DIGITAL_LAG_OF_STEP = 0.5;

/**
 * Durations for the stepped instrument beats, in timeline units.
 *
 * Deliberately tiny. These are state changes, not transitions — the duration
 * exists only so `steps()` has something to divide.
 */
const FLICKER = { intro: 0.05, suffix: 0.03, slot: 0.05, readout: 0.035, part: 0.05 } as const;

export type BeatTiming = ReturnType<typeof beatTiming>;

/**
 * Resolves the timeline positions for a column of `titleCount` titles.
 *
 * Everything is derived from one slot length so the slots cannot come out
 * uneven. Dividing by `titleCount - 1` instead — which looks equally
 * reasonable — hands the opening and closing titles whatever is left over at
 * either end, which is exactly the lopsided pacing this replaced.
 */
export function beatTiming(titleCount: number) {
  const step = RECEDE / titleCount;
  const suffixIn = SUFFIX_FROM * step;

  return {
    step,
    /** The column dropping in. */
    introIn: INTRO_IN,
    /** When the column reaches the first title that reads against `dev`. */
    suffixIn,
    /** When the bracketed slot and the readout step on. */
    digitalIn: suffixIn + step * DIGITAL_LAG_OF_STEP,
    /** When the sequence releases its reading and everything goes hollow. */
    recede: RECEDE,

    /** When title `index` starts travelling into the reading slot. */
    travelAt: (index: number) => index * step - step * LEAD,
    /**
     * When title `index` becomes the reading — exactly on the slot boundary,
     * which is what makes every title hold for precisely one slot.
     */
    switchAt: (index: number) => index * step,

    /** The column's travel, and the lockup's one horizontal move. */
    travel: { duration: step * TRAVEL_OF_STEP, ease: EASE.travel } as const,
    flicker: FLICKER,
  };
}
