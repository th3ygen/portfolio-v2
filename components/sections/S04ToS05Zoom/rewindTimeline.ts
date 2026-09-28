import { gsap } from '@/components/motion/gsap';
import { EASE } from '@/components/motion/tokens';
import { depthAt, scaleAt } from '@/lib/zoom/camera';
import { REWIND_SWEEP, rewindLabel, zeroHour } from '@/lib/zoom/clock';
import { FACE_R, MARK_DOT_R, RIM_R, RING_R, YEAR_STEP_DEG, markAngle } from './RewindWorld';

/** Where the clock leaves the camera once assembled: the whole dial, a touch closer. */
const DEPTH_ASSEMBLED = depthAt(1.08);
/** Close enough that the window at twelve is the subject, with a year either side of it. */
const DEPTH_REWOUND = depthAt(2.4);

/** The summary building in as the page arrives on it. */
const INTRO_S = 1;

/** How long each of the summary's pieces takes to fly into the clock. */
const BAR_FLIGHT_S = 0.7;
/**
 * The clock sits built, still, for this long after the last piece lands and
 * before it starts to turn: a beat to take it in as a clock. It used to be
 * about twice this, which read as the page stalling; with none at all the
 * assembly and the rewind ran together into one blur.
 */
const ASSEMBLED_HOLD_S = 0.35;
/**
 * The rewind: one long eased turn of the ring, six years back, with the hands
 * and the camera riding the same curve. Smooth, not clicked — the ring is a
 * dial being wound back, not a counter stepping.
 */
const REWIND_S = 2.4;
/**
 * Eased at both ends, but gently: it picks up straight out of the assembly
 * rather than creeping off it, and still settles on 2020.
 */
const REWIND_EASE = 'power1.inOut';
/** The clock holds on 2020 in the window before it rests. */
const REWIND_HOLD_S = 0.2;
/** A year's opacity on the ring, away from the window. */
const RING_DIM = 0.3;

/** The dive, kept from the first version: lock-on… */
const LOCK_S = 0.5;
/** …the camera going through the dot… */
const DIVE_S = 1.5;
/** …and a moment inside before the page moves on. */
const LAND_S = 0.35;
/** Where the dot starts to open, as a fraction of the dive. */
const OPEN_FROM = 0.6;

/** The lock-on brackets' distance from the dot, before and after locking. */
const LOCK_FAR = 70;
const LOCK_NEAR = 20;

/** A warp streak's length, as a share of its path. */
export const STREAK_DASH = 14;

/** The hub's side, in world units. The running-process dots land on it. */
const HUB = 18;
/** The gauge's stroke, in its own 100-unit box. */
const GAUGE_STROKE = 4;
/** How big a project cell is once it has become a tick, in world units. */
const TICK_CELL = 7;

type Build = {
  root: HTMLElement;
  scaler: SVGGElement;
  startYear: number;
  endYear: number;
};

/**
 * The camera, written straight to the transform attribute: zoom about the
 * focus, which the viewBox has put at the centre of the frame.
 *
 * Never a GSAP transform. GSAP resolves transformOrigin against the bounding
 * box, which moves every frame as UPTIME goes and the ring turns, so a
 * GSAP-driven scale drifts off its target frame by frame.
 */
export function writeCamera(scaler: SVGGElement, depth: number, focusY: number): void {
  scaler.setAttribute('transform', `scale(${scaleAt(depth).toFixed(4)}) translate(0 ${(-focusY).toFixed(2)})`);
}

/** Rotations about the world's origin, not the element's own box. */
const ORIGIN = { svgOrigin: '0 0' };

/**
 * Turn the year ring to `rotation` degrees, and light whichever year is at
 * twelve. The light follows the angle continuously, so a year brightens as it
 * comes into the window and dims as it leaves, with no moment where it snaps.
 */
function turnRing(root: HTMLElement, startYear: number, rotation: number): void {
  root.querySelector('[data-year-ring]')?.setAttribute('transform', `rotate(${rotation.toFixed(3)})`);
  for (const mark of root.querySelectorAll<SVGGElement>('[data-year-mark]')) {
    const angle = markAngle(Number(mark.dataset.yearMark), startYear) + rotation;
    const nearness = Math.max(0, 1 - Math.abs(angle) / YEAR_STEP_DEG);
    mark.style.opacity = String(RING_DIM + (1 - RING_DIM) * nearness);
  }
}

/**
 * Every value the timeline touches, set to the frame the stage opens on:
 * UPTIME alone, the summary not yet built, no clock.
 *
 * Stated rather than assumed: the timeline is built with immediateRender off
 * and seeks both ways, and an effect that re-runs over a stage left mid-dive —
 * a Strict Mode double mount, a Fast Refresh, a reload restored below — has to
 * start from UPTIME, not from whatever the DOM was holding.
 */
export function setOpeningFrame(root: HTMLElement, scaler: SVGGElement, startYear: number): void {
  const q = gsap.utils.selector(root);
  writeCamera(scaler, 0, 0);
  turnRing(root, startYear, 0);

  // The summary, unbuilt.
  gsap.set(q('[data-w-widget]'), { opacity: 0, y: 14 });
  gsap.set(q('[data-w-chrome]'), { opacity: 1 });
  gsap.set(q('[data-w-arc]'), { opacity: 0 });
  gsap.set(q('[data-w-bar-track]'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(q('[data-w-gauge], [data-w-bar], [data-w-cell], [data-w-proc]'), {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  });
  gsap.set(q('[data-w-cell]'), { opacity: 0 });

  // UPTIME alone; the clock not there yet.
  gsap.set(q('[data-uptime]'), { opacity: 1, scaleX: 1, transformOrigin: '50% 50%' });
  gsap.set(q('[data-dial]'), { opacity: 1 });
  gsap.set(q('[data-rim], [data-tick], [data-hub], [data-sweep], [data-slot], [data-window], [data-clock-label]'), {
    opacity: 0,
  });
  gsap.set(q('[data-sweep]'), { rotate: 0, ...ORIGIN });
  gsap.set(q('[data-clock-hand]'), { rotate: 0, ...ORIGIN });
  gsap.set(q('[data-hand-line]'), { scaleY: 0, ...ORIGIN });
  gsap.set(q('[data-mark-body]'), { opacity: 0 });
  gsap.set(q('[data-year-mark] text, [data-since]'), { opacity: 1 });

  gsap.set(q('[data-lock-corner]'), { opacity: 0 });
  gsap.set(q('[data-warp]'), { opacity: 0 });
  gsap.set(q('[data-streak]'), { strokeDashoffset: STREAK_DASH });
  gsap.set(q('[data-rewind-meta]'), { opacity: 1 });
  gsap.set(q('[data-rewind-grid]'), { opacity: 0.5 });
  gsap.set(q('[data-rewind-shake]'), { y: 0 });
  gsap.set(q('[data-zoom-hole]'), { attr: { r: 0 } });
}

/** An element's centre in the stage's own coordinates, from layout — transforms ignored. */
function layoutCentre(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * The rewind, as one paused timeline with three stops the gate rests on:
 *
 * 1. the UPTIME summary, built;
 * 2. the clock, assembled out of the summary and wound back to 2020;
 * 3. through the dot, on s05's ground.
 *
 * Nothing here listens to scroll. The gate plays the playhead from stop to
 * stop, forwards or backwards, so every tween is a fromTo with both ends
 * stated, and every readout (camera, ring, label) is written in an onUpdate
 * from its tween's own value, never in a call. That is what lets the whole
 * thing play backwards correctly, coming up out of s05.
 *
 * The flights from the summary into the clock are measured, not authored:
 * each piece flies from wherever the layout put it to where its part of the
 * clock will be on screen. The values are functions, so `invalidate()` after
 * a resize re-measures them.
 */
export function buildRewind({ root, scaler, startYear, endYear }: Build) {
  const q = gsap.utils.selector(root);
  const years = startYear - endYear;
  const label = root.querySelector<SVGTextElement>('[data-clock-label]');

  const master = gsap.timeline({ paused: true, defaults: { immediateRender: false } });

  const cam = { depth: 0, focusY: 0 };
  const film = () => writeCamera(scaler, cam.depth, cam.focusY);
  /** Camera move. Depth, never scale — see lib/zoom/camera. */
  const push = (
    from: { depth: number; focusY: number },
    to: { depth: number; focusY: number },
    duration: number,
    ease: string,
    at: number,
  ) => master.fromTo(cam, { ...from }, { ...to, duration, ease, onUpdate: film }, at);

  const hand = (which: 'h' | 'm' | 's', from: number, to: number, duration: number, ease: string, at: number) =>
    master.fromTo(
      q(`[data-clock-hand="${which}"]`),
      { rotate: from, ...ORIGIN },
      { rotate: to, duration, ease, ...ORIGIN },
      at,
    );

  // ── Where the clock will be on screen once assembled ─────────────────────
  //
  // The world's viewBox is a thousand units across the stage's shorter side,
  // centred; the camera is at DEPTH_ASSEMBLED and not yet panned.
  const assembledScale = scaleAt(DEPTH_ASSEMBLED);
  const px = () => (Math.min(root.clientWidth, root.clientHeight) / 1000) * assembledScale;
  const onScreen = (wx: number, wy: number) => ({
    x: root.clientWidth / 2 + px() * wx,
    y: root.clientHeight / 2 + px() * wy,
  });
  const polar = (radius: number, degrees: number) => {
    const a = (degrees * Math.PI) / 180;
    return onScreen(radius * Math.sin(a), -radius * Math.cos(a));
  };

  /** Fly an HTML piece of the summary onto a point of the clock, resized to `size` px. */
  const fly = (
    el: HTMLElement,
    to: () => { x: number; y: number },
    size: () => { w: number; h: number },
    duration: number,
    at: number,
    onUpdate?: () => void,
  ) =>
    master.fromTo(
      el,
      { x: 0, y: 0, scaleX: 1, scaleY: 1 },
      {
        x: () => to().x - layoutCentre(el, root).x,
        y: () => to().y - layoutCentre(el, root).y,
        scaleX: () => size().w / Math.max(1, el.offsetWidth),
        scaleY: () => size().h / Math.max(1, el.offsetHeight),
        duration,
        ease: EASE.travel,
        ...(onUpdate ? { onUpdate } : {}),
      },
      at,
    );

  // ── Section 1 · the UPTIME summary builds ────────────────────────────────
  master
    .fromTo(
      q('[data-w-widget]'),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: EASE.enterSoft, stagger: 0.08 },
      0,
    )
    .fromTo(q('[data-w-arc]'), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: EASE.enterSoft, stagger: 0.08 }, 0.2)
    .fromTo(
      q('[data-w-bar-track]'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.5, ease: EASE.enter, stagger: 0.05, transformOrigin: '50% 100%' },
      0.25,
    )
    .fromTo(q('[data-w-cell]'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: EASE.enterSoft, stagger: 0.025 }, 0.3);

  // The figures count up to what the markup already says, so a reader with
  // no script — or one who arrives after — sees the same numbers.
  for (const el of q('[data-w-count]') as HTMLElement[]) {
    const to = Number(el.dataset.wCount);
    const n = { value: 0 };
    master.fromTo(
      n,
      { value: 0 },
      {
        value: to,
        duration: 0.7,
        ease: EASE.enter,
        onUpdate: () => {
          el.textContent = String(Math.round(n.value)).padStart(2, '0');
        },
      },
      0.2,
    );
  }

  const t0 = INTRO_S;

  // ── Section 2 · the clock assembles out of the summary ───────────────────
  //
  // Each widget's data becomes a part of the clock while its frame and labels
  // fade: the uptime gauge swells into the rim, the project cells fly out to
  // become ticks on the face, each year's bar lands on its year on the ring,
  // and the running processes fall into the centre, where UPTIME folds down
  // into the hub. Then the hands grow out of the hub.
  const a = t0;
  master
    .fromTo(q('[data-w-chrome]'), { opacity: 1 }, { opacity: 0, duration: 0.3, ease: EASE.exitSoft }, a)
    .fromTo(q('[data-rewind-meta]'), { opacity: 1 }, { opacity: 0, duration: 0.4, ease: EASE.exitSoft }, a)
    .fromTo(q('[data-rewind-grid]'), { opacity: 0.5 }, { opacity: 0.18, duration: 1, ease: EASE.exitSoft }, a)
    .fromTo(q('[data-uptime]'), { scaleX: 1 }, { scaleX: 0.02, duration: 0.55, ease: EASE.travel, transformOrigin: '50% 50%' }, a)
    .fromTo(q('[data-uptime]'), { opacity: 1 }, { opacity: 0, duration: 0.2, ease: EASE.exitSoft }, a + 0.45)
    .fromTo(q('[data-hub]'), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: EASE.enterSoft }, a + 0.45);

  // The gauge → the rim.
  const gauge = q('[data-w-gauge]')[0] as HTMLElement | undefined;
  if (gauge) {
    // The gauge ring is drawn at 44% of its box; it lands at the rim's radius.
    const ring = () => (RIM_R * px()) / 0.44;
    // Its stroke is held at its drawn width as it swells, or it lands as a
    // band a tenth of the screen thick rather than a line becoming the rim.
    // Counter-scaled by hand: vector-effect does not see a CSS transform on
    // the HTML around the SVG.
    const strokes = gauge.querySelectorAll<SVGCircleElement>('circle');
    fly(gauge, () => onScreen(0, 0), () => ({ w: ring(), h: ring() }), 0.75, a, () => {
      const scale = Number(gsap.getProperty(gauge, 'scaleX')) || 1;
      for (const stroke of strokes) stroke.style.strokeWidth = String(GAUGE_STROKE / scale);
    });
    master.fromTo(gauge, { opacity: 1 }, { opacity: 0, duration: 0.25, ease: EASE.exitSoft }, a + 0.65);
  }
  master.fromTo(q('[data-rim]'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE.enterSoft }, a + 0.6);

  // The project cells → ticks, spread round the face.
  const cells = q('[data-w-cell]') as HTMLElement[];
  cells.forEach((cell, i) => {
    const tick = Math.round((i * 60) / cells.length) * 6;
    const at = a + 0.05 + i * 0.012;
    fly(cell, () => polar(FACE_R - 5, tick), () => ({ w: TICK_CELL * px(), h: TICK_CELL * px() }), 0.7, at);
    master.fromTo(cell, { opacity: 1 }, { opacity: 0, duration: 0.25, ease: EASE.exitSoft }, at + 0.55);
  });

  // A sweep turns once from twelve and the rest of the face fills in behind it.
  const ticks = q('[data-tick]');
  const sweepAt = a + 0.5;
  master
    .fromTo(q('[data-sweep]'), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: EASE.enterSoft }, sweepAt)
    .fromTo(
      q('[data-sweep]'),
      { rotate: 0, ...ORIGIN },
      { rotate: 360, duration: 0.7, ease: EASE.travel, ...ORIGIN },
      sweepAt,
    )
    .fromTo(q('[data-sweep]'), { opacity: 1 }, { opacity: 0, duration: 0.2, ease: EASE.exitSoft }, sweepAt + 0.55)
    .fromTo(
      ticks,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: EASE.enterSoft, stagger: 0.7 / ticks.length },
      sweepAt,
    );

  // Each year's bar → its year on the ring, oldest first. The last to land
  // closes the assembly.
  const dot = () => 2 * MARK_DOT_R * px();
  let landed = a;
  for (const bar of q('[data-w-bar]') as HTMLElement[]) {
    const year = Number(bar.dataset.wBar);
    const at = a + 0.05 + (year - endYear) * 0.025;
    fly(bar, () => polar(RING_R, markAngle(year, startYear)), () => ({ w: dot(), h: dot() }), BAR_FLIGHT_S, at);
    landed = Math.max(landed, at + BAR_FLIGHT_S);
    master
      .fromTo(bar, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: EASE.exitSoft }, at + 0.5)
      .fromTo(
        q(`[data-year-mark="${year}"] [data-mark-body]`),
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: EASE.enterSoft },
        at + 0.45,
      );
  }
  master.fromTo(q('[data-slot]'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE.enterSoft, stagger: 0.04 }, a + 0.7);

  // The running processes → the hub.
  for (const proc of q('[data-w-proc]') as HTMLElement[]) {
    fly(proc, () => onScreen(0, 0), () => ({ w: HUB * px(), h: HUB * px() }), 0.55, a);
    master.fromTo(proc, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: EASE.exitSoft }, a + 0.45);
  }

  // The hands grow out of the hub as the last pieces land, and the rewind
  // turns them from there — no spin-up of their own to wait through.
  master.fromTo(
    q('[data-hand-line]'),
    { scaleY: 0, ...ORIGIN },
    { scaleY: 1, duration: 0.5, ease: EASE.enter, stagger: 0.06, ...ORIGIN },
    a + 0.5,
  );

  master
    .fromTo(q('[data-window]'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: EASE.enterSoft }, a + 0.75)
    .fromTo(q('[data-clock-label]'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: EASE.enterSoft }, a + 0.85);

  // The camera settles as the last piece lands, so the hold after it is still.
  push({ depth: 0, focusY: 0 }, { depth: DEPTH_ASSEMBLED, focusY: 0 }, landed - a, EASE.travel, a);

  // ── …and winds back to 2020 ──────────────────────────────────────────────
  //
  // One continuous turn of the ring, six slots, with the hands and the camera
  // on the same curve: the camera closes in on the window and pans up to it
  // as the years come round, so by the time 2020 is in the window, the window
  // is the frame.
  const b = landed + ASSEMBLED_HOLD_S;
  const ring = { rotation: 0 };
  master.fromTo(
    ring,
    { rotation: 0 },
    {
      rotation: years * YEAR_STEP_DEG,
      duration: REWIND_S,
      ease: REWIND_EASE,
      onUpdate: () => {
        turnRing(root, startYear, ring.rotation);
        if (label) label.textContent = rewindLabel(years - Math.round(ring.rotation / YEAR_STEP_DEG));
      },
    },
    b,
  );
  hand('h', 0, REWIND_SWEEP.hour, REWIND_S, REWIND_EASE, b);
  hand('m', 0, REWIND_SWEEP.minute, REWIND_S, REWIND_EASE, b);
  hand('s', 0, REWIND_SWEEP.second, REWIND_S, REWIND_EASE, b);
  push(
    { depth: DEPTH_ASSEMBLED, focusY: 0 },
    { depth: DEPTH_REWOUND, focusY: -RING_R },
    REWIND_S,
    REWIND_EASE,
    b,
  );

  const t1 = b + REWIND_S + REWIND_HOLD_S;

  // ── The dive ─────────────────────────────────────────────────────────────
  //
  // Lock-on: four brackets snap in around the dot, everything else dims so the
  // dot is the only lit thing, and every hand turns round to twelve. Zero
  // hour. Then the camera goes through the dot.
  const handsAt = {
    h: REWIND_SWEEP.hour,
    m: REWIND_SWEEP.minute,
    s: REWIND_SWEEP.second,
  };
  const corners = q('[data-lock-corner]');
  const sx = (el: Element) => Number(el.getAttribute('data-sx'));
  const sy = (el: Element) => Number(el.getAttribute('data-sy'));

  master
    .fromTo(corners, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: EASE.snap }, t1)
    .fromTo(
      corners,
      { x: (_i: number, el: Element) => sx(el) * LOCK_FAR, y: (_i: number, el: Element) => sy(el) * LOCK_FAR },
      {
        x: (_i: number, el: Element) => sx(el) * LOCK_NEAR,
        y: (_i: number, el: Element) => sy(el) * LOCK_NEAR,
        duration: 0.3,
        ease: EASE.snapFine,
      },
      t1 + 0.04,
    )
    .fromTo(
      q(`[data-year-mark="${endYear}"] text, [data-since]`),
      { opacity: 1 },
      { opacity: 0.22, duration: 0.12, ease: EASE.snap },
      t1 + 0.1,
    );
  hand('h', handsAt.h, zeroHour(handsAt.h), 0.4, EASE.travel, t1);
  hand('m', handsAt.m, zeroHour(handsAt.m), 0.4, EASE.travel, t1);
  hand('s', handsAt.s, zeroHour(handsAt.s), 0.4, EASE.travel, t1);

  const dive = t1 + LOCK_S;
  // power3.in on depth, one of a kind: the dive is the only move on the page
  // that should still be accelerating when it ends. Depth is already log
  // scale, so this is a lens flooring it, not a double exponential.
  push({ depth: DEPTH_REWOUND, focusY: -RING_R }, { depth: 1, focusY: -RING_R }, DIVE_S, 'power3.in', dive);

  const jolt = (px: number, at: number) =>
    master.fromTo(q('[data-rewind-shake]'), { y: px }, { y: 0, duration: 0.16, ease: EASE.snapFine }, at);
  jolt(-8, dive);

  master
    // The dial is behind the dot as the camera goes in; it swells past the
    // lens and is gone before the dot opens.
    .fromTo(q('[data-dial]'), { opacity: 1 }, { opacity: 0, duration: DIVE_S * 0.7, ease: EASE.exit }, dive)
    .fromTo(q('[data-rewind-grid]'), { opacity: 0.18 }, { opacity: 0, duration: 0.3, ease: EASE.exitSoft }, dive)
    .fromTo(q('[data-warp]'), { opacity: 0 }, { opacity: 1, duration: 0.1, ease: EASE.snap }, dive + 0.25)
    .fromTo(
      q('[data-streak]'),
      { strokeDashoffset: STREAK_DASH },
      {
        strokeDashoffset: -100,
        duration: 0.34,
        ease: EASE.exit,
        stagger: { each: 0.009, from: 'random', repeat: 2 },
      },
      dive + 0.2,
    )
    .fromTo(q('[data-warp]'), { opacity: 1 }, { opacity: 0, duration: 0.1, ease: EASE.snap }, dive + DIVE_S - 0.05)
    // The opening. Filled with the page ground, so the green becomes a ring
    // whose band sweeps out past the frame, and what is left is the inside of
    // the dot — s05's ground.
    .fromTo(
      q('[data-zoom-hole]'),
      { attr: { r: 0 } },
      { attr: { r: MARK_DOT_R }, duration: DIVE_S * (1 - OPEN_FROM), ease: EASE.linear },
      dive + DIVE_S * OPEN_FROM,
    );
  jolt(12, dive + DIVE_S);

  const t2 = dive + DIVE_S + LAND_S;

  // Pin the timeline's length to the last stop.
  master.set({}, {}, t2);

  return {
    master,
    /** Unbuilt, the summary, the clock at 2020, through the dot. */
    stops: [0, t0, t1, t2] as const,
  };
}
