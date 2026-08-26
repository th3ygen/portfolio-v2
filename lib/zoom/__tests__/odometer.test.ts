import { describe, it, expect } from 'vitest';
import { nextDigitState, digitsOf, ROLL_DURATION_S, ROLL_TRAVEL_PX, type DigitState } from '../odometer';

const idle = (value: number): DigitState => ({ value, rolling: false, from: value });

describe('nextDigitState', () => {
  it('rolls when the jump is exactly one step down', () => {
    expect(nextDigitState(idle(5), 4)).toEqual({ value: 4, rolling: true, from: 5 });
  });

  it('rolls when the jump is exactly one step up', () => {
    expect(nextDigitState(idle(4), 5)).toEqual({ value: 5, rolling: true, from: 4 });
  });

  it('lands instantly when a roll is already in flight', () => {
    const inFlight: DigitState = { value: 5, rolling: true, from: 6 };
    expect(nextDigitState(inFlight, 4)).toEqual({ value: 4, rolling: false, from: 4 });
  });

  it('lands instantly when the jump is more than one step', () => {
    expect(nextDigitState(idle(9), 4)).toEqual({ value: 4, rolling: false, from: 4 });
  });

  it('is a no-op when the target is unchanged', () => {
    const current = idle(7);
    expect(nextDigitState(current, 7)).toBe(current);
  });

  it('lands the right value after a fast flick through every intermediate', () => {
    // The regression guard. A fast scroll delivers each intermediate target
    // while the previous roll is still in flight; without the instant-land
    // rule the increments drop and the year lands wrong.
    let state = idle(6);
    for (const target of [5, 4, 3, 2, 1, 0]) {
      state = nextDigitState(state, target);
    }
    expect(state.value).toBe(0);
  });

  it('lands the right value when targets arrive out of order', () => {
    let state = idle(6);
    for (const target of [3, 9, 1, 7, 0]) {
      state = nextDigitState(state, target);
    }
    expect(state.value).toBe(0);
  });

  it('never reports rolling when it landed instantly', () => {
    const jumped = nextDigitState(idle(0), 9);
    expect(jumped.rolling).toBe(false);
    expect(jumped.from).toBe(jumped.value);
  });
});

describe('digitsOf', () => {
  it('splits a year into four digits', () => {
    expect(digitsOf(2026)).toEqual([2, 0, 2, 6]);
    expect(digitsOf(2020)).toEqual([2, 0, 2, 0]);
  });

  it('zero-pads shorter numbers to four places', () => {
    expect(digitsOf(7)).toEqual([0, 0, 0, 7]);
  });
});

describe('roll constants', () => {
  it('rises from below over the tuned duration', () => {
    expect(ROLL_TRAVEL_PX).toBeLessThan(0);
    expect(ROLL_DURATION_S).toBeGreaterThan(0);
  });
});
