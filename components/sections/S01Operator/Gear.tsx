import { CORE_LOADOUT, LOADOUT_HEAD } from '@/content/operator';
import { GearRail } from './GearRail';
import styles from './Gear.module.css';

/**
 * The operator's gear screen: the portrait flanked by equipment slots.
 *
 * The loadout used to be a two-column grid of name/detail cards filling the
 * width of the prose column — eight equal cells with no hierarchy, sitting
 * under three paragraphs that had already said what the work is. It read as a
 * specification table.
 *
 * Mounted around the photograph it reads as a character screen instead, which
 * is a claim the section is already making in words: this is the operator, and
 * this is what the operator is carrying. The convention does work a table
 * cannot — the roles are labelled and fixed, so eight unrelated technologies
 * become one loadout, and the two accent entries read as rarity rather than as
 * arbitrary highlighting.
 *
 * It occupies a full-width row rather than a column beside the copy. Beside it
 * the panel had 560px to fit a portrait and two rails into, which left slots
 * too small to name what was in them; across the section they hold the name and
 * the detail line, and the copy takes the row beneath.
 *
 * The portrait arrives as `children` rather than being rendered here: it keeps
 * its parallax cutout, its meta bar and its corner ticks in the section that
 * owns them, and this component stays responsible for the gear alone.
 */
export function Gear({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.root} aria-label={LOADOUT_HEAD.title}>
      <div className={styles.head} data-op-line>
        <span className={styles.title}>{LOADOUT_HEAD.title}</span>
        <span className={styles.count} aria-hidden="true">
          {String(CORE_LOADOUT.length).padStart(2, '0')} EQUIPPED
        </span>
        <span className={styles.note}>{LOADOUT_HEAD.note}</span>
      </div>

      <div className={styles.bay}>
        <GearRail side="left" />
        <div className={styles.subject}>{children}</div>
        <GearRail side="right" />
      </div>
    </section>
  );
}
