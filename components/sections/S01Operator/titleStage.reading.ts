/**
 * The lockup's reading state: which title is current, what the counter says,
 * and whether `dev` is solid or hollow.
 *
 * One function owns all three because they are one fact stated three ways. Any
 * arrangement where the highlight and the readout are written from different
 * places is an arrangement where they can disagree on screen.
 */

export type ReadingTargets = {
  readonly items: readonly HTMLElement[];
  readonly readout: HTMLElement | null;
  readonly suffix: HTMLElement | null;
};

/** `1` -> `01`. The counter is fixed-width so it does not jitter as it counts. */
const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Returns the setter the timeline calls at every switch.
 *
 * Index `-1` means the sequence has released its reading: nothing is active,
 * `dev` falls back to the same hollow outline the titles already wear, and the
 * counter HOLDS at its last value rather than winding back to `00`, which read
 * as a fault rather than as an ending.
 */
export function createReading({ items, readout, suffix }: ReadingTargets) {
  return function activate(index: number): void {
    items.forEach((item, i) => {
      item.dataset.roleActive = i === index ? 'true' : 'false';
    });

    if (readout && index >= 0) {
      readout.textContent = `${pad(index + 1)}/${pad(items.length)}`;
    }

    if (suffix) {
      suffix.dataset.suffixHollow = index < 0 ? 'true' : 'false';
    }
  };
}
