import { describe, it, expect } from 'vitest';
import { handAngles, rewindLabel, REWIND_YEARS, REWIND_COMPLETE_AT } from '../clock';

describe('handAngles', () => {
  it('is at rest at zero progress', () => {
    const { hour, minute, second } = handAngles(0);
    expect(hour).toBeCloseTo(0, 10);
    expect(minute).toBeCloseTo(0, 10);
    expect(second).toBeCloseTo(0, 10);
  });

  it('spins counter-clockwise — every angle is negative', () => {
    const { hour, minute, second } = handAngles(0.5);
    expect(hour).toBeLessThan(0);
    expect(minute).toBeLessThan(0);
    expect(second).toBeLessThan(0);
  });

  it('completes six second-hand turns, one minute turn, a quarter hour turn', () => {
    expect(handAngles(1).second).toBe(-2160);
    expect(handAngles(1).minute).toBe(-360);
    expect(handAngles(1).hour).toBe(-90);
  });

  it('moves the second hand fastest and the hour hand slowest', () => {
    const { hour, minute, second } = handAngles(0.4);
    expect(Math.abs(second)).toBeGreaterThan(Math.abs(minute));
    expect(Math.abs(minute)).toBeGreaterThan(Math.abs(hour));
  });

  it('rotates monotonically', () => {
    let previous = 1;
    for (let p = 0; p <= 1; p += 0.01) {
      const { second } = handAngles(p);
      expect(second).toBeLessThanOrEqual(previous);
      previous = second;
    }
  });

  it('clamps outside 0 to 1', () => {
    expect(handAngles(2).second).toBe(-2160);
    expect(handAngles(-1).second).toBeCloseTo(0, 10);
  });
});

describe('rewindLabel', () => {
  it('starts at the full rewind', () => {
    expect(rewindLabel(0)).toBe('REWIND 06Y');
    expect(REWIND_YEARS).toBe(6);
  });

  it('finishes the countdown before the zoom ends, not with it', () => {
    // The label lands with the year roll; the hands keep spinning after.
    expect(rewindLabel(REWIND_COMPLETE_AT)).toBe('REWIND 00Y');
    expect(REWIND_COMPLETE_AT).toBeLessThan(1);
  });

  it('stays at zero past completion while the hands keep going', () => {
    expect(rewindLabel(0.7)).toBe('REWIND 00Y');
    expect(rewindLabel(1)).toBe('REWIND 00Y');
  });

  it('zero-pads to two digits throughout', () => {
    for (let p = 0; p <= 1; p += 0.02) {
      expect(rewindLabel(p)).toMatch(/^REWIND \d{2}Y$/);
    }
  });

  it('counts down rather than up', () => {
    const at = (p: number) => Number(rewindLabel(p).match(/(\d{2})Y/)?.[1]);
    let previous = REWIND_YEARS;
    for (let p = 0; p <= 1; p += 0.02) {
      const value = at(p);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });
});
