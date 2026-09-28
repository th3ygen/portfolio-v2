import { describe, it, expect } from 'vitest';
import { GAP_MS, IDLE_METER, readGesture, type Meter } from '../gate';

/** Feed a stream of deltas `every` ms apart; returns the beats asked for. */
function stream(start: Meter, deltas: readonly number[], every: number, t0 = 0) {
  let meter = start;
  let steps = 0;
  deltas.forEach((delta, i) => {
    const reading = readGesture(meter, delta, t0 + i * every);
    meter = reading.meter;
    steps += reading.step;
  });
  return { meter, steps };
}

describe('readGesture', () => {
  it('answers the first notch of a gesture with one beat', () => {
    expect(readGesture(IDLE_METER, 100, 0).step).toBe(1);
    expect(readGesture(IDLE_METER, -100, 0).step).toBe(-1);
  });

  it('reads a trackpad swipe and its inertia as one beat, not sixty', () => {
    const swipe = Array.from({ length: 60 }, (_, i) => Math.max(1, 40 - i * 0.66));
    expect(stream(IDLE_METER, swipe, 16).steps).toBe(1);
  });

  it('reads a long, hard scroll as one beat too', () => {
    expect(stream(IDLE_METER, Array(80).fill(240), 16).steps).toBe(1);
  });

  it('starts a new gesture after a pause', () => {
    const first = stream(IDLE_METER, [100, 100, 100], 50);
    const second = readGesture(first.meter, 100, 100 + GAP_MS + 50);
    expect(first.steps + second.step).toBe(2);
  });

  it('starts a new gesture when the direction flips, with no pause', () => {
    const down = stream(IDLE_METER, [100, 100, 100], 50);
    expect(readGesture(down.meter, -100, 160).step).toBe(-1);
  });

  it('ignores zero deltas', () => {
    const reading = readGesture(IDLE_METER, 0, 0);
    expect(reading.step).toBe(0);
    expect(reading.meter).toBe(IDLE_METER);
  });
});
