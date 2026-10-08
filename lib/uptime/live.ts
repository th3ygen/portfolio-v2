import type { ContributionDay } from '@/lib/github/contributions';

/**
 * The live readouts on the UPTIME summary — local time, shift, coffee and
 * pulse — as pure functions of the time (and, for the pulse, the GitHub
 * calendar), so the widgets only draw them.
 *
 * All in Malaysia time (GMT+8, no daylight saving), whatever the viewer's
 * own zone.
 */

const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface MytTime {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  /** 0 is Sunday. */
  readonly weekday: number;
  /** Hours since midnight, fractional: 13.5 is 13:30. */
  readonly clock: number;
}

export function myt(date: Date): MytTime {
  const d = new Date(date.getTime() + MYT_OFFSET_MS);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  return { hours, minutes, seconds, weekday: d.getUTCDay(), clock: hours + minutes / 60 + seconds / 3600 };
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Working hours, weekdays; and the hours asleep, every day. */
export const SHIFT = { start: 9, end: 18, sleep: 0, wake: 7 } as const;

export type Shift = 'ON SHIFT' | 'OFF SHIFT' | 'ASLEEP';

export function shift(t: MytTime): Shift {
  if (t.clock >= SHIFT.sleep && t.clock < SHIFT.wake) return 'ASLEEP';
  const weekday = t.weekday >= 1 && t.weekday <= 5;
  return weekday && t.clock >= SHIFT.start && t.clock < SHIFT.end ? 'ON SHIFT' : 'OFF SHIFT';
}

/**
 * Coffee: a cup at each of `cups` (hours, MYT) tops the level up to 100, and
 * it drains at `drain` a percent an hour — so it is empty well before the
 * next morning's first.
 */
export const COFFEE = { cups: [8.5, 13, 16.5], drain: 22 } as const;

export type CoffeeStatus = 'TOPPED UP' | 'NOMINAL' | 'LOW' | 'CRITICAL';

export interface Coffee {
  /** 0–100. */
  readonly level: number;
  readonly status: CoffeeStatus;
  /** Cups so far today, of the day's total. */
  readonly cups: number;
  /** The next cup, HH:MM — tomorrow's first once today's are done. */
  readonly next: string;
}

const hhmm = (hours: number) => `${pad2(Math.floor(hours))}:${pad2(Math.round((hours % 1) * 60))}`;

export function coffeeStatus(level: number): CoffeeStatus {
  return level >= 70 ? 'TOPPED UP' : level >= 35 ? 'NOMINAL' : level >= 15 ? 'LOW' : 'CRITICAL';
}

export function coffee(t: MytTime): Coffee {
  const had = COFFEE.cups.filter((cup) => cup <= t.clock);
  const last = had.at(-1);
  // Before the first cup it is last night's, long gone.
  const level = last === undefined ? 0 : Math.max(0, Math.round(100 - (t.clock - last) * COFFEE.drain));
  const next = COFFEE.cups.find((cup) => cup > t.clock) ?? COFFEE.cups[0]!;
  return { level, status: coffeeStatus(level), cups: had.length, next: hhmm(next) };
}

/**
 * The pulse: resting at `rest` beats a minute, rising toward `max` with the
 * last week's contributions — about two thirds of the way at `scale`.
 */
export const PULSE = { rest: 60, max: 120, scale: 30, days: 7 } as const;

export function lastWeek(days: readonly ContributionDay[]): number {
  return days.slice(-PULSE.days).reduce((sum, d) => sum + d.count, 0);
}

export function bpm(weekTotal: number): number {
  return Math.round(PULSE.rest + (PULSE.max - PULSE.rest) * (1 - Math.exp(-weekTotal / PULSE.scale)));
}
