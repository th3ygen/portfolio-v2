/**
 * Digit-roll state machine for the year counter in the s04 → s05 zoom.
 *
 * The numeric counter is the single source of truth. A digit lands instantly —
 * skipping its roll — if a roll is already in flight, or if the jump is more
 * than one step. Without that rule a fast scroll flick delivers intermediate
 * targets faster than the animation can consume them, increments get dropped,
 * and the year lands on the wrong number.
 */

export type DigitState = {
  readonly value: number;
  readonly rolling: boolean;
  /** The glyph being rolled away from; equals `value` when idle. */
  readonly from: number;
};

export const ROLL_DURATION_S = 0.34;
/** The incoming glyph rises from below, so travel is negative. */
export const ROLL_TRAVEL_PX = -84;

export function nextDigitState(current: DigitState, target: number): DigitState {
  if (current.value === target) return current;

  const isSingleStep = Math.abs(current.value - target) === 1;
  if (current.rolling || !isSingleStep) {
    return { value: target, rolling: false, from: target };
  }

  return { value: target, rolling: true, from: current.value };
}

/** Splits a year into four zero-padded digits, one per odometer window. */
export function digitsOf(year: number): readonly number[] {
  return String(Math.max(0, Math.trunc(year)))
    .padStart(4, '0')
    .slice(-4)
    .split('')
    .map(Number);
}
