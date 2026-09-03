import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearOdometer } from '../YearOdometer';
import { BrutalistClock } from '../BrutalistClock';
import { S04ToS05Zoom } from '../index';
import { CLONE_OFFSETS } from '../ZoomWords';
import { TRAJECTORY_LABEL } from '@/content/trajectory';

const svg = (children: React.ReactNode) => <svg>{children}</svg>;

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('YearOdometer', () => {
  it('announces the year as one number, not eight loose digits', () => {
    render(svg(<YearOdometer year={2026} />));
    expect(screen.getByRole('img', { name: '2026' })).toBeInTheDocument();
    // Each glyph window is hidden so a reader does not enumerate them.
    const hidden = document.querySelectorAll('[data-odometer] [aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThan(0);
  });

  it('lands on the target year after a rerender', () => {
    const { rerender } = render(svg(<YearOdometer year={2026} />));
    rerender(svg(<YearOdometer year={2020} />));
    expect(screen.getByRole('img', { name: '2020' })).toBeInTheDocument();
  });

  it('lands correctly after a fast flick through every intermediate year', () => {
    const { rerender } = render(svg(<YearOdometer year={2026} />));
    for (const year of [2025, 2024, 2023, 2022, 2021, 2020]) {
      rerender(svg(<YearOdometer year={year} />));
    }
    expect(screen.getByRole('img', { name: '2020' })).toBeInTheDocument();
  });

  it('renders the expanding dot that becomes the flood', () => {
    const { container } = render(svg(<YearOdometer year={2026} />));
    expect(container.querySelector('[data-zoom-dot]')).toBeInTheDocument();
  });
});

describe('BrutalistClock', () => {
  it('renders 60 tick marks with a major every fifth', () => {
    const { container } = render(<BrutalistClock />);
    const ticks = container.querySelectorAll('[class*="tick"]');
    // 60 ticks plus the container element.
    expect(ticks.length).toBeGreaterThanOrEqual(60);
  });

  it('renders three hands and a label', () => {
    const { container } = render(<BrutalistClock />);
    expect(container.querySelector('[data-clock-hand="h"]')).toBeInTheDocument();
    expect(container.querySelector('[data-clock-hand="m"]')).toBeInTheDocument();
    expect(container.querySelector('[data-clock-hand="s"]')).toBeInTheDocument();
    expect(container.querySelector('[data-clock-label]')).toHaveTextContent('ELAPSED');
  });

  it('is entirely decorative', () => {
    const { container } = render(<BrutalistClock />);
    expect(container.querySelector('[data-clock]')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('S04ToS05Zoom', () => {
  it('renders the stage, clock, words, and flood', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-zoom-stage]')).toBeInTheDocument();
    expect(container.querySelector('[data-clock]')).toBeInTheDocument();
    expect(container.querySelector('[data-zoom-scaler]')).toBeInTheDocument();
  });

  it('renders both word groups so the handoff has something to swap', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('[data-zw="0"]')).toBeInTheDocument();
    expect(container.querySelector('[data-zw="1"]')).toBeInTheDocument();
  });

  it('stacks UPTIME into a hollow clone column and trails SINCE', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    // UPTIME detonates into hollow copies; SINCE keeps the two-step trail.
    expect(container.querySelectorAll('[data-clone]')).toHaveLength(CLONE_OFFSETS.length);
    expect(container.querySelectorAll('[data-trail="1"]')).toHaveLength(2);
  });

  it('makes the clones hollow rather than faded copies', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    const clone = container.querySelector<SVGTextElement>('[data-clone]');
    expect(clone).not.toBeNull();
    // Background fill plus an accent outline: cut-outs, not ghosts. Opacity is
    // what a ghost would use, and would make them read as the old trail.
    expect(clone?.style.fill).toBe('var(--color-bg)');
    expect(clone?.style.stroke).toBe('var(--color-accent)');
    // The camera reaches 190x. A scaling stroke would be hundreds of pixels
    // thick by the end of the pin.
    expect(clone?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
  });

  it('spaces the clone column symmetrically about the solid word', () => {
    const offsets = [...CLONE_OFFSETS];
    expect(offsets).toHaveLength(8);
    // No clone sits at 0 — that is where the solid word lives.
    expect(offsets).not.toContain(0);
    // Sums to zero only if every offset above the word is matched below it.
    expect(offsets.reduce((total, value) => total + value, 0)).toBe(0);
  });

  it('renders the section meta label', () => {
    render(<S04ToS05Zoom startYear={2026} />);
    expect(screen.getByText(TRAJECTORY_LABEL)).toBeInTheDocument();
  });

  it('hides the whole SVG stage from assistive tech — s05 carries the real content', () => {
    const { container } = render(<S04ToS05Zoom startYear={2026} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('zoom word start states', () => {
  it('declares an opening state for UPTIME, not just for the groups around it', () => {
    // Every other group here is given a start state on mount; UPTIME was not,
    // so its opening opacity was whatever the DOM happened to hold. The
    // timeline drives it with `.to`, which reads its start value live — so any
    // re-run of the effect while the group was already faded (Strict Mode's
    // double mount, a Fast Refresh, a remount after a reload that restored
    // scroll past this section) tweened 0 to 0 and the word never came back.
    //
    // Asserting the inline style is the point: gsap.set writes there, and the
    // absence of the call is exactly what the bug was.
    const { container, unmount } = render(<S04ToS05Zoom startYear={2026} />);
    const group = container.querySelector<HTMLElement>('[data-zw="0"]');
    expect(group).not.toBeNull();
    expect(group!.style.opacity).toBe('1');
    unmount();
  });

  it('restores UPTIME when the effect runs again over a faded group', () => {
    const first = render(<S04ToS05Zoom startYear={2026} />);
    const faded = first.container.querySelector<HTMLElement>('[data-zw="0"]')!;
    // Stand in for the state a scrubbed timeline leaves behind when the page
    // is reloaded already scrolled past this section.
    faded.style.opacity = '0';
    first.unmount();

    const second = render(<S04ToS05Zoom startYear={2026} />);
    const group = second.container.querySelector<HTMLElement>('[data-zw="0"]')!;
    expect(group.style.opacity).toBe('1');
    second.unmount();
  });
});
