import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, renderHook, waitFor } from '@testing-library/react';
import { Coffee, Comms, LocalTime, Pulse } from '../LiveWidgets';
import { useContributions } from '../useLive';

/** A moment in Malaysia time. */
const at = (iso: string) => new Date(`${iso}+08:00`);

describe('LocalTime', () => {
  it('shows the time in KL, the hour lit on the day strip, and the shift', () => {
    const { container } = render(<LocalTime now={at('2026-09-28T10:04:07')} />);
    expect(container).toHaveTextContent('10:04');
    expect(container).toHaveTextContent('07');
    expect(container.querySelector('footer')).toHaveTextContent('KUALA LUMPUR · ON SHIFT');
    const hours = [...container.querySelectorAll('[data-hour]')].map((h) => h.getAttribute('data-hour'));
    expect(hours).toHaveLength(24);
    expect(hours.indexOf('now')).toBe(10);
    expect(hours.slice(0, 7).every((h) => h === 'sleep')).toBe(true);
  });

  it('shows placeholders until the client clock ticks', () => {
    const { container } = render(<LocalTime now={null} />);
    expect(container).toHaveTextContent('--:--');
    expect(container.querySelector('[data-hour="now"]')).toBeNull();
  });
});

describe('Pulse', () => {
  const days = Array.from({ length: 7 }, (_, i) => ({ date: `2026-09-2${i}`, level: 1 as const, count: i < 6 ? 5 : 0 }));

  it('beats at a rate set by the last week on GitHub', () => {
    const { container } = render(<Pulse github={{ status: 'ready', days }} />);
    // 30 contributions in the week: 98 bpm.
    expect(container).toHaveTextContent('098');
    expect(container.querySelector('footer')).toHaveTextContent('LOAD 7D · 30 CONTRIB');
    expect(container.querySelector('svg')!.getAttribute('style')).toContain('--beat');
  });

  it('flatlines, without a made-up rate, when GitHub is unreachable', () => {
    const { container } = render(<Pulse github={{ status: 'lost' }} />);
    expect(container).toHaveTextContent('---');
    expect(container).toHaveTextContent('NO SIGNAL');
    expect(container.querySelector('path')).toHaveAttribute('d', 'M0 15 L240 15');
  });
});

describe('Coffee', () => {
  it('reads the level off the day’s schedule, with the next cup', () => {
    const { container } = render(<Coffee now={at('2026-09-28T10:30:00')} />);
    expect(container).toHaveTextContent('56');
    expect(container.querySelector('header')).toHaveTextContent('NOMINAL');
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(6);
    expect(container.querySelector('footer')).toHaveTextContent('CUPS 1/3 · NEXT 13:00');
  });

  it('runs dry overnight, and warns', () => {
    const { container } = render(<Coffee now={at('2026-09-29T02:00:00')} />);
    expect(container.querySelector('header')).toHaveTextContent('CRITICAL');
    expect(container.querySelector('[data-low]')).not.toBeNull();
  });
});

describe('Comms', () => {
  it('lists the ways in, and restates the reply window and notice', () => {
    const { container } = render(<Comms now={at('2026-09-28T10:00:00')} />);
    const channels = [...container.querySelectorAll('li')].map((li) => li.textContent);
    expect(channels).toEqual(['UPLINK', 'EMAIL', 'PHONE', 'LINKEDIN']);
    expect(container).toHaveTextContent('OPERATOR ONLINE');
    expect(container.querySelector('footer')).toHaveTextContent('REPLY ~24H · NOTICE 30D');
  });

  it('queues messages while the operator sleeps, on a low signal', () => {
    const { container } = render(<Comms now={at('2026-09-29T03:00:00')} />);
    expect(container).toHaveTextContent('QUEUED · READ AFTER 07:00');
    expect(container.querySelector('li')!.querySelectorAll('[data-on]')).toHaveLength(1);
  });
});

describe('useContributions', () => {
  afterEach(() => vi.unstubAllGlobals());

  const answer = (ok: boolean, body: unknown) =>
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok, status: ok ? 200 : 502, json: async () => body })));

  it('loads the calendar from /api/github', async () => {
    answer(true, { days: [{ date: '2026-09-29', level: 1, count: 1 }] });
    const { result } = renderHook(() => useContributions());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetch).toHaveBeenCalledWith('/api/github', expect.anything());
  });

  it('is lost on an error, or on an answer with no days', async () => {
    answer(false, { error: 'down' });
    const failed = renderHook(() => useContributions());
    await waitFor(() => expect(failed.result.current.status).toBe('lost'));
    answer(true, { days: [] });
    const empty = renderHook(() => useContributions());
    await waitFor(() => expect(empty.result.current.status).toBe('lost'));
  });
});
