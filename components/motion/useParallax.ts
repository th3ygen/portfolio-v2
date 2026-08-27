'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { prefersReducedMotion } from './useReducedMotion';

/** How fast the pointer-driven layers chase the cursor. */
const LERP = 0.07;

/**
 * Drives the two parallax systems the design uses. They are different
 * mechanics and were easy to conflate:
 *
 * - `data-px` is a *depth multiplier* for POINTER parallax. Every layer
 *   translates on both axes by `offset * depth`, where offset is the cursor's
 *   position from centre in the range -1..1, eased toward the target.
 * - `data-py` is a SCROLL parallax distance. The element travels from `+f` to
 *   `-f` across its parent's passage through the viewport.
 *
 * Both are skipped entirely under reduced motion.
 */
export function useParallax(scope: React.RefObject<HTMLElement | null>): void {
  // Pointer parallax. Written straight to style inside a rAF that only runs
  // while something is actually moving — this fires on every mousemove and
  // must not re-render React or spin a permanent frame loop.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-px]'));
    if (layers.length === 0) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const tick = () => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;

      for (const layer of layers) {
        const depth = Number.parseFloat(layer.dataset.px ?? '0') || 0;
        layer.style.transform =
          `translate3d(${(currentX * depth).toFixed(2)}px, ${(currentY * depth).toFixed(2)}px, 0)`;
      }

      const moving =
        Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001;
      frame = moving ? window.requestAnimationFrame(tick) : 0;
    };

    const onMove = (event: MouseEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
      for (const layer of layers) layer.style.transform = '';
    };
  }, []);

  // Scroll parallax, scrubbed against each element's own parent.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      for (const el of gsap.utils.toArray<HTMLElement>('[data-py]')) {
        const distance = Number.parseFloat(el.dataset.py ?? '0') || 0;
        if (!distance) continue;
        gsap.fromTo(
          el,
          { y: distance },
          {
            y: -distance,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      }

      ScrollTrigger.refresh();
    },
    { scope, revertOnUpdate: true },
  );
}
