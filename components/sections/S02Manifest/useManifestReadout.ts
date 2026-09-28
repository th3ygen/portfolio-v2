'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/components/motion/gsap';
import { EASE } from '@/components/motion/tokens';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { MANIFEST_COUNT } from '@/content/manifest';

/** How long the grid's frame takes to open down to its full height. */
const OPEN_S = 0.35;
/**
 * The print starts halfway through the opening, so the top rows are printing
 * as they come into the frame rather than after it stops.
 */
const PRINT_AT_S = OPEN_S / 2;
/**
 * The print plays at double its written timings. At 1x it ran the best part
 * of a second and a half end to end, which is a long time to hold a reader
 * who only wants to scan a list.
 */
const PRINT_SPEED = 2;

/** Gap between one category starting to print and the next. */
const CELL_GAP_S = 0.06;
/** The letter and the title each step on in this long. */
const MARK_S = 0.08;
/** A category's rows begin once its letter and title are up. */
const ROWS_AFTER_S = 0.1;
/** Gap between one row printing and the next, within a category. */
const ROW_GAP_S = 0.025;
/** How long a single row takes to step on. */
const ROW_S = 0.05;

/** Where the grid counts as entered. */
const START = 'top 80%';

/** The frame shut to its top edge, and fully open. */
const SHUT = 'inset(0% 0% 100% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

type Parts = {
  root: HTMLElement;
  grid: HTMLElement;
  cells: HTMLElement[];
  marks: HTMLElement[];
  rows: HTMLElement[];
  count: HTMLElement;
};

function partsOf(root: HTMLElement): Parts {
  return {
    root,
    grid: root.querySelector<HTMLElement>('[data-manifest-grid]')!,
    cells: gsap.utils.toArray<HTMLElement>('[data-manifest-cell]', root),
    marks: gsap.utils.toArray<HTMLElement>('[data-manifest-mark]', root),
    rows: gsap.utils.toArray<HTMLElement>('[data-manifest-cell] li', root),
    count: root.querySelector<HTMLElement>('[data-manifest-count]')!,
  };
}

function writeCount(count: HTMLElement, value: number): void {
  count.textContent = String(value).padStart(2, '0');
}

/**
 * Tween the head count from zero to `to`.
 *
 * Rounded on every update rather than eased onto integers: a count that shows
 * 41.6 is not a count, and the rounding is what makes it step like a readout
 * instead of sliding like a gauge.
 */
function countTo(count: HTMLElement, to: number, duration: number): gsap.core.Tween {
  const state = { n: 0 };
  return gsap.to(state, {
    n: to,
    duration,
    ease: EASE.linear,
    onUpdate: () => writeCount(count, Math.round(state.n)),
  });
}

/**
 * The inventory reads out: A to I, each category's letter and title stepping
 * on and then its rows printing one at a time, while the head counts up with
 * them. When the count lands, the rows that are also in the s01 loadout take
 * their [EQ] tag.
 *
 * Rows step rather than rise. This section is a list being read out, and a
 * row that floats up 26px reads as a card arriving, which is the treatment the
 * rest of the page uses and exactly what this section is not.
 */
function print(p: Parts): gsap.core.Timeline {
  const tl = gsap.timeline();
  p.cells.forEach((cell, index) => {
    const at = index * CELL_GAP_S;
    tl.to(
      cell.querySelectorAll('[data-manifest-mark]'),
      { opacity: 1, duration: MARK_S, ease: EASE.snap, stagger: MARK_S / 2 },
      at,
    );
    tl.to(
      cell.querySelectorAll('li'),
      { opacity: 1, duration: ROW_S, ease: EASE.snap, stagger: ROW_GAP_S },
      at + ROWS_AFTER_S,
    );
  });
  // Counts from the first row, not the first letter, so the number never
  // claims rows that are not on the screen yet.
  tl.add(countTo(p.count, MANIFEST_COUNT, tl.duration() - ROWS_AFTER_S), ROWS_AFTER_S);
  // The tag itself is a stepped CSS transition, staggered by --eq-i, so the
  // timeline only has to say when.
  tl.call(() => {
    p.root.dataset.equipped = 'on';
  });
  return tl;
}

/**
 * The s02 manifest's reveal on view: the grid's frame opens downward from the
 * top edge while the inventory prints into it.
 *
 * The opening is a clip, not a height. The grid keeps its full height the
 * whole time, so nothing below it moves while the reader is scrolling — the
 * pinned s04→s05 zoom measures its start from this layout, and a grid that
 * grew on entry would leave that measurement stale.
 *
 * Fires once. A read-out that replays every time the grid re-enters the
 * viewport reads as a glitch, the same reason the box reveal fires once.
 */
export function useManifestReadout(scope: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      if (!scope.current || prefersReducedMotion()) return;
      const p = partsOf(scope.current);

      gsap.set(p.grid, { clipPath: SHUT });
      gsap.set([...p.marks, ...p.rows], { opacity: 0 });
      writeCount(p.count, 0);
      p.root.dataset.equipped = 'off';

      gsap
        .timeline({
          scrollTrigger: { trigger: p.grid, start: START, once: true },
          onComplete: () => {
            gsap.set(p.grid, { clearProps: 'clipPath' });
          },
        })
        .to(p.grid, { clipPath: OPEN, duration: OPEN_S, ease: EASE.enter })
        .add(print(p).timeScale(PRINT_SPEED), PRINT_AT_S);
    },
    { scope },
  );
}
