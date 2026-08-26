'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/** Server render has no preference to read, so motion is assumed allowed. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Single source of truth for the reduced-motion preference.
 *
 * Backed by useSyncExternalStore rather than useState + useEffect, so the
 * value is correct on the first client render instead of flipping after mount.
 * That matters: a hook that reports false for one render lets every animated
 * component start its timeline before reverting it.
 *
 * Every animated component in the build consults this and renders its final
 * state when it is true.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Synchronous read of the same preference, for use *inside* effects where a
 * hook cannot be called — e.g. a GSAP timeline builder deciding whether to
 * animate at all. Returns false when matchMedia is unavailable.
 */
export function prefersReducedMotion(): boolean {
  return getSnapshot();
}
