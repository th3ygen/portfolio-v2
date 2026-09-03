'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from '@/components/motion/gsap';
import { EASE } from '@/components/motion/tokens';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import {
  ROLL_DURATION_S,
  ROLL_TRAVEL_PX,
  digitsOf,
  nextDigitState,
  type DigitState,
} from '@/lib/zoom/odometer';

const DIGIT_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontWeight: 800,
  fontSize: 64,
  letterSpacing: 2,
  fill: 'var(--color-accent)',
};

/** Only the last two digits roll; the century prefix is static. */
const ROLLING_X = [8, 48] as const;

const idle = (value: number): DigitState => ({ value, rolling: false, from: value });

/**
 * The year counter, as an odometer.
 *
 * Digit transitions go through `nextDigitState` rather than mutating the
 * displayed glyph — that rule is what keeps a fast scroll flick from dropping
 * increments and landing the year on the wrong number.
 *
 * The whole thing carries one aria-label with the plain year; the individual
 * glyph windows are hidden, or a screen reader reads eight loose digits.
 */
export function YearOdometer({ year }: { year: number }) {
  const uid = useId().replace(/:/g, '');
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const [states, setStates] = useState<readonly DigitState[]>(() =>
    digitsOf(year).slice(2).map(idle),
  );
  const [seenYear, setSeenYear] = useState(year);

  // Adjusted during render rather than in an effect. The next digit state
  // depends on the previous one, so this is not pure derivation — but it is
  // not an external-system sync either. React's documented pattern for
  // state that reacts to a changed prop: set during render, and React
  // re-renders immediately without committing the discarded output. Doing it
  // in an effect would commit a stale frame first, which under a scrub is a
  // visibly wrong digit.
  if (year !== seenYear) {
    const targets = digitsOf(year).slice(2);
    setSeenYear(year);
    setStates((current) =>
      current.map((state, index) => nextDigitState(state, targets[index] ?? state.value)),
    );
  }

  useEffect(() => {
    const reduced = prefersReducedMotion();
    states.forEach((state, index) => {
      const group = groupRefs.current[index];
      if (!group) return;
      if (state.rolling && !reduced) {
        gsap.fromTo(
          group,
          { y: 0 },
          { y: ROLL_TRAVEL_PX, duration: ROLL_DURATION_S, ease: EASE.enter },
        );
      } else {
        gsap.set(group, { y: 0 });
      }
    });
  }, [states]);

  return (
    <g data-odometer role="img" aria-label={String(year)}>
      <defs>
        {ROLLING_X.map((x, index) => (
          <clipPath key={x} id={`${uid}-roll-${index}`}>
            <rect x={x - 4} y={-42} width={44} height={84} />
          </clipPath>
        ))}
      </defs>

      <text x={-8} y={0} textAnchor="end" dominantBaseline="middle" style={DIGIT_STYLE} aria-hidden="true">
        20
      </text>
      <circle data-zoom-dot cx={0} cy={0} r={9} fill="var(--color-accent)" />

      {states.map((state, index) => (
        <g key={ROLLING_X[index]} clipPath={`url(#${uid}-roll-${index})`} aria-hidden="true">
          <g
            ref={(node) => {
              groupRefs.current[index] = node;
            }}
          >
            <text
              x={ROLLING_X[index]}
              y={0}
              textAnchor="start"
              dominantBaseline="middle"
              style={DIGIT_STYLE}
            >
              {state.rolling ? state.from : state.value}
            </text>
            <text
              x={ROLLING_X[index]}
              y={84}
              textAnchor="start"
              dominantBaseline="middle"
              style={DIGIT_STYLE}
            >
              {state.value}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}
