/**
 * The brutalist analog clock behind the s04 → s05 zoom.
 *
 * Hands spin counter-clockwise, matching the year rolling backwards. They keep
 * spinning through the entire zoom and never fade out — only the label
 * finishes early, alongside the year roll.
 */

export const REWIND_YEARS = 6;
/** The label lands here; the hands carry on to p = 1. */
export const REWIND_COMPLETE_AT = 0.34;

const HOUR_SWEEP = 90;
const MINUTE_SWEEP = 360;
const SECOND_SWEEP = 2160;

export type HandAngles = {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
};

/** Degrees for each hand at zoom progress `p`. Negative is counter-clockwise. */
export function handAngles(p: number): HandAngles {
  const t = Math.min(1, Math.max(0, p));
  return {
    hour: -(t * HOUR_SWEEP),
    minute: -(t * MINUTE_SWEEP),
    second: -(t * SECOND_SWEEP),
  };
}

/** The countdown readout beside the clock. */
export function rewindLabel(p: number): string {
  const progress = Math.min(Math.max(0, p) / REWIND_COMPLETE_AT, 1);
  const remaining = Math.round(REWIND_YEARS * (1 - progress));
  return `REWIND ${String(remaining).padStart(2, '0')}Y`;
}
