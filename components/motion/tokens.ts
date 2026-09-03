/**
 * The shared motion vocabulary.
 *
 * Every ease and scrub in the site resolves to a name here. The point is not
 * to save characters — it is that the feel of the whole page is editable from
 * one file, and that two animations doing the same job cannot drift apart by
 * accident. Before this existed there were five distinct scrub values across
 * seven sections with no stated reason for any of the differences.
 *
 * Names describe the ROLE, not the curve. `EASE.travel` is what the s01 column
 * does between two held positions; that it happens to be power3.inOut is an
 * implementation detail you are free to change here. Reach for a raw GSAP ease
 * string in a section only when the motion is genuinely one of a kind, and add
 * a comment saying why it is not one of these.
 */

export const EASE = {
  /**
   * No easing. The correct choice for anything scrubbed: the scroll position
   * IS the timing, and a curve on top of it makes the element lag its own
   * trigger.
   */
  linear: 'none',

  /** Something arriving and settling. The default entrance. */
  enter: 'power3.out',

  /** A softer arrival, for copy and for elements that follow a lead element. */
  enterSoft: 'power2.out',

  /**
   * Motion between two held states — the s01 column riding up a row, the box
   * reveal crossing its element. Eased at both ends because neither end is a
   * beginning or an end, just a stop.
   */
  travel: 'power3.inOut',

  /** A long, slow drift that neither arrives nor departs sharply. */
  drift: 'power1.inOut',

  /** Something leaving under its own weight. */
  exit: 'power2.in',

  /** A gentler departure, for elements leaving in a group behind a lead. */
  exitSoft: 'power1.in',

  /**
   * The digital snap. Everything instrument-like in this design steps rather
   * than fades — the reticle lock, the bracket slot, the readout — because a
   * readout that cross-fades reads as a light, and one that steps reads as a
   * machine changing state.
   */
  snap: 'steps(2)',

  /** The same snap with one more step, where two reads as too abrupt. */
  snapFine: 'steps(3)',
} as const;

export const SCRUB = {
  /**
   * Locked to the scroll with no smoothing. For anything that must agree with
   * the scrollbar exactly — progress rails, background drift — where lag reads
   * as a bug rather than as weight.
   */
  locked: true,

  /**
   * The default for scrubbed sequences. Smooths input jitter without the
   * content visibly trailing the scroll.
   *
   * One value on purpose. This replaced 0.4, 0.45 and 0.5 used in three
   * sections, a spread no one chose and no one could perceive.
   */
  tight: 0.45,

  /**
   * A deliberate lag, for layers that should feel heavy — the parallax plates
   * drifting behind the page.
   */
  loose: 0.8,
} as const;

export type Ease = (typeof EASE)[keyof typeof EASE];
export type Scrub = (typeof SCRUB)[keyof typeof SCRUB];
