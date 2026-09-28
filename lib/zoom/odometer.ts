/**
 * Digit-roll state machine for the year counters: the one in the s04 → s05
 * zoom, and the sticky year in s05.
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

/**
 * How the year reaches the counter.
 *
 * `scrub`: fed continuously by a scrubbed tween, so intermediates can arrive
 * faster than a roll takes — the zoom's rewind. The instant-land rule applies.
 *
 * `discrete`: set once per step by something that is not scrubbing it — the
 * s05 year, changing once per post, in jumps like 2020 to 2022. Every change
 * rolls, whatever its size. `rolling` also has to be cleared here: in scrub
 * mode it is always superseded by the next frame, but a discrete counter can
 * sit for a whole post with it still set, and a stale flag would make the
 * next change land instantly and an unchanged digit roll again.
 */
export type OdometerMode = 'scrub' | 'discrete';

export function nextDigitState(
  current: DigitState,
  target: number,
  mode: OdometerMode = 'scrub',
): DigitState {
  if (mode === 'discrete') {
    if (current.value === target) {
      return current.rolling ? { value: target, rolling: false, from: target } : current;
    }
    return { value: target, rolling: true, from: current.value };
  }

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
