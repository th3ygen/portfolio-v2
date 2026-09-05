import Image from 'next/image';
import { OPERATOR_OPENERS, OPERATOR_ROLES, STAGE_PLATES } from '@/content/operator';
import { beatTiming, RUNWAY_VH, TITLE_BAND_VH } from './titleStage.motion';
import styles from './StagePlates.module.css';

/**
 * Work photographs drifting down either side of the s01 title sequence.
 *
 * Deliberately NOT inside the pinned stage. Pinned content is fixed to the
 * viewport and cannot travel, so plates placed there would sit as still as the
 * lockup and read as a flat backdrop. Out here in the section they scroll
 * normally and `data-py` drifts them further still — the contrast between a
 * lockup that holds and scenery that moves past it IS the depth.
 *
 * Scroll and pointer parallax go on separate nodes for the reason they always
 * do here: useParallax's pointer loop assigns style.transform directly and
 * would stomp the GSAP scroll tween.
 *
 * The hollow title marks live here too, for the same reason: they are the
 * furthest layer, and a background that holds still while everything else moves
 * is not a background. They were briefly inside the pinned stage and read as an
 * overlay stuck to the glass.
 *
 * Their text is baked in per element rather than driven from the active title.
 * One mark per title, spaced down the runway, means the right word is simply
 * there when you reach it — no ref, no timeline coupling, nothing to fall out
 * of step with the column.
 *
 * aria-hidden throughout. These are atmosphere; the same photographs appear
 * with real captions in s03.
 */
const TITLES = [...OPERATOR_OPENERS, ...OPERATOR_ROLES];

/**
 * Vertical spacing between hollow title marks, in vh — one title's worth of
 * scroll, taken from the beat timing itself.
 *
 * This used to be the band divided by the title count, which is a different
 * number and always was: the beats occupy only the first RECEDE of the
 * timeline, so a title holds 0.92/7 of the runway while the band spans the
 * runway plus the stage's own viewport. The marks therefore stepped about 19vh
 * further than their titles did and walked out of step with the sequence,
 * roughly a title and a half adrift by the end of it.
 *
 * Derived rather than tuned, so lengthening the runway cannot break the
 * alignment again — which is exactly how it broke this time.
 */
const MARK_STEP_VH = beatTiming(TITLES.length).step * RUNWAY_VH;

/**
 * Where a mark sits relative to the middle of its own title's scroll window.
 *
 * Half a viewport puts the mark's TOP on the centre line; the mark is roughly
 * 18vh tall at a desktop viewport, so backing off by half of that centres the
 * word itself against the lockup rather than hanging it below.
 */
const MARK_CENTRE_VH = 50 - 9;

export function StagePlates() {
  return (
    <div
      className={styles.plates}
      style={{ '--title-band-vh': TITLE_BAND_VH } as React.CSSProperties}
      aria-hidden="true"
    >
      {TITLES.map((title, index) => (
        <div
          key={title}
          className={styles.markSlot}
          // Centred on its title's window, not stepped from zero: the first
          // title is already on screen when the pin engages, so a mark placed
          // at the START of each window arrives a full half-title early.
          style={{ top: `${(index + 0.5) * MARK_STEP_VH + MARK_CENTRE_VH}vh` }}
        >
          {/* Smallest depths on the page: the furthest thing drifts least, and
              the plates crossing in front of it are what sell that as distance. */}
          <div className={styles.mark} data-py={16} data-stage-mark>
            <div data-px={4}>
              <span className={styles.markText}>{title}</span>
            </div>
          </div>
        </div>
      ))}

      {STAGE_PLATES.map((plate) => (
        // The slot exists so the plate has a parent its own size. useParallax
        // triggers each [data-py] against its parentElement, and with all of
        // them parented to the full-section container their drift was spread
        // across 4000px of scroll — measured, 7 to 23px of parallax against
        // 648px of scrolling, which is no parallax at all. Triggered against
        // its own box, a plate does the same travel in a fifth of the distance.
        <div
          key={plate.src}
          className={styles.slot}
          data-side={plate.side}
          style={{ top: `${plate.top}%`, width: `${plate.width}px` }}
        >
          <div
            className={styles.plate}
            data-py={plate.py}
            data-stage-plate
            style={{ '--plate-alpha': plate.alpha } as React.CSSProperties}
          >
            <div data-px={plate.px}>
              <Image
                className={styles.image}
                src={plate.src}
                alt=""
                width={640}
                height={400}
                sizes="(max-width: 900px) 0px, 560px"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
