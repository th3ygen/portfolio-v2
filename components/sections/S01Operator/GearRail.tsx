import { CORE_LOADOUT, GEAR_RAIL_SPLIT } from '@/content/operator';
import styles from './Gear.module.css';

/**
 * One column of equipment slots, flanking the portrait.
 *
 * The left rail is not four equal boxes. Its first and last slots run the full
 * rail width and the middle two share a row, which is the rhythm a character
 * screen uses to say that one slot is the main one — the same reason the
 * reference gives MAIN a wide box and SIDEARM and MELEE half each. The right
 * rail is a plain 2x2, because nothing over there outranks anything else.
 *
 * Static markup, deliberately. An earlier pass made every slot a button that
 * drove a shared readout, because the boxes were 54px and could not hold a
 * name. At full section width they hold the name and the detail line both, so
 * there is nothing left for pointing at a slot to reveal — and a button that
 * reveals nothing is a control the keyboard has to walk through for no reason.
 */
export function GearRail({ side }: { side: 'left' | 'right' }) {
  const entries = CORE_LOADOUT.map((item, index) => ({ item, index })).filter(({ index }) =>
    side === 'left' ? index < GEAR_RAIL_SPLIT : index >= GEAR_RAIL_SPLIT,
  );

  return (
    <div className={styles.rail} data-side={side}>
      {entries.map(({ item, index }, position) => (
        <div
          key={item.name}
          className={styles.mount}
          // The wide slots. On the left rail, the first and last; on the right,
          // none — hence an attribute rather than a second component.
          data-wide={side === 'left' && (position === 0 || position === entries.length - 1)}
        >
          {/*
            Above the box, not inside it. The label names the SLOT and stays put
            while what is mounted in it changes, which is the whole reason the
            panel reads as equipment rather than as a list of logos.
          */}
          <span className={styles.slotLabel}>{item.slot}</span>
          <div
            className={styles.slot}
            // The reticle locks onto anything carrying data-lock, and its value
            // is the readout label. The loadout cells had this before the gear
            // rewrite; a slot you can point at that the crosshair ignores is
            // the one box on the page that does not answer.
            data-lock={item.name}
            data-accent={item.accent ? 'true' : 'false'}
            // Slot 0 wears the accent frame the way the reference marks the
            // equipped MAIN. It is the primary mount, not a selection.
            data-primary={index === 0 ? 'true' : 'false'}
          >
            {/*
              The brand mark, as a mask rather than an <img>.
              An <img> cannot be recoloured, and two stacked copies — one grey,
              one colour — would cross-fade rather than change colour, which
              reads as a dissolve instead of as the mark coming to life. A mask
              gives the silhouette and leaves the colour to CSS, so rest and
              reveal are one animatable property.
            */}
            <span
              className={styles.logo}
              style={
                {
                  '--logo': `url(/img/logos/${item.logo}.svg)`,
                  '--logo-color': item.logoColor,
                } as React.CSSProperties
              }
            />
            <span className={styles.slotName}>{item.name}</span>
            <span className={styles.slotDetail}>{item.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
