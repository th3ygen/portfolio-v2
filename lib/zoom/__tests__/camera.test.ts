import { describe, it, expect } from 'vitest';
import { scaleAt, depthAt, START_SCALE, END_SCALE } from '../camera';

describe('scaleAt', () => {
  it('starts with the whole clock in frame', () => {
    expect(scaleAt(0)).toBeCloseTo(START_SCALE, 10);
    expect(START_SCALE).toBe(1);
  });

  it('ends far enough in for the dot to cover a phone', () => {
    // A 390x844 phone: 0.39px per unit, 465px to the corner. The dot is 6
    // units; it has to be past the corner when the dive ends.
    expect(scaleAt(1)).toBeCloseTo(END_SCALE, 6);
    expect(6 * 0.39 * END_SCALE).toBeGreaterThan(465);
  });

  it('increases monotonically', () => {
    let previous = 0;
    for (let depth = 0; depth <= 1; depth += 0.005) {
      const scale = scaleAt(depth);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
  });

  it('pushes the lens by the same ratio for every equal step of depth', () => {
    // The point of driving depth: six equal ratchets in the rewind must read
    // as six equal pushes, at 2x and at 20x alike.
    const ratio = (depth: number) => scaleAt(depth + 0.05) / scaleAt(depth);
    for (const depth of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(ratio(depth)).toBeCloseTo(ratio(0.1), 8);
    }
  });

  it('clamps outside 0 to 1', () => {
    expect(scaleAt(-1)).toBeCloseTo(START_SCALE, 10);
    expect(scaleAt(2)).toBeCloseTo(END_SCALE, 6);
  });
});

describe('depthAt', () => {
  it('inverts scaleAt', () => {
    for (const depth of [0, 0.2, 0.5, 0.83, 1]) {
      expect(depthAt(scaleAt(depth))).toBeCloseTo(depth, 10);
    }
  });

  it('clamps scales outside the camera range', () => {
    expect(depthAt(0.1)).toBe(0);
    expect(depthAt(1000)).toBe(1);
  });
});
