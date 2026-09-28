import { describe, it, expect } from 'vitest';
import { rewindLabel, zeroHour, REWIND_SWEEP } from '../clock';

describe('hand sweeps', () => {
  it('only ever turn counter-clockwise', () => {
    for (const angle of Object.values(REWIND_SWEEP)) {
      expect(angle).toBeLessThan(0);
    }
  });

  it('turn the second hand fastest and the hour hand slowest', () => {
    expect(Math.abs(REWIND_SWEEP.second)).toBeGreaterThan(Math.abs(REWIND_SWEEP.minute));
    expect(Math.abs(REWIND_SWEEP.minute)).toBeGreaterThan(Math.abs(REWIND_SWEEP.hour));
  });

  it('keep the rewind to a pace the eye can follow', () => {
    // Six full minute-hand turns in under two seconds read as a blur.
    expect(Math.abs(REWIND_SWEEP.minute)).toBeLessThanOrEqual(720);
  });
});

describe('zeroHour', () => {
  it('lands on a whole turn', () => {
    for (const angle of [-12, -140, -2300, -721]) {
      expect(Math.abs(zeroHour(angle) % 360)).toBe(0);
    }
  });

  it('is behind the hand, never ahead of it', () => {
    for (const angle of [-12, -140, -2300, -721]) {
      expect(zeroHour(angle)).toBeLessThan(angle);
      expect(angle - zeroHour(angle)).toBeLessThanOrEqual(360);
    }
  });

  it('still makes a full turn from twelve', () => {
    expect(zeroHour(-720)).toBe(-1080);
    expect(zeroHour(0)).toBe(-360);
  });
});

describe('rewindLabel', () => {
  it('reads the years left, zero-padded', () => {
    expect(rewindLabel(6)).toBe('REWIND 06Y');
    expect(rewindLabel(0)).toBe('REWIND 00Y');
  });

  it('never goes below zero', () => {
    expect(rewindLabel(-2)).toBe('REWIND 00Y');
  });
});
