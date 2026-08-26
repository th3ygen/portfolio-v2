import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S03Spotlight } from '../index';
import { SPOTLIGHTS } from '@/content/spotlights';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('S03Spotlight', () => {
  it('renders all four projects as list items', () => {
    render(<S03Spotlight />);
    expect(screen.getAllByRole('listitem')).toHaveLength(SPOTLIGHTS.length);
    expect(SPOTLIGHTS).toHaveLength(4);
  });

  it('renders each project name as a subheading, in order', () => {
    render(<S03Spotlight />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(SPOTLIGHTS.map((p) => p.name));
  });

  it('renders each tagline, blurb, and stack', () => {
    render(<S03Spotlight />);
    for (const project of SPOTLIGHTS) {
      expect(screen.getByText(project.tagline)).toBeInTheDocument();
      expect(screen.getByText(project.blurb)).toBeInTheDocument();
      expect(screen.getByText(project.stack)).toBeInTheDocument();
    }
  });

  it('gives every image a descriptive alt naming its project', () => {
    render(<S03Spotlight />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(SPOTLIGHTS.length);
    for (const [index, image] of images.entries()) {
      const alt = image.getAttribute('alt') ?? '';
      expect(alt).toContain(SPOTLIGHTS[index]?.name ?? '');
      expect(alt.length).toBeGreaterThan(10);
    }
  });

  it('alternates the image side down the column', () => {
    const { container } = render(<S03Spotlight />);
    const flags = Array.from(container.querySelectorAll('[data-spotlight]')).map((el) =>
      el.getAttribute('data-reversed'),
    );
    expect(flags).toEqual(['false', 'true', 'false', 'true']);
  });

  it('renders every meta cell plus a stack cell per project', () => {
    const { container } = render(<S03Spotlight />);
    for (const project of SPOTLIGHTS) {
      const card = container.querySelector(`[data-spotlight="${project.id}"]`);
      const terms = Array.from(card?.querySelectorAll('dt') ?? []).map((t) => t.textContent);
      expect(terms).toEqual([...project.meta.map((m) => m.label), 'STACK']);
    }
  });

  it('hides the code and year chips from assistive tech — they repeat the copy', () => {
    const { container } = render(<S03Spotlight />);
    for (const project of SPOTLIGHTS) {
      const card = container.querySelector(`[data-spotlight="${project.id}"]`);
      const chips = card?.querySelector(`[aria-hidden="true"]`);
      expect(chips).toBeInTheDocument();
    }
  });

  it('renders the section intro and heading', () => {
    render(<S03Spotlight />);
    expect(screen.getByRole('heading', { level: 2, name: 'SPOTLIGHT' })).toBeInTheDocument();
  });
});
