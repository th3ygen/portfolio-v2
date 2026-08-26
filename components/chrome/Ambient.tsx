'use client';

import { useReducedMotion } from '@/components/motion/useReducedMotion';
import styles from './Ambient.module.css';

/**
 * Full-viewport scanline and vignette overlays. Both inert and decorative.
 *
 * The prototype's autonomous green sweep was built and then removed — all
 * motion is user-triggered. Do not add it back.
 */
export function Ambient() {
  const reduced = useReducedMotion();

  return (
    <>
      <div
        className={`${styles.layer} ${styles.scanline}`}
        data-ambient="scanline"
        {...(reduced ? { 'data-static': 'true' as const } : {})}
        aria-hidden="true"
      />
      <div
        className={`${styles.layer} ${styles.vignette}`}
        data-ambient="vignette"
        aria-hidden="true"
      />
    </>
  );
}
