'use client';

import { useId } from 'react';
import { YearOdometer } from './YearOdometer';

const WORD_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display), Impact, sans-serif',
  fontSize: 104,
  letterSpacing: -3,
  fill: 'var(--color-accent)',
};

const SINCE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontWeight: 300,
  fontSize: 34,
  letterSpacing: 14,
  fill: 'var(--color-textMuted)',
};

/** Trailing ghost offsets, far ghost first — markup order the stagger relies on. */
export const TRAIL_OFFSETS = [150, 76] as const;
/** Resting opacity per ghost, by index. Thins out with distance. */
export const TRAIL_OPACITY = [0.16, 0.36] as const;

/** Line height of the exploded column, matching the word's own size. */
const CLONE_PITCH = 104;
/**
 * Where each hollow clone lands, ordered outward from the centre so a
 * from:'center' stagger reads as one blast rather than a sweep.
 */
export const CLONE_OFFSETS = [-4, -3, -2, -1, 1, 2, 3, 4].map(
  (step) => step * CLONE_PITCH,
);

/**
 * Hollow: filled with the page background and outlined in the accent, so the
 * clones read as cut-outs stacked behind the solid word rather than as ghosts
 * of it. The stroke does not scale with the camera — at 190x a scaled outline
 * would be hundreds of pixels thick.
 */
const CLONE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display), Impact, sans-serif',
  fontSize: 104,
  letterSpacing: -3,
  fill: 'var(--color-bg)',
  stroke: 'var(--color-accent)',
  strokeWidth: 1.4,
  paintOrder: 'fill',
};

/**
 * The UPTIME → SINCE <year> handoff.
 *
 * Each word carries a two-step motion trail. The ghosts start collapsed onto
 * the word and stagger out into their offsets, then fade as the word leaves —
 * the trail is a smear, not a persistent stack.
 *
 * The SINCE ghosts are `<use>` instances rather than copies: they mirror the
 * live odometer for free, and `y` stays a real attribute so GSAP's `y`
 * transform composes with the offset instead of overwriting it.
 *
 * A stepped *look* was wanted here, not stepped *motion* — literal steps()
 * easing on the words was tried and rejected.
 */
export function ZoomWords({ year }: { year: number }) {
  const uid = useId().replace(/:/g, '');
  const sinceId = `${uid}-since`;

  return (
    <>
      <g data-zw="0">
        {CLONE_OFFSETS.map((offset) => (
          <text
            key={offset}
            data-clone
            data-clone-y={offset}
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity={0}
            vectorEffect="non-scaling-stroke"
            style={CLONE_STYLE}
            aria-hidden="true"
          >
            UPTIME
          </text>
        ))}
        <text
          data-word="uptime"
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          style={WORD_STYLE}
        >
          UPTIME
        </text>
      </g>

      <g data-zw="1">
        {TRAIL_OFFSETS.map((offset) => (
          <use key={offset} data-trail="1" href={`#${sinceId}`} y={offset} opacity={0} aria-hidden="true" />
        ))}

        <g id={sinceId} data-since-block>
          <text
            data-zoom-since
            x={0}
            y={-58}
            textAnchor="middle"
            dominantBaseline="middle"
            style={SINCE_STYLE}
          >
            SINCE
          </text>
          <YearOdometer year={year} />
        </g>
      </g>
    </>
  );
}
