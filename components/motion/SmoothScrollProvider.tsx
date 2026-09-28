'use client';

import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion, useReducedMotion } from './useReducedMotion';

export type ScrollToOptions = {
  /** Seconds. Lenis's own default when omitted. */
  duration?: number;
  /** Jump rather than glide. */
  immediate?: boolean;
  /** Move even while scrolling is stopped — for whoever stopped it. */
  force?: boolean;
  onComplete?: () => void;
};

export type SmoothScroll = {
  /**
   * Halts scrolling. Used by the boot overlay while it holds the viewport, and
   * by the s04 → s05 rewind while it plays.
   */
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
};

const SmoothScrollContext = createContext<SmoothScroll | null>(null);

/**
 * Owns the single Lenis instance and its ScrollTrigger wiring.
 *
 * No scrollerProxy. The prototype needed one because its scroll container was
 * not `window`; here it is, so the shim is dropped.
 *
 * Under reduced motion no Lenis instance is created at all. The context API is
 * built on a ref and is stable for the provider's whole life, so it works
 * either way: with Lenis when it exists, native scrolling when it does not.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  const api = useMemo<SmoothScroll>(
    () => ({
      stop: () => {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.stop();
        } else {
          document.documentElement.style.overflow = 'hidden';
        }
      },
      start: () => {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.start();
        } else {
          document.documentElement.style.overflow = '';
        }
      },
      scrollTo: (target, options = {}) => {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.scrollTo(target, options);
          return;
        }
        if (typeof target === 'number') {
          window.scrollTo({ top: target });
          options.onComplete?.();
          return;
        }
        const element =
          typeof target === 'string' ? document.querySelector(target) : target;
        if (element instanceof HTMLElement) {
          element.scrollIntoView();
        }
      },
    }),
    [],
  );

  useEffect(() => {
    // `reduced` is stale on this effect's first run if the hook ever reports a
    // provisional value, so read the live preference here. A reduced-motion
    // visitor must never get a Lenis instance built and torn down.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

/** Null only when called outside the provider. */
export function useSmoothScroll(): SmoothScroll | null {
  return useContext(SmoothScrollContext);
}
