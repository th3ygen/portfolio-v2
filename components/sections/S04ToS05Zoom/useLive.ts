import { useEffect, useState } from 'react';
import type { ContributionDay } from '@/lib/github/contributions';

/**
 * The two live feeds behind the UPTIME summary, owned by the summary and
 * handed to its widgets, so the page ticks one clock and asks GitHub once.
 */

/**
 * Now, a second at a time. Null on the server and until the first client
 * tick: a time rendered during SSR would never match the client's a moment
 * later (the masthead's clock does the same).
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export type GitHubState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly days: readonly ContributionDay[] }
  | { readonly status: 'lost' };

/** The contribution calendar from /api/github: loading, ready, or lost. */
export function useContributions(): GitHubState {
  const [state, setState] = useState<GitHubState>({ status: 'loading' });
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/github', { signal: abort.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`${response.status}`))))
      .then((body: { days?: ContributionDay[] }) => {
        if (!Array.isArray(body.days) || body.days.length === 0) throw new Error('no days');
        setState({ status: 'ready', days: body.days });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ status: 'lost' });
      });
    return () => abort.abort();
  }, []);
  return state;
}
