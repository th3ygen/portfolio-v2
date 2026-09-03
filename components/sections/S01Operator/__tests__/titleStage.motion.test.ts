import { describe, expect, it } from 'vitest';
import { beatTiming, RUNWAY_VH, STACK_BREAKPOINT } from '../titleStage.motion';
import { OPERATOR_OPENERS, OPERATOR_ROLES, SUFFIX_FROM } from '@/content/operator';

const TITLE_COUNT = OPERATOR_OPENERS.length + OPERATOR_ROLES.length;

/**
 * The pacing used to be checked only by scrolling a real browser. It is
 * arithmetic, so it can be checked here in milliseconds — the e2e run stays as
 * the proof that the arithmetic reaches the screen.
 */
describe('beatTiming', () => {
  it('gives every title an identical slice of the runway', () => {
    const t = beatTiming(TITLE_COUNT);
    const boundaries = Array.from({ length: TITLE_COUNT }, (_, i) => t.switchAt(i));
    const slots = boundaries.slice(1).map((at, i) => at - boundaries[i]!);

    for (const slot of slots) {
      expect(slot).toBeCloseTo(t.step, 10);
    }
    // The last title gets a full slot too: its boundary plus one step is
    // exactly where the sequence releases. Dividing by (count - 1) instead
    // leaves the opening and closing titles holding leftovers.
    expect(t.switchAt(TITLE_COUNT - 1) + t.step).toBeCloseTo(t.recede, 10);
  });

  it('starts each title moving before the switch it lands on', () => {
    const t = beatTiming(TITLE_COUNT);
    for (let i = 1; i < TITLE_COUNT; i += 1) {
      expect(t.travelAt(i)).toBeLessThan(t.switchAt(i));
      // ...but not so early that it eats the previous title's slot.
      expect(t.travelAt(i)).toBeGreaterThan(t.switchAt(i - 1));
    }
  });

  it('brings dev on at the first title that reads against it', () => {
    const t = beatTiming(TITLE_COUNT);
    expect(t.suffixIn).toBeCloseTo(t.switchAt(SUFFIX_FROM), 10);
    // The instrument follows the suffix rather than arriving with it, and both
    // land inside the runway.
    expect(t.digitalIn).toBeGreaterThan(t.suffixIn);
    expect(t.digitalIn).toBeLessThan(t.recede);
  });

  it('leaves the whole sequence inside the runway it is mapped onto', () => {
    const t = beatTiming(TITLE_COUNT);
    expect(t.introIn).toBeGreaterThanOrEqual(0);
    expect(t.recede).toBeLessThanOrEqual(1);
    expect(RUNWAY_VH).toBeGreaterThan(0);
    expect(STACK_BREAKPOINT).toBeGreaterThan(0);
  });
});
