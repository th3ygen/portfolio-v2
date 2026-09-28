/**
 * Gesture reading for the s04 → s05 rewind gate.
 *
 * While the rewind holds the page, a scroll gesture is a request for the next
 * beat, not a distance. The difficulty is that one gesture is not one event: a
 * trackpad swipe sends wheel events for a second after the finger lifts, and a
 * mouse wheel turned once is a short burst of notches. Counted per event, one
 * swipe would ask for every beat at once.
 *
 * So events are grouped into gestures — a run of events in one direction with
 * no gap longer than GAP_MS — and a gesture asks for exactly one beat, the
 * moment it starts. However long or hard it is, it is still one beat.
 */

/** Silence that ends a gesture. Longer than the gap between wheel notches. */
export const GAP_MS = 180;

export type Direction = -1 | 1;

export type Meter = {
  /** When the last event of the current gesture arrived. */
  readonly at: number;
  readonly dir: Direction | 0;
};

export const IDLE_METER: Meter = { at: -Infinity, dir: 0 };

export type Reading = {
  readonly meter: Meter;
  /** The beat this event asks for, if it starts a gesture. */
  readonly step: Direction | 0;
};

/**
 * Feed one event's `delta` (positive is down the page) into the meter.
 *
 * Every event extends its gesture, including ones the caller ignores — a beat
 * that is still playing drops requests, but the swipe that arrived during it
 * must not come back as a fresh request the moment the beat lands.
 */
export function readGesture(meter: Meter, delta: number, now: number): Reading {
  const dir = Math.sign(delta) as Direction | 0;
  if (dir === 0) return { meter, step: 0 };
  const fresh = dir !== meter.dir || now - meter.at > GAP_MS;
  return { meter: { at: now, dir }, step: fresh ? dir : 0 };
}
