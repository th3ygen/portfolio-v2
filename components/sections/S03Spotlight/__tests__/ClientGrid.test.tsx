import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientGrid } from '../ClientGrid';
import { CLIENTS, CLIENTS_HEAD } from '@/content/clients';

const MONO_DIR = 'public/img/clients-mono';

describe('ClientGrid', () => {
  it('renders every client with its name as alt text', () => {
    render(<ClientGrid />);
    for (const client of CLIENTS) {
      expect(screen.getByAltText(client.name)).toBeInTheDocument();
    }
  });

  it('states the count the head claims', () => {
    render(<ClientGrid />);
    expect(screen.getByText(CLIENTS_HEAD.note)).toBeInTheDocument();
    // The head says "12 ORGANISATIONS"; adding a client without updating it
    // makes the section lie about itself.
    const claimed = Number(/^(\d+)/.exec(CLIENTS_HEAD.note)?.[1]);
    expect(claimed).toBe(CLIENTS.length);
  });

  it('points every client at a generated logo that exists', () => {
    // The grid reads from clients-mono, not the raw clients directory: the
    // source artwork is unusable on the page background without the per-logo
    // normalisation baked in by scripts/normalise-client-logos.py.
    for (const client of CLIENTS) {
      expect(existsSync(`${MONO_DIR}/${client.slug}.png`), client.slug).toBe(true);
    }
  });

  it('leaves no generated logo unused', () => {
    const generated = readdirSync(MONO_DIR).map((file) => file.replace(/\.png$/, ''));
    const used = new Set(CLIENTS.map((client) => client.slug));
    for (const slug of generated) {
      expect(used.has(slug), `${slug}.png is generated but no client uses it`).toBe(true);
    }
  });

  it('locks by callsign, not by the full name', () => {
    const { container } = render(<ClientGrid />);
    const locks = [...container.querySelectorAll('[data-lock]')].map((el) =>
      el.getAttribute('data-lock'),
    );
    expect(locks).toHaveLength(CLIENTS.length);
    // The readout trails the cursor across neighbouring cells, so a 45-character
    // ministry name would sweep the whole row. Callsigns stay terse.
    for (const lock of locks) {
      expect((lock ?? '').length).toBeLessThanOrEqual(16);
    }
    expect(locks).toContain('KPKM');
  });

  it('applies no CSS filter to the logos', () => {
    // Normalisation is baked into the assets because each logo needs its own
    // contrast curve — luminance across the set spans 51 to 198, and a single
    // filter that rescues the dark ones blows out the light ones.
    const css = readFileSync(
      'components/sections/S03Spotlight/ClientGrid.module.css',
      'utf8',
    );
    const logoRule = /\.logo\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(logoRule).not.toBe('');
    expect(logoRule).not.toContain('filter');
  });
});
