import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { RailNav } from '../RailNav';
import { Masthead } from '../Masthead';
import { Ambient } from '../Ambient';
import { SECTIONS, HEADER } from '@/content/sections';

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('RailNav', () => {
  it('renders one anchor per section, in order', () => {
    render(<RailNav />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(SECTIONS.length);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      SECTIONS.map((s) => `#${s.id}`),
    );
  });

  it('exposes itself as navigation with an accessible name', () => {
    render(<RailNav />);
    expect(screen.getByRole('navigation', { name: /section/i })).toBeInTheDocument();
  });

  it('gives each link a readable name, not just a number', () => {
    render(<RailNav />);
    expect(screen.getByRole('link', { name: /UPTIME/ })).toHaveAttribute('href', '#s05');
    expect(screen.getByRole('link', { name: /SEND/ })).toHaveAttribute('href', '#s06');
  });

  it('marks no section current before scroll resolves', () => {
    render(<RailNav />);
    expect(screen.queryByRole('link', { current: 'true' })).not.toBeInTheDocument();
  });
});

describe('Masthead', () => {
  it('renders the operator and build readouts', () => {
    render(<Masthead />);
    expect(screen.getByText(HEADER.operator)).toBeInTheDocument();
    expect(screen.getByText(HEADER.build)).toBeInTheDocument();
  });

  it('server-renders the clock placeholder, so hydration cannot mismatch', () => {
    // A real time rendered on the server would never match what the client
    // computes a moment later. Asserting this client-side is impossible —
    // Testing Library flushes the effect during render — so check the actual
    // server output.
    const html = renderToString(<Masthead />);
    expect(html).toContain(HEADER.clockPlaceholder);
    expect(html).not.toMatch(/\d{2}:\d{2}:\d{2} MYT/);
  });

  it('replaces the placeholder with a real time after mount', () => {
    vi.useFakeTimers();
    render(<Masthead />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByText(HEADER.clockPlaceholder)).not.toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}:\d{2} MYT$/)).toBeInTheDocument();
  });

  it('hides the decorative status dot from assistive tech', () => {
    const { container } = render(<Masthead />);
    expect(container.querySelector('[data-status-dot]')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Ambient', () => {
  it('renders its layers inert and hidden from assistive tech', () => {
    const { container } = render(<Ambient />);
    const layers = container.querySelectorAll('[data-ambient]');
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('drops the flicker animation under reduced motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: true, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
    const { container } = render(<Ambient />);
    expect(container.querySelector('[data-ambient="scanline"]')).toHaveAttribute(
      'data-static',
      'true',
    );
  });
});
