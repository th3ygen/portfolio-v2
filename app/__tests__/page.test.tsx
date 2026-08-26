import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import Page from '@/app/page';
import { SECTIONS } from '@/content/sections';
import { OPERATOR } from '@/content/operator';

/** Sections rendered by SectionShell. s00 is a bespoke hero and is excluded. */
const SHELL_SECTIONS = SECTIONS.filter((s) => s.id !== 's00');

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

  it('renders one h2 per shell section, in order', () => {
    const { container } = render(<Page />);
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    expect(headings).toEqual(SHELL_SECTIONS.map((s) => s.title));
  });

  it('server-renders every section, so the page works without JavaScript', () => {
    const html = renderToString(<Page />);
    for (const section of SECTIONS) {
      expect(html).toContain(`id="${section.id}"`);
    }
    for (const section of SHELL_SECTIONS) {
      expect(html).toContain(section.title);
    }
    // The hero carries content rather than a section title.
    expect(html).toContain(OPERATOR.intro);
  });

  it('hides every ghost numeral from assistive tech', () => {
    const { container } = render(<Page />);
    const ghosts = container.querySelectorAll('[data-ghost-numeral]');
    expect(ghosts).toHaveLength(SHELL_SECTIONS.length);
    for (const ghost of ghosts) {
      expect(ghost).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('does not render the boot overlay on the server', () => {
    expect(renderToString(<Page />)).not.toContain('COLD BOOT');
  });
});
