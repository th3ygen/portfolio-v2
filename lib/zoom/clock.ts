/**
 * The brutalist analog clock behind the s04 → s05 rewind.
 *
 * Hands only ever turn counter-clockwise, matching the years going back, and
 * never whip: a gentle spin-up as the clock assembles, one long eased sweep
 * across the whole rewind, and a turn round to twelve — zero hour — as the
 * camera locks onto the dot.
 */

/** Where the spin-up leaves each hand. Negative is counter-clockwise. */
export const SPIN_UP = { hour: -8, minute: -60, second: -180 } as const;

/**
 * How far each hand turns across the whole rewind. Two turns of the minute
 * hand over six years, not six: fast enough to read as time running
 * backwards, slow enough to follow.
 */
export const REWIND_SWEEP = { hour: -60, minute: -720, second: -1440 } as const;

/**
 * The next twelve o'clock behind `angle`, going backwards.
 *
 * Strictly behind: a hand already at twelve still makes a full turn, because
 * zero hour is a hand arriving, not a hand that happens to be there.
 */
export function zeroHour(angle: number): number {
  return (Math.ceil(angle / 360) - 1) * 360;
}

/** The countdown readout under the clock. */
export function rewindLabel(yearsLeft: number): string {
  const years = Math.max(0, Math.round(yearsLeft));
  return `REWIND ${String(years).padStart(2, '0')}Y`;
}
