import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S02Manifest } from '../index';
import {
  MANIFEST,
  MANIFEST_COUNT,
  MANIFEST_EQUIPPED,
  MANIFEST_EQUIPPED_TAG,
} from '@/content/manifest';

const TOTAL_ITEMS = MANIFEST.reduce((sum, c) => sum + c.items.length, 0);

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('S02Manifest', () => {
  it('renders the whole manifest', () => {
    render(<S02Manifest />);
    expect(screen.getAllByRole('listitem')).toHaveLength(TOTAL_ITEMS);
  });

  it('renders one subheading per lettered category', () => {
    render(<S02Manifest />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(MANIFEST.map((c) => c.category));
  });

  it('has no collapse control — the manifest is always open', () => {
    render(<S02Manifest />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('tags the rows that are also in the core loadout', () => {
    const { container } = render(<S02Manifest />);
    const tagged = [...container.querySelectorAll('li[data-equipped]')];
    expect(tagged).toHaveLength(MANIFEST_EQUIPPED.size);
    for (const li of tagged) {
      expect(li).toHaveTextContent(MANIFEST_EQUIPPED_TAG);
      expect(MANIFEST_EQUIPPED).toContain(li.getAttribute('data-equipped'));
    }
  });

  it('says a row is equipped in words, since the tag itself is hidden from screen readers', () => {
    const { container } = render(<S02Manifest />);
    const li = container.querySelector('li[data-equipped]')!;
    expect(li.querySelector('[aria-hidden="true"]')).toHaveTextContent(MANIFEST_EQUIPPED_TAG);
    expect(li.querySelector('.sr-only')).toHaveTextContent(/core loadout/i);
  });

  describe('with reduced motion', () => {
    beforeEach(() => stubReducedMotion(true));

    it('shows the finished count at once', () => {
      const { container } = render(<S02Manifest />);
      const count = container.querySelector('[data-manifest-count]');
      expect(count).toHaveTextContent(String(MANIFEST_COUNT));
    });

    it('shows the grid, every row and every tag at once', () => {
      const { container } = render(<S02Manifest />);
      const grid = container.querySelector<HTMLElement>('[data-manifest-grid]')!;
      expect(grid.style.clipPath).toBe('');
      for (const li of container.querySelectorAll('li')) {
        expect((li as HTMLElement).style.opacity).not.toBe('0');
      }
      expect(container.querySelector('section')).not.toHaveAttribute('data-equipped', 'off');
    });
  });

  describe('with motion', () => {
    beforeEach(() => stubReducedMotion(false));

    it('holds the grid shut and the rows back until it scrolls in', () => {
      const { container } = render(<S02Manifest />);
      const grid = container.querySelector<HTMLElement>('[data-manifest-grid]')!;
      expect(grid.style.clipPath).toBe('inset(0% 0% 100% 0%)');
      const first = container.querySelector('li')!;
      expect(first.style.opacity).toBe('0');
      expect(container.querySelector('[data-manifest-count]')).toHaveTextContent('00');
      expect(container.querySelector('section')).toHaveAttribute('data-equipped', 'off');
    });
  });
});
