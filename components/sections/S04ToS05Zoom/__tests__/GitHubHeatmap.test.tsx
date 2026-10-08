import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { GitHubHeatmap } from '../GitHubHeatmap';

const day = (date: string, level: 0 | 1 | 2 | 3 | 4, count: number) => ({ date, level, count });

describe('GitHubHeatmap', () => {
  it('fills a cell a day, marks today, and sums the year', () => {
    // 2026-09-27 is a Sunday: the first column starts on it, no padding.
    const days = [day('2026-09-27', 0, 0), day('2026-09-28', 2, 5), day('2026-09-29', 4, 12)];
    const { container } = render(<GitHubHeatmap github={{ status: 'ready', days }} />);

    const levels = [...container.querySelectorAll('[data-level]')].map((el) => el.getAttribute('data-level'));
    expect(levels).toEqual(['0', '2', '4']);
    expect(container.querySelector('header')).toHaveTextContent('0017');
    expect(container.querySelector('footer')).toHaveTextContent('LAST PUSH TODAY · STREAK 02D · PEAK 12/D');
    // Today is the last day, and only it is marked.
    const todays = container.querySelectorAll('[data-today]');
    expect(todays).toHaveLength(1);
    expect(todays[0]).toHaveAttribute('data-level', '4');
  });

  it('pads the week so each column runs Sunday to Saturday', () => {
    // 2026-09-29 is a Tuesday: two blanks before it, and the rest of the
    // week after it, still to come.
    const { container } = render(<GitHubHeatmap github={{ status: 'ready', days: [day('2026-09-29', 1, 1)] }} />);
    const grid = container.querySelector('[data-level]')!.parentElement!;
    expect([...grid.children].map((cell) => cell.getAttribute('data-level'))).toEqual([null, null, '1', null, null, null, null]);
  });

  it('says the signal is lost, and shows no year, when GitHub is unreachable', () => {
    const { container } = render(<GitHubHeatmap github={{ status: 'lost' }} />);
    expect(container.querySelector('[data-heatmap]')).toHaveAttribute('data-heatmap', 'lost');
    expect(container.querySelector('footer')).toHaveTextContent('SIGNAL LOST');
    expect(container.querySelector('header')).toHaveTextContent('----');
    // A dark grid, every cell empty: never a made-up year.
    const levels = new Set([...container.querySelectorAll('[data-level]')].map((el) => el.getAttribute('data-level')));
    expect([...levels]).toEqual(['0']);
  });
});
