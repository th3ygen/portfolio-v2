/**
 * Everything the camera films, in one coordinate space: the clock centred on
 * the origin, the year ring on its rim, and UPTIME over its hub.
 *
 * Units are a thousandth of the viewport's shorter side (see the stage's
 * viewBox), so the clock fills the same share of a phone as of a monitor.
 */

/** The clock face, where the ticks start. */
export const FACE_R = 300;
/** The year ring. The dive goes through the dot of the year at 12 o'clock. */
export const RING_R = 350;
/** The outer rim. The uptime gauge lands on it. */
export const RIM_R = 400;

/** Degrees between two slots on the ring: one year, and one hour on the dial. */
export const YEAR_STEP_DEG = 30;
/** The ring has twelve slots, like the dial; the years fill some of them. */
const SLOTS = 12;

/** The year dot's radius. The opening in the last year widens to this. */
export const MARK_DOT_R = 6;

const TICKS = Array.from({ length: 60 }, (_, i) => i);

const HANDS = [
  { id: 'h', length: 170, width: 7, stroke: 'var(--color-border)' },
  { id: 'm', length: 245, width: 5, stroke: 'var(--color-borderMid3)' },
  { id: 's', length: 280, width: 2.5, stroke: 'rgba(198, 242, 26, 0.45)' },
] as const;

const MARK_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontWeight: 800,
  fontSize: 40,
  letterSpacing: 1,
  fill: 'var(--color-accent)',
};

const UPTIME_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display), Impact, sans-serif',
  fontSize: 120,
  letterSpacing: -3,
  fill: 'var(--color-accent)',
};

const SINCE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontWeight: 300,
  fontSize: 20,
  letterSpacing: 9,
  fill: 'var(--color-textMuted)',
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontSize: 15,
  letterSpacing: 5,
  fill: 'var(--color-textFaint)',
};

/** The lock-on brackets' corners, as signs: which way each sits from the dot. */
export const LOCK_CORNERS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

/** Arm length of a lock-on bracket. */
const LOCK_ARM = 9;

/** Where a year sits on the ring before it turns: newest at twelve, older anticlockwise. */
export const markAngle = (year: number, startYear: number) => (year - startYear) * YEAR_STEP_DEG;

/**
 * One year on the ring, written like the odometer it replaced: 20•26.
 *
 * Placed by a static transform — rotated to its slot, then out to the ring —
 * so the whole ring turns as one group and every year reads upright as it
 * passes twelve.
 */
function YearMark({ year, angle, opening }: { year: number; angle: number; opening: boolean }) {
  const text = String(year);
  return (
    <g data-year-mark={year} transform={`rotate(${angle}) translate(0 ${-RING_R})`}>
      {/* Two layers of opacity: the assembly fades the body in, the rewind lights the mark in the window. */}
      <g data-mark-body>
        <text x={-10} y={0} textAnchor="end" dominantBaseline="central" style={MARK_STYLE}>
          {text.slice(0, 2)}
        </text>
        <circle cx={0} cy={0} r={MARK_DOT_R} fill="var(--color-accent)" data-mark-dot />
        {/*
          The opening the camera passes through, on the last year only. Filled
          with the page ground, not left transparent, so the clock behind it
          is swallowed as it widens and the last frame is s05's ground.
        */}
        {opening ? <circle data-zoom-hole cx={0} cy={0} r={0} fill="var(--color-bg)" /> : null}
        <text x={10} y={0} textAnchor="start" dominantBaseline="central" style={MARK_STYLE}>
          {text.slice(2)}
        </text>
      </g>
    </g>
  );
}

export function RewindWorld({
  startYear,
  endYear,
  label,
}: {
  startYear: number;
  endYear: number;
  label: string;
}) {
  const years = Array.from({ length: startYear - endYear + 1 }, (_, i) => startYear - i);
  const empty = Array.from({ length: SLOTS - years.length }, (_, i) => (i + 1) * YEAR_STEP_DEG);

  return (
    <>
      <g data-clock>
        {/*
          The dial: everything that is the clock rather than the year. One
          group, so the dive can fade it without touching the opacity of any
          part the assembly stepped on.
        */}
        <g data-dial>
          <circle
            data-rim
            r={RIM_R}
            transform="rotate(-90)"
            fill="none"
            stroke="var(--color-borderMid1)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            data-rim
            r={FACE_R + 12}
            transform="rotate(-90)"
            fill="none"
            stroke="var(--color-borderDim3)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {TICKS.map((i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                data-tick
                x1={0}
                y1={-FACE_R}
                x2={0}
                y2={-FACE_R + (major ? 18 : 8)}
                transform={`rotate(${i * 6})`}
                stroke={major ? 'var(--color-borderMid2)' : 'var(--color-borderMid1)'}
                strokeWidth={major ? 3 : 1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* The radar sweep that draws the face on. */}
          <line
            data-sweep
            x1={0}
            y1={0}
            x2={0}
            y2={-RIM_R}
            stroke="var(--color-accent)"
            strokeOpacity={0.6}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          <text
            data-clock-label
            x={0}
            y={150}
            textAnchor="middle"
            dominantBaseline="central"
            style={LABEL_STYLE}
          >
            {label}
          </text>

          {HANDS.map((hand) => (
            <g key={hand.id} data-clock-hand={hand.id}>
              <line
                data-hand-line
                x1={0}
                y1={0}
                x2={0}
                y2={-hand.length}
                stroke={hand.stroke}
                strokeWidth={hand.width}
              />
            </g>
          ))}
          <rect data-hub x={-9} y={-9} width={18} height={18} fill="var(--color-accent)" />
        </g>

        <g data-year-ring>
          {empty.map((angle) => (
            <rect
              key={angle}
              data-slot
              x={-4}
              y={-RING_R - 4}
              width={8}
              height={8}
              transform={`rotate(${angle})`}
              fill="var(--color-borderMid3)"
            />
          ))}
          {years.map((year) => (
            <YearMark key={year} year={year} angle={markAngle(year, startYear)} opening={year === endYear} />
          ))}
        </g>

        {/* The window at twelve: fixed to the dial, not the ring. */}
        <g data-window>
          <rect
            x={-96}
            y={-RING_R - 34}
            width={192}
            height={68}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M -8 ${-RING_R - 52} L 8 ${-RING_R - 52} L 0 ${-RING_R - 40} Z`}
            fill="var(--color-accent)"
          />
          <text
            data-since
            x={0}
            y={-RING_R + 72}
            textAnchor="middle"
            dominantBaseline="central"
            style={SINCE_STYLE}
          >
            SINCE
          </text>
        </g>
      </g>

      <text data-uptime x={0} y={0} textAnchor="middle" dominantBaseline="central" style={UPTIME_STYLE}>
        UPTIME
      </text>

      {/*
        The lock-on, around the dot at twelve. In the camera's world on
        purpose: once locked, the brackets ride the dive into the dot with
        everything else instead of hanging in screen space.
      */}
      <g data-lock transform={`translate(0 ${-RING_R})`}>
        {LOCK_CORNERS.map(([sx, sy]) => (
          <g key={`${sx}${sy}`} data-lock-corner data-sx={sx} data-sy={sy} opacity={0}>
            <path
              d={`M ${-sx * LOCK_ARM} 0 H 0 V ${-sy * LOCK_ARM}`}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </g>
    </>
  );
}
