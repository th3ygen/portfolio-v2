import { gsap, Observer, ScrollTrigger } from '@/components/motion/gsap';
import type { SmoothScroll } from '@/components/motion/SmoothScrollProvider';
import { IDLE_METER, readGesture, type Direction } from '@/lib/zoom/gate';

/**
 * How close the stage's top edge has to come to the top of the viewport, from
 * either side, before the rewind takes the page — as a fraction of the
 * viewport. Close enough that the stage is most of the screen; far enough
 * that a quick scroll cannot cross the whole band between two frames.
 */
const REACH = 0.3;

/** The glide that seats the stage in the viewport once the rewind takes it. */
const ARRIVE_S = 0.5;

/** The glide out of the dive, onto the top of s05. */
const EXIT_DOWN_S = 0.9;

/**
 * Going back up, the page is let go this far above the stage — past REACH,
 * or the next wheel notch would cross back into it and take the page again.
 */
const EXIT_UP = 0.45;
const EXIT_UP_S = 0.6;

export type RewindGate = {
  destroy: () => void;
};

type Options = {
  stage: HTMLElement;
  /** Paused. The gate owns its playhead. */
  master: gsap.core.Timeline;
  /**
   * Timeline times the playhead stops at, first to last. The first is where
   * the stage sits before the page is held; arriving plays from it to the
   * second, and the page is let go upwards from the second rather than
   * played back to the first — an intro plays once per arrival, and is not a
   * stop a reader has to scroll back through.
   */
  stops: readonly number[];
  smooth: SmoothScroll;
  /** Told when the gate takes and releases the page. */
  onHold: (held: boolean) => void;
};

/**
 * The rewind is triggered, not scrubbed: each beat plays through at its own
 * speed, and the page waits for it.
 *
 * When the stage's top edge comes within REACH of the viewport's, the gate
 * takes the page — stops smooth scrolling, seats the stage, and plays the next
 * beat. From there scroll input is read as requests for beats (see
 * lib/zoom/gate), not as distance:
 *
 * - one gesture plays the next beat, however hard it is;
 * - anything asked for while a beat is playing is dropped — the beat always
 *   plays out at the speed it was written for, and nothing queues behind it;
 * - asking past either end lets the page go that way.
 *
 * There is deliberately no hurrying and no skipping. Both were built — a
 * gesture mid-beat ran the rest at 5x, a thrown one ran the whole sequence —
 * and both broke the thing they were meant to protect: beats collapsing into
 * each other read as the page glitching, not as the page keeping up.
 *
 * It holds from below too. Coming back up out of s05, the stage is still in
 * its end state, and the same beats play backwards: out of the dot, the year
 * rolling forward, UPTIME reassembling.
 *
 * Anything that moves the page while it is held — a rail link, focus moving
 * off-screen, a resize — lets it go, with the timeline set to whichever end
 * the page landed past.
 */
export function createRewindGate({ stage, master, stops, smooth, onHold }: Options): RewindGate {
  const last = stops.length - 1;
  const timeOf = (index: number) => stops[Math.min(last, Math.max(0, index))] ?? 0;

  let held = false;
  /** The stop the playhead is at, or heading for. */
  let target = 0;
  let heading: Direction = 1;
  let run: gsap.core.Tween | null = null;
  let meter = IDLE_METER;

  const lockY = () => stage.getBoundingClientRect().top + window.scrollY;

  /** Put the playhead on a stop without playing to it. */
  function seek(index: number) {
    run?.kill();
    run = null;
    master.time(timeOf(index));
    target = index;
  }

  function settle() {
    run = null;
    // Nothing on the far side of the dive to wait on: the frame is the inside
    // of the dot, which is s05's ground. Carry straight on into it.
    if (target === last && heading === 1) release(1);
  }

  function request(dir: Direction) {
    if (run) return;
    heading = dir;
    const next = target + dir;
    if (next > last) {
      release(1);
      return;
    }
    if (next < 1) {
      release(-1);
      return;
    }
    target = next;
    run = master.tweenTo(timeOf(target), { ease: 'none', onComplete: settle });
  }

  function feed(delta: number) {
    const reading = readGesture(meter, delta, performance.now());
    meter = reading.meter;
    if (reading.step) request(reading.step);
  }

  const observer = Observer.create({
    target: window,
    type: 'wheel,touch',
    tolerance: 4,
    preventDefault: true,
    // A new touch is a new gesture, however soon after the last one it lands.
    onPress: () => {
      meter = IDLE_METER;
    },
    onChangeY: (self) => {
      const touch = self.event.type.startsWith('touch') || self.event.type.startsWith('pointer');
      // A finger dragged up scrolls the page down; the wheel's sign is the
      // page's already.
      feed(touch ? -self.deltaY : self.deltaY);
    },
  });
  observer.disable();

  function onKey(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    let dir: Direction | 0 = 0;
    if (event.key === 'ArrowDown' || event.key === 'PageDown') dir = 1;
    else if (event.key === 'ArrowUp' || event.key === 'PageUp') dir = -1;
    else if (event.key === ' ') dir = event.shiftKey ? -1 : 1;
    if (!dir) return;
    event.preventDefault();
    request(dir);
  }

  function hold(dir: Direction) {
    held = true;
    heading = dir;
    // The scroll that carried the reader in is still going — a trackpad's
    // inertia, the last notches of a wheel. It continues that gesture, so
    // arriving plays one beat and not two.
    meter = { at: performance.now(), dir };
    smooth.stop();
    smooth.scrollTo(lockY(), { duration: ARRIVE_S, force: true });
    observer.enable();
    window.addEventListener('keydown', onKey);
    onHold(true);
    request(dir);
  }

  function letGo() {
    held = false;
    observer.disable();
    window.removeEventListener('keydown', onKey);
    smooth.start();
    onHold(false);
  }

  function release(dir: Direction) {
    if (!held) return;
    letGo();
    if (dir > 0) {
      smooth.scrollTo(lockY() + window.innerHeight, { duration: EXIT_DOWN_S });
    } else {
      smooth.scrollTo(lockY() - window.innerHeight * EXIT_UP, { duration: EXIT_UP_S });
    }
  }

  /** Something else moved the page while it was held. Go with it. */
  function abandon(to: 0 | 'last') {
    letGo();
    seek(to === 0 ? 0 : last);
  }

  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: `top ${REACH * 100}%`,
    end: `top ${-REACH * 100}%`,
    onEnter: (self) => {
      // A jump that crosses the whole band in one frame — a rail link, a
      // restored scroll — fires this and onLeave together. It is not a reader
      // arriving; onLeave sets the end state.
      if (held || self.scroll() > self.end) return;
      seek(0);
      hold(1);
    },
    onEnterBack: (self) => {
      if (held || self.scroll() < self.start) return;
      seek(last);
      hold(-1);
    },
    onLeave: () => {
      if (held) abandon('last');
      else seek(last);
    },
    onLeaveBack: () => {
      if (held) abandon(0);
      else seek(0);
    },
  });

  // Loaded already past the stage: it has to be in its end state when the
  // reader scrolls back up to it.
  if (trigger.scroll() > trigger.end) seek(last);

  const onRefresh = () => {
    if (held) smooth.scrollTo(lockY(), { immediate: true, force: true });
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);

  return {
    destroy: () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      trigger.kill();
      run?.kill();
      observer.kill();
      if (held) letGo();
    },
  };
}
