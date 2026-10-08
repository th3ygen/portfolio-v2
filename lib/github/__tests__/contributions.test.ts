import { describe, it, expect } from 'vitest';
import { daysBetween, parseContributions, summarise, type ContributionDay } from '../contributions';

/** A cut-down calendar in GitHub's markup: cells, then their tooltips. */
const cell = (i: number, date: string, level: number) =>
  `<td tabindex="0" data-ix="${i}" aria-selected="false" aria-describedby="contribution-graph-legend-level-${level}" style="width: 10px" data-date="${date}" id="contribution-day-component-0-${i}" data-level="${level}" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>`;
const tip = (i: number, text: string) =>
  `<tool-tip style="pointer-events: none;" id="tooltip-${i}" for="contribution-day-component-0-${i}" popover="manual" data-direction="n" data-type="label" data-view-component="true" class="sr-only position-absolute">${text}</tool-tip>`;

const HTML = [
  cell(0, '2026-09-26', 0),
  cell(1, '2026-09-24', 1),
  cell(2, '2026-09-25', 4),
  cell(3, '2026-09-27', 2),
  tip(0, 'No contributions on September 26th.'),
  tip(1, '1 contribution on September 24th.'),
  tip(2, '1,204 contributions on September 25th.'),
  tip(3, '3 contributions on September 27th.'),
].join('\n');

describe('parseContributions', () => {
  it('reads every day, oldest first, with its level and exact count', () => {
    expect(parseContributions(HTML)).toEqual([
      { date: '2026-09-24', level: 1, count: 1 },
      { date: '2026-09-25', level: 4, count: 1204 },
      { date: '2026-09-26', level: 0, count: 0 },
      { date: '2026-09-27', level: 2, count: 3 },
    ]);
  });

  it('counts an active day with no tooltip as one', () => {
    expect(parseContributions(cell(9, '2026-01-01', 3))).toEqual([{ date: '2026-01-01', level: 3, count: 1 }]);
  });

  it('throws on markup with no days, rather than reading a year off', () => {
    expect(() => parseContributions('<html><body>Rate limited</body></html>')).toThrow(/markup/);
  });
});

describe('summarise', () => {
  const days: ContributionDay[] = [
    { date: '2026-09-23', level: 2, count: 5 },
    { date: '2026-09-24', level: 0, count: 0 },
    { date: '2026-09-25', level: 1, count: 2 },
    { date: '2026-09-26', level: 3, count: 7 },
    { date: '2026-09-27', level: 1, count: 1 },
    { date: '2026-09-28', level: 0, count: 0 },
  ];

  it('totals the year, finds the best day and the last active one', () => {
    const s = summarise(days, '2026-09-28');
    expect(s.total).toBe(15);
    expect(s.best).toBe(7);
    expect(s.lastActive).toBe('2026-09-27');
  });

  it('counts the streak up to yesterday when today is still empty', () => {
    expect(summarise(days, '2026-09-28').streak).toBe(3);
  });

  it('counts today in the streak once it has contributions', () => {
    expect(summarise(days, '2026-09-27').streak).toBe(3);
  });

  it('has no streak after a day off', () => {
    expect(summarise(days, '2026-09-30').streak).toBe(0);
  });

  it('has no last active day in an empty year', () => {
    expect(summarise([{ date: '2026-01-01', level: 0, count: 0 }], '2026-01-01').lastActive).toBeNull();
  });
});

describe('daysBetween', () => {
  it('counts whole days, across a month end', () => {
    expect(daysBetween('2026-08-30', '2026-09-02')).toBe(3);
  });
});
