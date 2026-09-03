'use client';

import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { EASE } from './tokens';
import { prefersReducedMotion } from './useReducedMotion';

/** How long the block takes to clear the paragraph. */
const REVEAL_S = 0.9;
/** Gap between paragraphs entering together. */
const STAGGER_S = 0.18;
/** Where a paragraph counts as entered. */
const START = 'top 88%';

/** The block covers the paragraph at rest, and parks off-frame once done. */
const COVERING = '0%';
const OFF_RIGHT = '101%';

/**
 * Box reveal for body copy: a solid accent block sits over the paragraph and
 * slides off to the right to uncover it.
 *
 * The block is the mask, so the text needs no opacity of its own — it is
 * simply behind the block until the block leaves. An earlier version started
 * the block off-frame and flew it in to cover before uncovering; that showed
 * an empty gap first and read as a flash rather than a reveal.
 *
 * The block is a `::after` on the paragraph rather than a wrapper element, so
 * no markup has to change to opt in — its position is carried in a custom
 * property that GSAP writes and the pseudo-element reads, since GSAP cannot
 * target a pseudo-element directly.
 *
 * Fires once. A box reveal that replays every time a paragraph re-enters the
 * viewport reads as a glitch.
 */
export function useBoxReveal(scope: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-box-reveal]');
      if (targets.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { '--box-reveal-x': OFF_RIGHT });
        return;
      }

      gsap.set(targets, { '--box-reveal-x': COVERING });

      ScrollTrigger.batch(targets, {
        once: true,
        start: START,
        onEnter: (batch) => {
          gsap.to(batch, {
            '--box-reveal-x': OFF_RIGHT,
            duration: REVEAL_S,
            ease: EASE.travel,
            stagger: STAGGER_S,
          });
        },
      });
    },
    { scope, revertOnUpdate: true },
  );
}
