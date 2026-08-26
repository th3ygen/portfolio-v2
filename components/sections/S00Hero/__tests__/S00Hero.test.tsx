import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S00Hero } from '../index';
import { OPERATOR, SOCIALS, HERO_CTAS, READOUT } from '@/content/operator';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('S00Hero', () => {
  it('renders the name as one accessible heading, despite two styled lines', () => {
    render(<S00Hero bootDone />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(`${OPERATOR.name[0]} ${OPERATOR.name[1]}`);
  });

  it('renders the whoami prompt', () => {
    render(<S00Hero bootDone />);
    expect(screen.getByText(OPERATOR.prompt)).toBeInTheDocument();
  });

  it('renders the intro copy', () => {
    render(<S00Hero bootDone />);
    expect(screen.getByText(OPERATOR.intro)).toBeInTheDocument();
  });

  it('renders all three calls to action with their destinations', () => {
    render(<S00Hero bootDone />);
    for (const cta of HERO_CTAS) {
      expect(screen.getByRole('link', { name: cta.label })).toHaveAttribute('href', cta.href);
    }
  });

  it('opens external social links safely in a new tab', () => {
    render(<S00Hero bootDone />);
    for (const social of SOCIALS) {
      const link = screen.getByRole('link', { name: social.label });
      expect(link).toHaveAttribute('href', social.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('renders every readout row label', () => {
    render(<S00Hero bootDone />);
    for (const row of READOUT) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
    }
  });

  it('renders the readout as a description list, not a table of divs', () => {
    const { container } = render(<S00Hero bootDone />);
    const panel = container.querySelector('[data-readout] dl');
    expect(panel).toBeInTheDocument();
    expect(panel?.querySelectorAll('dt')).toHaveLength(READOUT.length);
  });

  it('hides the decorative ticker and greebles from assistive tech', () => {
    const { container } = render(<S00Hero bootDone />);
    expect(container.querySelector('[data-ticker]')?.closest('[aria-hidden="true"]')).not.toBeNull();
    for (const layer of container.querySelectorAll('[data-hero-parallax]')) {
      expect(layer).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders the same content whether or not boot has finished', () => {
    // bootDone gates the intro *animation*, never the content — a visitor who
    // never triggers it must still get the whole hero.
    const before = render(<S00Hero bootDone={false} />);
    const withoutBoot = before.container.textContent;
    before.unmount();
    const after = render(<S00Hero bootDone />);
    expect(after.container.textContent).toBe(withoutBoot);
  });

  it('marks the canvas decorative', () => {
    const { container } = render(<S00Hero bootDone />);
    expect(container.querySelector('[data-mosh]')).toHaveAttribute('aria-hidden', 'true');
  });
});
