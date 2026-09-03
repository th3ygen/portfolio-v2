import Image from 'next/image';
import { OPERATOR_OPENERS, OPERATOR_ROLES, STAGE_PLATES } from '@/content/operator';
import { RUNWAY_VH } from './titleStage.motion';
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
 * Vertical spacing between hollow title marks, in vh.
 *
 * The title sequence occupies the stage's own 100vh plus the runway, so one
 * mark per title across that span puts each roughly where its slot falls.
 */
const MARK_STEP_VH = (RUNWAY_VH + 100) / TITLES.length;

export function StagePlates() {
  return (
    <div className={styles.plates} aria-hidden="true">
      {TITLES.map((title, index) => (
        <div
          key={title}
          className={styles.markSlot}
          style={{ top: `${(index + 0.55) * MARK_STEP_VH}vh` }}
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
