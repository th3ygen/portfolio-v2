import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { S04Index } from '../index';
import { INDEX_ROWS } from '@/content/index-rows';
import { SPOTLIGHTS } from '@/content/spotlights';

describe('S04Index', () => {
  it('renders a labelled list with one tile per record', () => {
    render(<S04Index />);
    const list = screen.getByRole('list', { name: 'Every system shipped' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(INDEX_ROWS.length);
    expect(INDEX_ROWS).toHaveLength(16);
  });

  it('makes each system name a heading, in index order', () => {
    render(<S04Index />);
    const names = screen.getAllByRole('heading', { level: 3 });
    expect(names.map((h) => h.textContent)).toEqual(INDEX_ROWS.map((r) => r.name));
  });

  it('renders every sector and key tech line', () => {
    render(<S04Index />);
    for (const row of INDEX_ROWS) {
      expect(screen.getAllByText(row.keyTech).length).toBeGreaterThan(0);
    }
  });

  it('gives exactly the four s03 projects the 2x2 hero tiles', () => {
    const { container } = render(<S04Index />);
    const heroes = Array.from(container.querySelectorAll('[data-size="hero"]')).map(
      (el) => el.getAttribute('data-lock'),
    );
    expect(heroes).toEqual(SPOTLIGHTS.map((p) => p.name));
    expect(heroes).toHaveLength(4);
  });

  it('keeps the revealed screens out of the accessibility tree', () => {
    const { container } = render(<S04Index />);
    for (const img of container.querySelectorAll('img')) {
      expect(img).toHaveAttribute('alt', '');
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('makes every tile a reticle lock target', () => {
    const { container } = render(<S04Index />);
    expect(container.querySelectorAll('li[data-lock]')).toHaveLength(INDEX_ROWS.length);
  });

  it('renders the section heading', () => {
    render(<S04Index />);
    expect(screen.getByRole('heading', { level: 2, name: 'FULL INDEX' })).toBeInTheDocument();
  });
});
