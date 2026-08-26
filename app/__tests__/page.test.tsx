import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import Page from '@/app/page';
import { SECTIONS } from '@/content/sections';
import { OPERATOR } from '@/content/operator';

/**
 * The hero is the page's h1 and carries no section title or ghost numeral.
 * Every other section has both, whether it is a bespoke component or still a
 * placeholder shell — so these assertions hold as sections get built out.
 */
const TITLED_SECTIONS = SECTIONS.filter((s) => s.id !== 's00');

describe('page', () => {
  it('renders all seven section anchors in scroll order', () => {
    const { container } = render(<Page />);
    const ids = Array.from(container.querySelectorAll('section[id]')).map((el) => el.id);
    expect(ids).toEqual(['s00', 's01', 's02', 's03', 's04', 's05', 's06']);
  });

  it('points every rail link at a section that actually exists', () => {
    const { container } = render(<Page />);
    const ids = new Set(Array.from(container.querySelectorAll('section[id]')).map((el) => el.id));
    const railLinks = container.querySelectorAll('[data-rail-nav] a');
    expect(railLinks).toHaveLength(SECTIONS.length);
    for (const link of railLinks) {
      expect(ids.has((link.getAttribute('href') ?? '').replace('#', ''))).toBe(true);
    }
  });

  it('gives the page exactly one h1, and it is the operator name', () => {
    const { container } = render(<Page />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(`${OPERATOR.name[0]} ${OPERATOR.name[1]}`);
  });

  it('renders one h2 per non-hero section, in scroll order', () => {
    const { container } = render(<Page />);
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    expect(headings).toEqual(TITLED_SECTIONS.map((s) => s.title));
  });

  it('server-renders every section, so the page works without JavaScript', () => {
    const html = renderToString(<Page />);
    for (const section of SECTIONS) {
      expect(html).toContain(`id="${section.id}"`);
    }
    for (const section of TITLED_SECTIONS) {
      expect(html).toContain(section.title);
    }
    // The hero carries content rather than a section title.
    expect(html).toContain(OPERATOR.intro);
  });

  it('hides every ghost numeral from assistive tech', () => {
    // Count is not fixed per section: s05 carries one ghost year per post
    // rather than one section numeral. What must hold is that none of them
    // are ever exposed, since each repeats text stated elsewhere.
    const { container } = render(<Page />);
    const ghosts = container.querySelectorAll('[data-ghost-numeral]');
    expect(ghosts.length).toBeGreaterThanOrEqual(TITLED_SECTIONS.length);
    for (const ghost of ghosts) {
      expect(ghost).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('gives every non-hero section at least one ghost numeral', () => {
    const { container } = render(<Page />);
    for (const section of TITLED_SECTIONS) {
      const el = container.querySelector(`section#${section.id}`);
      expect(el?.querySelectorAll('[data-ghost-numeral]').length ?? 0).toBeGreaterThan(0);
    }
  });

  it('does not render the boot overlay on the server', () => {
    expect(renderToString(<Page />)).not.toContain('COLD BOOT');
  });
});
