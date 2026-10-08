/**
 * The GitHub contribution calendar, for the UPTIME summary's heatmap.
 *
 * Read from the public calendar GitHub serves for a profile
 * (github.com/users/<user>/contributions) — the same one the profile page
 * shows, private contributions included if the profile counts them — so no
 * token is needed. It is HTML, not an API: each day is a cell carrying its
 * date and a 0–4 intensity level, and the exact count is in the cell's
 * tooltip. If GitHub changes that markup the parser finds no days and says
 * so, rather than returning an empty year that reads as a year off.
 */

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  /** YYYY-MM-DD. */
  readonly date: string;
  readonly level: ContributionLevel;
  readonly count: number;
}

export interface ContributionSummary {
  readonly total: number;
  /** The last day with any contributions, or null for none in the year. */
  readonly lastActive: string | null;
  /** Consecutive days with contributions, ending today (or yesterday: today may not have started). */
  readonly streak: number;
  /** The most contributions on a single day. */
  readonly best: number;
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/** Every day in the calendar's HTML, oldest first. Throws if there are none. */
export function parseContributions(html: string): ContributionDay[] {
  // Counts, from the tooltips: "No contributions on …", "1 contribution on …", "12 contributions on …".
  const counts = new Map<string, number>();
  for (const [, id = '', text = ''] of html.matchAll(/<tool-tip\b[^>]*\sfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = text.match(/^\s*([\d,]+)\s+contributions?\b/)?.[1];
    counts.set(id, n ? Number(n.replace(/,/g, '')) : 0);
  }

  const days: ContributionDay[] = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*\sdata-date="[^"]*"[^>]*>/g)) {
    const date = attr(tag, 'data-date');
    const level = Number(attr(tag, 'data-level'));
    const id = attr(tag, 'id');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !(level >= 0 && level <= 4)) continue;
    // A day with a level but no tooltip still counts as active; call it one.
    const count = (id ? counts.get(id) : undefined) ?? (level > 0 ? 1 : 0);
    days.push({ date, level: level as ContributionLevel, count });
  }
  if (days.length === 0) throw new Error('No contribution days found: has the calendar markup changed?');
  return days.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

const dayBefore = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/** Totals for the footer. `today` is YYYY-MM-DD in the calendar's own zone. */
export function summarise(days: readonly ContributionDay[], today: string): ContributionSummary {
  const byDate = new Map(days.map((d) => [d.date, d.count]));
  let total = 0;
  let best = 0;
  let lastActive: string | null = null;
  for (const d of days) {
    total += d.count;
    best = Math.max(best, d.count);
    if (d.count > 0) lastActive = d.date;
  }
  let streak = 0;
  let at = (byDate.get(today) ?? 0) > 0 ? today : dayBefore(today);
  while ((byDate.get(at) ?? 0) > 0) {
    streak += 1;
    at = dayBefore(at);
  }
  return { total, lastActive, streak, best };
}

/** Whole days from `from` to `to`, both YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
