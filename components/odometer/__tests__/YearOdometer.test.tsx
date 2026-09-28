import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearOdometer } from '../YearOdometer';

const svg = (children: React.ReactNode) => <svg>{children}</svg>;

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

  it('lands on a discrete jump', () => {
    const { rerender } = render(svg(<YearOdometer year={2020} mode="discrete" />));
    rerender(svg(<YearOdometer year={2023} mode="discrete" />));
    expect(screen.getByRole('img', { name: '2023' })).toBeInTheDocument();
  });

  it('writes the year with a dot between the century and the rest', () => {
    const { container } = render(svg(<YearOdometer year={2026} />));
    expect(container.querySelector('[data-year-dot]')).toBeInTheDocument();
  });
});
