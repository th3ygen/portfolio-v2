/**
 * Camera curve for the s04 → s05 zoom.
 *
 * Scale is driven in log space because apparent zoom speed is the slope of
 * ln(scale), not of scale itself. A naive power2.out into power2.in chain
 * produced a visible velocity trough right at the word handoff. Instead a
 * single linear tween drives p, and the fraction below gives a fast first leg
 * followed by a constant-perceived-speed cruise, with no stall between them.
 */

export const START_SCALE = 0.55;
/** 62x left the background visible around the expanding dot. */
export const END_SCALE = 190;

/** Where the fast opening leg hands over to the cruise. */
export const SPLIT = 0.13;
/** How much of the total log-space travel the opening leg spends. */
export const SHARE = 0.22;

const L0 = Math.log(START_SCALE);
const L1 = Math.log(END_SCALE);

/** Fraction of total log-space travel completed at scroll progress `p`. */
export function zoomFraction(p: number): number {
  const t = Math.min(1, Math.max(0, p));
  if (t < SPLIT) return SHARE * (t / SPLIT);
  return SHARE + (1 - SHARE) * ((t - SPLIT) / (1 - SPLIT));
}

/** Absolute scale at scroll progress `p`. Never tween this value directly. */
export function zoomScale(p: number): number {
  return Math.exp(L0 + (L1 - L0) * zoomFraction(p));
}
