'use client';

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

/** Trailing ghost offsets and their resting opacities. */
export const TRAIL = [
  { y: 150, opacity: 0.16 },
  { y: 76, opacity: 0.36 },
] as const;

/**
 * The UPTIME → SINCE <year> handoff.
 *
 * Each word carries a two-step motion trail. The ghosts start collapsed onto
 * the word and stagger down into their offsets; they persist rather than
 * fading, which is what reads as speed during the cruise.
 *
 * A stepped *look* was wanted here, not stepped *motion* — literal steps()
 * easing on the words was tried and rejected.
 */
export function ZoomWords({ year }: { year: number }) {
  return (
    <>
      <g data-zw="0">
        {TRAIL.map((ghost) => (
          <text
            key={ghost.y}
            data-trail="0"
            x={0}
            y={ghost.y}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity={0}
            style={WORD_STYLE}
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
        {TRAIL.map((ghost) => (
          <g key={ghost.y} data-trail="1" transform={`translate(0 ${ghost.y})`} opacity={0} aria-hidden="true">
            <text x={0} y={-58} textAnchor="middle" dominantBaseline="middle" style={SINCE_STYLE}>
              SINCE
            </text>
            <text x={-8} y={0} textAnchor="end" dominantBaseline="middle" style={{ ...SINCE_STYLE, fontWeight: 800, fontSize: 64, letterSpacing: 2, fill: 'var(--color-accent)' }}>
              20
            </text>
          </g>
        ))}

        <g data-since-block>
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
