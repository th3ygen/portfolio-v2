import Image from 'next/image';
import { STAGE_PLATES } from '@/content/operator';
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
 * aria-hidden throughout. These are atmosphere; the same photographs appear
 * with real captions in s03.
 */
export function StagePlates() {
  return (
    <div className={styles.plates} aria-hidden="true">
      {STAGE_PLATES.map((plate) => (
        <div
          key={plate.src}
          className={styles.plate}
          data-side={plate.side}
          data-py={plate.py}
          data-stage-plate
          style={{
            top: `${plate.top}%`,
            width: `${plate.width}px`,
            '--plate-alpha': plate.alpha,
          } as React.CSSProperties}
        >
          <div data-px={plate.px}>
            <Image
              className={styles.image}
              src={plate.src}
              alt=""
              width={640}
              height={400}
              sizes="260px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
