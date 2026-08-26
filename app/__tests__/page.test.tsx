import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import Page from '@/app/page';
import { SECTIONS } from '@/content/sections';

describe('page', () => {
  it('renders all seven section anchors in scroll order', () => {
    const { container } = render(<Page />);
    const ids = Array.from(container.querySelectorAll('section[id]')).map((el) => el.id);
    expect(ids).toEqual(['s00', 's01', 's02', 's03', 's04', 's05', 's06']);
  });

  it('gives every rail link a section that actually exists', () => {
    const { container } = render(<Page />);
    const ids = new Set(Array.from(container.querySelectorAll('section[id]')).map((el) => el.id));
    for (const link of container.querySelectorAll('nav a')) {
      const href = link.getAttribute('href') ?? '';
      expect(ids.has(href.replace('#', ''))).toBe(true);
    }
  });

  it('renders one h2 per section', () => {
    const { container } = render(<Page />);
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    expect(headings).toEqual(SECTIONS.map((s) => s.title));
  });

  it('server-renders every section, so the page works without JavaScript', () => {
    const html = renderToString(<Page />);
    for (const section of SECTIONS) {
      expect(html).toContain(`id="${section.id}"`);
      expect(html).toContain(section.title);
    }
  });

  it('hides the decorative ghost numerals from assistive tech', () => {
    const { container } = render(<Page />);
    const ghosts = container.querySelectorAll('section > [aria-hidden="true"]');
    expect(ghosts).toHaveLength(SECTIONS.length);
  });
});
