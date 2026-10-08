import { describe, expect, it } from 'vitest';
import { bpm, coffee, coffeeStatus, lastWeek, myt, shift } from '../live';

/** A moment in Malaysia time, as the UTC instant it is. */
const at = (iso: string) => myt(new Date(`${iso}+08:00`));

describe('myt', () => {
  it('reads the time in Malaysia whatever the zone of the Date', () => {
    const t = myt(new Date('2026-09-28T16:05:09Z'));
    expect([t.hours, t.minutes, t.seconds]).toEqual([0, 5, 9]);
    // Past midnight in KL: already Tuesday.
    expect(t.weekday).toBe(2);
    expect(t.clock).toBeCloseTo(0.0858, 3);
  });
});

describe('shift', () => {
  it('is on shift in weekday working hours', () => {
    expect(shift(at('2026-09-28T10:00:00'))).toBe('ON SHIFT');
  });
  it('is off shift in the evening, and all weekend', () => {
    expect(shift(at('2026-09-28T19:30:00'))).toBe('OFF SHIFT');
    expect(shift(at('2026-09-27T11:00:00'))).toBe('OFF SHIFT');
  });
  it('is asleep after midnight, any day', () => {
    expect(shift(at('2026-09-29T03:00:00'))).toBe('ASLEEP');
    expect(shift(at('2026-09-27T06:59:00'))).toBe('ASLEEP');
  });
});

describe('coffee', () => {
  it('is empty before the first cup, which is next', () => {
    expect(coffee(at('2026-09-28T07:00:00'))).toEqual({ level: 0, status: 'CRITICAL', cups: 0, next: '08:30' });
  });
  it('is topped up by a cup and drains after it', () => {
    expect(coffee(at('2026-09-28T08:30:00')).level).toBe(100);
    const later = coffee(at('2026-09-28T10:30:00'));
    expect(later).toEqual({ level: 56, status: 'NOMINAL', cups: 1, next: '13:00' });
  });
  it('points at tomorrow once the day is done, and runs dry by night', () => {
    const night = coffee(at('2026-09-28T23:00:00'));
    expect(night).toEqual({ level: 0, status: 'CRITICAL', cups: 3, next: '08:30' });
  });
  it('names the level', () => {
    expect([100, 70, 69, 35, 34, 15, 14, 0].map(coffeeStatus)).toEqual([
      'TOPPED UP', 'TOPPED UP', 'NOMINAL', 'NOMINAL', 'LOW', 'LOW', 'CRITICAL', 'CRITICAL',
    ]);
  });
});

describe('pulse', () => {
  it('rests at 60 with nothing pushed, and rises with the week toward 120', () => {
    expect(bpm(0)).toBe(60);
    expect(bpm(30)).toBe(98);
    expect(bpm(500)).toBe(120);
  });
  it('counts the last seven days only', () => {
    const days = Array.from({ length: 10 }, (_, i) => ({ date: `2026-09-${pad(i + 1)}`, level: 1 as const, count: i + 1 }));
    expect(lastWeek(days)).toBe(4 + 5 + 6 + 7 + 8 + 9 + 10);
  });
});

function pad(n: number) {
  return String(n).padStart(2, '0');
}
