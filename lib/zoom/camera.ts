/**
 * Camera curve for the s04 → s05 rewind.
 *
 * The camera is positioned by DEPTH, not by scale: depth is the fraction of
 * the total log-space travel from START_SCALE to END_SCALE. Apparent zoom
 * speed is the slope of ln(scale), so equal steps of depth read as equal
 * pushes of the lens whether the camera is at 1x or at 100x — which is what
 * lets the rewind ratchet the camera in six identical notches, and lets the
 * dive accelerate with an ordinary ease instead of a double exponential.
 *
 * Tween depth, never scale.
 */

/** The whole clock, filling the shorter side of the viewport. */
export const START_SCALE = 1;
/**
 * Far enough that the year's dot alone covers the viewport's corners at the
 * end of the dive, on a phone held upright — the worst case, where a unit is
 * smallest against the diagonal.
 */
export const END_SCALE = 260;

const L0 = Math.log(START_SCALE);
const L1 = Math.log(END_SCALE);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Absolute scale at `depth`, clamped to [0, 1]. */
export function scaleAt(depth: number): number {
  return Math.exp(L0 + (L1 - L0) * clamp01(depth));
}

/** The depth at which the camera reaches `scale`. The inverse of scaleAt. */
export function depthAt(scale: number): number {
  return clamp01((Math.log(scale) - L0) / (L1 - L0));
}
