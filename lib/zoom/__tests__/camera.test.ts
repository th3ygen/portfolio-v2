import { describe, it, expect } from 'vitest';
import { zoomScale, zoomFraction, START_SCALE, END_SCALE, SPLIT, SHARE } from '../camera';

describe('zoomFraction', () => {
  it('is zero at the start', () => {
    expect(zoomFraction(0)).toBe(0);
  });

  it('has spent SHARE of its travel by SPLIT', () => {
    expect(zoomFraction(SPLIT)).toBeCloseTo(SHARE, 10);
  });

  it('is one at the end', () => {
    expect(zoomFraction(1)).toBeCloseTo(1, 10);
  });

  it('is continuous at the split point', () => {
    const before = zoomFraction(SPLIT - 1e-9);
    const after = zoomFraction(SPLIT + 1e-9);
    expect(Math.abs(after - before)).toBeLessThan(1e-6);
  });

  it('increases monotonically', () => {
    let previous = -1;
    for (let p = 0; p <= 1; p += 0.005) {
      const value = zoomFraction(p);
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });
});

describe('zoomScale', () => {
  it('starts at 0.55', () => {
    expect(zoomScale(0)).toBeCloseTo(START_SCALE, 10);
    expect(START_SCALE).toBe(0.55);
  });

  it('ends at 190, not 62', () => {
    // At 62x the background was still visible around the expanding dot when
    // the zoom finished. 190 is the tuned value, not a guess.
    expect(zoomScale(1)).toBeCloseTo(END_SCALE, 6);
    expect(END_SCALE).toBe(190);
  });

  it('increases monotonically', () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const scale = zoomScale(p);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
  });

  it('has no velocity trough — log-space slope never dips below the cruise rate', () => {
    // Apparent zoom speed is the slope of ln(scale). A naive power2.out into
    // power2.in produced a visible stall at the word handoff; this is the
    // regression guard for it.
    const step = 0.002;
    const slopeAt = (p: number) =>
      (Math.log(zoomScale(p + step)) - Math.log(zoomScale(p))) / step;
    const cruise = slopeAt(0.5);
    for (let p = SPLIT + step; p < 1 - step * 2; p += step) {
      expect(slopeAt(p)).toBeGreaterThan(cruise * 0.99);
    }
  });

  it('pushes faster than cruise while UPTIME is still on screen', () => {
    const step = 0.002;
    const slopeAt = (p: number) =>
      (Math.log(zoomScale(p + step)) - Math.log(zoomScale(p))) / step;
    expect(slopeAt(0.05)).toBeGreaterThan(slopeAt(0.5));
  });

  it('holds a constant perceived speed after the split', () => {
    const step = 0.002;
    const slopeAt = (p: number) =>
      (Math.log(zoomScale(p + step)) - Math.log(zoomScale(p))) / step;
    const samples = [0.3, 0.5, 0.7, 0.9].map(slopeAt);
    for (const sample of samples) {
      expect(sample).toBeCloseTo(samples[0] ?? 0, 6);
    }
  });

  it('clamps outside 0 to 1', () => {
    expect(zoomScale(-1)).toBeCloseTo(START_SCALE, 10);
    expect(zoomScale(2)).toBeCloseTo(END_SCALE, 6);
  });
});
