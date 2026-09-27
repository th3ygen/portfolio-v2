import { describe, expect, it, vi } from 'vitest';
import { createReading } from '../titleStage.reading';

function makeTargets(count: number) {
  const items = Array.from({ length: count }, () => document.createElement('span'));
  const readout = document.createElement('span');
  const suffix = document.createElement('span');
  return { items, readout, suffix };
}

describe('createReading', () => {
  it('marks exactly one title active and counts it', () => {
    const t = makeTargets(7);
    const activate = createReading(t);

    activate(3);

    const active = t.items.filter((i) => i.dataset.roleActive === 'true');
    expect(active).toHaveLength(1);
    expect(t.items[3]!.dataset.roleActive).toBe('true');
    expect(t.readout.textContent).toBe('04/07');
    expect(t.suffix.dataset.suffixHollow).toBe('false');
  });

  it('releases the reading at -1 without winding the counter back', () => {
    const t = makeTargets(7);
    const activate = createReading(t);

    activate(6);
    activate(-1);

    expect(t.items.some((i) => i.dataset.roleActive === 'true')).toBe(false);
    // Holds at its last value. Rewinding to 00 read as a fault rather than as
    // an ending.
    expect(t.readout.textContent).toBe('07/07');
    // `dev` goes hollow with the titles rather than fading out on its own.
    expect(t.suffix.dataset.suffixHollow).toBe('true');
  });

  it('works with no readout or suffix present', () => {
    const items = [document.createElement('span')];
    const activate = createReading({ items, readout: null, suffix: null });
    expect(() => activate(0)).not.toThrow();
    expect(items[0]!.dataset.roleActive).toBe('true');
  });

  it('writes the stack line for the reading, and holds it on release', () => {
    const t = makeTargets(3);
    const stack = document.createElement('span');
    const activate = createReading({ ...t, stack, stacks: ['', 'a · b', 'c · d'] });

    activate(0);
    expect(stack.textContent).toBe('');
    activate(2);
    expect(stack.textContent).toBe('c · d');
    activate(-1);
    // Like the counter: the timeline steps it out, the reading does not wipe it.
    expect(stack.textContent).toBe('c · d');
  });

  it('flickers the stack line only when it changes and flicker is on', () => {
    const t = makeTargets(3);
    const stack = document.createElement('span');
    const animate = vi.fn();
    stack.animate = animate as unknown as HTMLElement['animate'];

    createReading({ ...t, stack, stacks: ['', 'x', 'x'] })(1);
    expect(animate).not.toHaveBeenCalled();

    const activate = createReading({ ...t, stack, stacks: ['', 'y', 'y'], flicker: true });
    activate(1);
    activate(2);
    expect(animate).toHaveBeenCalledTimes(1);
  });
});
