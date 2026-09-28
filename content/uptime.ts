import { CURRENT_YEAR } from './sections';
import { TRAJECTORY } from './trajectory';
import { INDEX_ROWS } from './index-rows';
import { CLIENTS } from './clients';
import { MANIFEST_COUNT } from './manifest';

/**
 * The s04 → s05 UPTIME summary: the readout that sits around UPTIME before
 * the clock takes the stage over.
 *
 * Every number here is derived from content the page already states — the
 * trajectory, the index, the client grid, the manifest — so the summary can
 * never disagree with the sections it summarises.
 */

/** The first post's year: when the uptime starts. */
export const UPTIME_SINCE = Math.min(...TRAJECTORY.map((post) => Number(post.year)));

export const UPTIME_YEARS = CURRENT_YEAR - UPTIME_SINCE;

/** Posts opened each year, from the first through this one — zeros included. */
export const POSTS_PER_YEAR: readonly { readonly year: number; readonly count: number }[] = Array.from(
  { length: UPTIME_YEARS + 1 },
  (_, i) => {
    const year = UPTIME_SINCE + i;
    return { year, count: TRAJECTORY.filter((post) => Number(post.year) === year).length };
  },
);

/** One cell per shipped project, in index order. */
export const DEPLOYMENTS: readonly { readonly n: string; readonly public: boolean }[] = INDEX_ROWS.map((row) => ({
  n: row.n,
  public: row.access === 'PUBLIC',
}));

export const DEPLOYMENTS_PUBLIC = DEPLOYMENTS.filter((d) => d.public).length;
export const DEPLOYMENTS_PRIVATE = DEPLOYMENTS.length - DEPLOYMENTS_PUBLIC;

/** How many sectors the summary names before folding the rest into OTHER. */
const SECTORS_SHOWN = 3;

/** The biggest sectors by project count, ties in index order, then the rest. */
export const DEPLOYMENT_SECTORS: readonly { readonly sector: string; readonly count: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const row of INDEX_ROWS) counts.set(row.sector, (counts.get(row.sector) ?? 0) + 1);
  // Map keeps insertion order and sort is stable, so ties stay in index order.
  const ranked = [...counts].sort((a, b) => b[1] - a[1]);
  const shown = ranked.slice(0, SECTORS_SHOWN).map(([sector, count]) => ({ sector: sector.toUpperCase(), count }));
  const rest = ranked.slice(SECTORS_SHOWN).reduce((total, [, count]) => total + count, 0);
  return rest > 0 ? [...shown, { sector: 'OTHER', count: rest }] : shown;
})();

/** Posts still running, oldest first, by the organisation's short name. */
export const RUNNING: readonly { readonly org: string; readonly since: string; readonly role: string }[] = TRAJECTORY.filter(
  (post) => post.status === 'ACTIVE',
).map((post) => ({ org: post.org.split(' · ')[0] ?? post.org, since: post.year, role: post.role }));

export const CLIENT_COUNT = CLIENTS.length;
export const STACK_COUNT = MANIFEST_COUNT;
