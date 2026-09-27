/**
 * The lockup's reading state: which title is current, what the counter says,
 * what the stack line under it says, and whether `dev` is solid or hollow.
 *
 * One function owns all four because they are one fact stated four ways. Any
 * arrangement where the highlight and the readout are written from different
 * places is an arrangement where they can disagree on screen.
 */

export type ReadingTargets = {
  readonly items: readonly HTMLElement[];
  readonly readout: HTMLElement | null;
  readonly suffix: HTMLElement | null;
  /** The stack line's text node holder. Optional: the counter works without it. */
  readonly stack?: HTMLElement | null;
  /** One line per title, index-aligned with `items`. Empty for the openers. */
  readonly stacks?: readonly string[];
  /** Whether a changed stack line flickers in. Off under reduced motion. */
  readonly flicker?: boolean;
};

/**
 * Stepped, like every other instrument beat: the line changes state rather
 * than fading, the way the readout and the reticle do.
 */
const FLICKER: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }];
const FLICKER_TIMING: KeyframeAnimationOptions = { duration: 240, easing: 'steps(4, end)' };

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
export function createReading({
  items,
  readout,
  suffix,
  stack = null,
  stacks = [],
  flicker = false,
}: ReadingTargets) {
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

    // Holds its last line at -1, like the counter. Leaving is the timeline's
    // job: the line steps out with the rest of the instrument.
    if (stack && index >= 0) {
      const line = stacks[index] ?? '';
      if (stack.textContent !== line) {
        stack.textContent = line;
        // jsdom has no Web Animations; the text is what matters there.
        if (flicker && line && typeof stack.animate === 'function') {
          stack.animate(FLICKER, FLICKER_TIMING);
        }
      }
    }
  };
}
