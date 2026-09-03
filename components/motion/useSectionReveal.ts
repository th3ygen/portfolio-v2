'use client';

import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { EASE } from './tokens';
import { prefersReducedMotion } from './useReducedMotion';

/**
 * The shared section reveal: elements rise and fade in as they enter.
 *
 * An earlier version used a 6-cycle yoyo opacity flicker on section numbers.
 * It read as a flashing bug and was replaced with a clean fade — do not
 * reintroduce flicker on reveal.
 */
export function useSectionReveal(
  scope: RefObject<HTMLElement | null>,
  selector: string,
): void {
  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>(selector, scope.current);
      if (elements.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(elements, { opacity: 0, y: 26 });
      ScrollTrigger.batch(elements, {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: EASE.enter,
            stagger: 0.08,
          }),
      });
    },
    { scope, dependencies: [selector], revertOnUpdate: true },
  );
}
