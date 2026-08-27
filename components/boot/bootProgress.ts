/**
 * Pure maths for the boot overlay, extracted so the timing can be proven
 * without a browser.
 *
 * Progress is eased rather than linear: the counter should sprint early and
 * settle late. The displayed value then lerps toward that target each frame,
 * which is what gives the numerals their mechanical stutter.
 */

export const BOOT_DURATION_MS = 2300;
/** Force-completes if a frame loop ever stalls. */
export const BOOT_TIMEOUT_MS = 4500;
export const LERP_RATE = 0.14;

/** Delay from the panel stagger to the clip-path wipe. */
export const WIPE_DELAY_MS = 300;
/** Delay from the wipe starting to teardown. */
export const TEARDOWN_DELAY_MS = 680;

export const SESSION_KEY = 'dil-sys-boot-played';

/**
 * Debug flag: outside production the boot replays on every load.
 *
 * The once-per-session gate is a visitor courtesy — nobody wants the cold boot
 * again on their third page view. In development it just hides the thing you
 * are trying to look at, and the only way back is clearing sessionStorage by
 * hand. Read as a function rather than a module constant so tests can stub
 * NODE_ENV and exercise both sides.
 */
export function bootDebugReplay(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export const LOG_THRESHOLDS = [18, 31, 47, 58, 72, 88, 99] as const;

export type BootLine = {
  readonly label: string;
  readonly value: string;
};

export const BOOT_LINES: readonly BootLine[] = [
  { label: '> POST ................', value: 'OK' },
  { label: '> MOUNT /operator .....', value: 'OK' },
  { label: '> LOAD loadout.cfg ....', value: '8 MODULES' },
  { label: '> INDEX systems .......', value: '16 RECORDS' },
  { label: '> UPLINK handshake ....', value: 'ESTABLISHED' },
  { label: '> RENDER pipeline .....', value: 'READY' },
  { label: '> SESSION OPEN', value: '' },
] as const;

export const BOOT_TASKS = [
  'INITIALISING',
  'MOUNTING /operator',
  'READING loadout.cfg',
  'INDEXING systems',
  'NEGOTIATING uplink',
  'WARMING pipeline',
  'SESSION OPEN',
] as const;

const STATE_LOAD_AT = 40;
const STATE_HANDOFF_AT = 85;

/** Eased progress 0–100 for a given elapsed time. */
export function bootTarget(elapsedMs: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs) / BOOT_DURATION_MS);
  return t ** 0.75 * 100;
}

/** Frame-rate-naive lerp. Falls back to the target if the value has gone bad. */
export function lerp(current: number, target: number, rate: number): number {
  if (!Number.isFinite(current)) return target;
  return current + (target - current) * rate;
}

/** How many of the seven log lines are visible at a given percentage. */
export function logIndexFor(percent: number): number {
  return LOG_THRESHOLDS.filter((threshold) => percent >= threshold).length;
}

/** The masthead state readout, which steps as the boot proceeds. */
export function stateLabelFor(percent: number): 'POST' | 'LOAD' | 'HANDOFF' {
  if (percent < STATE_LOAD_AT) return 'POST';
  if (percent < STATE_HANDOFF_AT) return 'LOAD';
  return 'HANDOFF';
}
