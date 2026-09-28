import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S04ToS05Zoom } from '../index';
import { RING_R, YEAR_STEP_DEG, markAngle } from '../RewindWorld';
import { TRAJECTORY_LABEL } from '@/content/trajectory';

describe('S04ToS05Zoom', () => {
  it('renders the stage, the camera and the clock', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-zoom-stage]')).toBeInTheDocument();
    expect(container.querySelector('[data-zoom-scaler]')).toBeInTheDocument();
    expect(container.querySelector('[data-clock]')).toBeInTheDocument();
    expect(container.querySelector('[data-uptime]')).toHaveTextContent('UPTIME');
  });

  it('draws a 60-tick face and three hands', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelectorAll('[data-tick]')).toHaveLength(60);
    for (const hand of ['h', 'm', 's']) {
      expect(container.querySelector(`[data-clock-hand="${hand}"]`)).toBeInTheDocument();
    }
    expect(container.querySelector('[data-clock-label]')).toHaveTextContent('REWIND 06Y');
  });

  it('puts every year from now back to 2020 on the ring, newest first', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    const years = [...container.querySelectorAll('[data-year-mark]')].map((el) => el.getAttribute('data-year-mark'));
    expect(years).toEqual(['2026', '2025', '2024', '2023', '2022', '2021', '2020']);
  });

  it('fills the rest of the twelve slots with blanks', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelectorAll('[data-slot]')).toHaveLength(12 - 7);
  });

  it('opens only the last year, so the dive has exactly one way through', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    const holes = container.querySelectorAll('[data-zoom-hole]');
    expect(holes).toHaveLength(1);
    const hole = holes[0]!;
    expect(hole.closest('[data-year-mark]')).toHaveAttribute('data-year-mark', '2020');
    // Shut at rest, and centred on the dot, or the camera flies past it.
    expect(hole).toHaveAttribute('r', '0');
    expect(hole).toHaveAttribute('cx', '0');
    expect(hole).toHaveAttribute('fill', 'var(--color-bg)');
  });

  it('locks onto the dot with four corners, at twelve', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelectorAll('[data-lock-corner]')).toHaveLength(4);
    expect(container.querySelector('[data-lock]')).toHaveAttribute('transform', `translate(0 ${-RING_R})`);
  });

  it('has no progress indicator — the summary and the clock are the content', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-beat-fill], [data-rewind-hud]')).toBeNull();
  });

  it('surrounds UPTIME with a summary whose data can become the clock', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelectorAll('[data-w-widget]')).toHaveLength(4);
    // One gauge (the rim), a bar per year (the ring), a cell per project
    // (ticks), a dot per running post (the hub).
    expect(container.querySelectorAll('[data-w-gauge]')).toHaveLength(1);
    const bars = [...container.querySelectorAll('[data-w-bar]')].map((b) => b.getAttribute('data-w-bar'));
    expect(bars).toEqual(['2020', '2021', '2022', '2023', '2024', '2025', '2026']);
    expect(container.querySelectorAll('[data-w-cell]')).toHaveLength(16);
    expect(container.querySelectorAll('[data-w-proc]')).toHaveLength(2);
  });

  it('prints the summary figures in the markup, not only as they count up', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    const counts = [...container.querySelectorAll('[data-w-count]')];
    expect(counts.map((el) => el.getAttribute('data-w-count'))).toEqual(['6', '16']);
    expect(counts.map((el) => el.textContent)).toEqual(['06', '16']);
  });

  it('keeps the summary from assistive tech — the sections it restates say it in order', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-w-widget]')!.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('starts with the page not held', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-zoom-stage]')).toHaveAttribute('data-held', 'false');
  });

  it('renders the section meta label', () => {
    render(<S04ToS05Zoom startYear={2026} />);
    expect(screen.getByText(TRAJECTORY_LABEL)).toBeInTheDocument();
  });

  it('hides every SVG from assistive tech — s05 carries the real content', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});

describe('opening frame', () => {
  it('opens on UPTIME alone, whatever the DOM was holding', () => {
    // The timeline seeks both ways; an effect that re-runs over a stage left
    // mid-dive (Strict Mode, Fast Refresh, a restored reload) must start from
    // UPTIME. UPTIME once failed to come back 4 reloads in 4 for this.
    const first = render(<S04ToS05Zoom startYear={2026} />);
    first.container.querySelector<SVGElement>('[data-uptime]')!.style.opacity = '0';
    first.unmount();

    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector<SVGElement>('[data-uptime]')!.style.opacity).toBe('1');
    expect(container.querySelector<SVGElement>('[data-hub]')!.style.opacity).toBe('0');
    expect(container.querySelector<HTMLElement>('[data-w-widget]')!.style.opacity).toBe('0');
  });
});

describe('markAngle', () => {
  it('puts this year at twelve and each year before one slot anticlockwise', () => {
    expect(markAngle(2026, 2026)).toBe(0);
    expect(markAngle(2025, 2026)).toBe(-YEAR_STEP_DEG);
  });

  it('brings 2020 to twelve after one slot per year rewound', () => {
    const turned = markAngle(2020, 2026) + 6 * YEAR_STEP_DEG;
    expect(turned).toBe(0);
  });
});
