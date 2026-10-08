import { unstable_cache } from 'next/cache';
import { parseContributions } from '@/lib/github/contributions';
import { GITHUB_USER } from '@/content/operator';

/**
 * The contribution calendar behind the UPTIME summary's heatmap: the last
 * year, a day at a time, as JSON.
 *
 * Rendered per request, but GitHub is asked at most once an hour: the parsed
 * calendar sits in Next's data cache. A failure — GitHub down, rate limited,
 * or its markup changed — throws inside the cache, so it is not stored: the
 * next request tries again, and the widget says it lost the signal rather
 * than showing a year off. And since nothing runs at build time, GitHub being
 * down can't fail a deploy.
 *
 * `unstable_cache`, not `use cache`: this project doesn't opt into Cache
 * Components, and for that setup it is still the documented tool.
 */
export const dynamic = 'force-dynamic';

const HOUR = 3600;

const calendar = unstable_cache(
  async (user: string) => {
    const response = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { Accept: 'text/html', 'User-Agent': 'portfolio-uptime-widget' },
    });
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
    return parseContributions(await response.text());
  },
  ['github-contributions'],
  { revalidate: HOUR },
);

export async function GET(): Promise<Response> {
  try {
    const days = await calendar(GITHUB_USER);
    return Response.json(
      { user: GITHUB_USER, days },
      // Browsers and the CDN may hold it as long as the server does.
      { headers: { 'Cache-Control': `public, max-age=0, s-maxage=${HOUR}, stale-while-revalidate=${HOUR * 24}` } },
    );
  } catch (error) {
    console.error('github: contribution calendar unavailable:', error);
    return Response.json({ error: 'Contribution calendar unavailable.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
