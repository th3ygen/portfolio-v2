import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S01Operator } from '../index';
import { CORE_LOADOUT, OPERATOR, OPERATOR_CARD, PORTRAIT } from '@/content/operator';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('S01Operator', () => {
  it('renders the lead statement as one sentence across its three parts', () => {
    const { container } = render(<S01Operator />);
    // Queried as the section's first paragraph, not by a motion attribute —
    // this is a content assertion and should not move when the reveal does.
    const lead = container.querySelector('p');
    expect(lead?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      `${OPERATOR.lead[0]} ${OPERATOR.lead[1]} ${OPERATOR.lead[2]}`,
    );
  });

  it('renders every body copy block', () => {
    render(<S01Operator />);
    for (const block of OPERATOR.body) {
      expect(screen.getByText(block)).toBeInTheDocument();
    }
  });

  it('renders all eight core loadout items as a list', () => {
    render(<S01Operator />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(CORE_LOADOUT.length);
    expect(CORE_LOADOUT).toHaveLength(8);
  });

  it('renders each loadout name and its detail line', () => {
    render(<S01Operator />);
    for (const item of CORE_LOADOUT) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.detail)).toBeInTheDocument();
    }
  });

  it('marks exactly the two accented loadout entries', () => {
    const { container } = render(<S01Operator />);
    const accented = container.querySelectorAll('[data-accent="true"]');
    expect(Array.from(accented).map((el) => el.textContent)).toEqual([
      'MQTT / Socket.io',
      'WebRTC',
    ]);
  });

  it('renders the identity card as a description list', () => {
    render(<S01Operator />);
    for (const row of OPERATOR_CARD) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
      expect(screen.getByText(row.value)).toBeInTheDocument();
    }
  });

  it('renders the operator portrait, not the pending frame', () => {
    const { container } = render(<S01Operator />);
    // The inverse of the old guard: a real photograph now exists, so the
    // pending frame must be gone and an accessible <img> must be present.
    expect(PORTRAIT.src).not.toBeNull();
    expect(container.querySelector('[data-portrait-pending]')).toBeNull();
    expect(screen.getByAltText(PORTRAIT.alt)).toBeInTheDocument();
  });

  it('leaves the portrait frame out of the page-wide box reveal', () => {
    const { container } = render(<S01Operator />);
    // The accent block sweeping the photo fought the cutout drifting over it —
    // two competing motions on one card. The body copy still takes the reveal.
    const base = container.querySelector(`img[alt="${PORTRAIT.alt}"]`);
    expect(base?.parentElement).not.toHaveAttribute('data-box-reveal');
    expect(container.querySelectorAll('[data-box-reveal]').length).toBeGreaterThan(0);
  });

  it('layers a decorative alpha cutout over the flat portrait', () => {
    const { container } = render(<S01Operator />);
    const alpha = container.querySelector('[data-portrait-alpha]');
    expect(alpha).toBeInTheDocument();
    expect(alpha).toHaveAttribute('aria-hidden', 'true');
    // Same subject as the base photo, so it must not be announced twice.
    expect(alpha?.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('keeps the cutout outside the cropped photo box so it can overflow', () => {
    const { container } = render(<S01Operator />);
    // .portrait carries overflow: hidden to crop the photo to the frame.
    // Nesting the cutout inside it clips the whole point of the effect — the
    // silhouette breaking past the frame's edge.
    const cropBox = container.querySelector(`img[alt="${PORTRAIT.alt}"]`)?.parentElement;
    expect(cropBox).toBeTruthy();
    expect(cropBox?.querySelector('[data-portrait-alpha]')).toBeNull();
    expect(container.querySelector('[data-portrait-alpha]')).toBeInTheDocument();
  });

  it('splits scroll and pointer parallax across nested elements', () => {
    const { container } = render(<S01Operator />);
    // useParallax's pointer loop assigns style.transform directly, so an
    // element carrying both data-py and data-px would have its GSAP scroll
    // tween overwritten every frame. The two must stay on separate nodes.
    const scrollLayer = container.querySelector('[data-portrait-alpha]');
    expect(scrollLayer).not.toHaveAttribute('data-px');
    expect(scrollLayer?.querySelector('[data-px]')).toBeInTheDocument();
  });

  it('scales the cutout enough to cover the subject at full travel', () => {
    const { container } = render(<S01Operator />);
    const scrollLayer = container.querySelector('[data-portrait-alpha]');
    const pointerLayer = scrollLayer?.querySelector('[data-px]');
    const travel =
      Number(scrollLayer?.getAttribute('data-py')) +
      Number(pointerLayer?.getAttribute('data-px'));
    expect(travel).toBeGreaterThan(0);

    const css = readFileSync(
      'components/sections/S01Operator/S01Operator.module.css',
      'utf8',
    );
    const rule = css.match(/\.portraitAlphaImage\s*\{[^}]*\}/)?.[0] ?? '';
    const scale = Number(rule.match(/scale\(([\d.]+)\)/)?.[1]);
    expect(scale).toBeGreaterThan(1);

    // Scaling moves a point away from the origin in proportion to its distance
    // from it, so the clearance the cutout gains over the flat photo beneath is
    // (scale - 1) * that distance — smallest at whichever visible silhouette
    // edge sits CLOSEST to the origin, not at the one furthest away.
    //
    // Frame is the 340px card at 4/5, so 340x425, and the origin is anchored at
    // the bottom centre (170, 425). The nearest visible silhouette edge is the
    // ear, measured off the photo at roughly (105, 241) in that frame. An
    // earlier version of this test measured from the crown instead, which is
    // the furthest point, so it passed while a second ear was plainly visible.
    // Origin rides just above the bottom edge, not on it: at exactly 100% the
    // bottom is a fixed point under scaling and the feet can never extend past
    // the frame to be occluded by the meta bar.
    const originPercent = Number(rule.match(/transform-origin:\s*50% ([\d.]+)%/)?.[1]);
    expect(originPercent).toBeGreaterThan(50);
    expect(originPercent).toBeLessThan(100);

    const FRAME = { w: 340, h: 425 };
    const EAR = { x: 105, y: 241 };
    const ORIGIN = { x: FRAME.w / 2, y: (originPercent / 100) * FRAME.h };
    const lever = Math.hypot(ORIGIN.x - EAR.x, ORIGIN.y - EAR.y);

    expect((scale - 1) * lever).toBeGreaterThanOrEqual(travel);
  });

  it('does not clip the portrait frame shut at rest', () => {
    // The old steps(5) wipe parked `clip-path: inset(0 0 100% 0)` on .portrait
    // in CSS, so a JS failure hid the photograph permanently — and a hard edge
    // across a face reads as a half-loaded JPEG at any scrub position. Guards
    // against reintroducing an edge-based reveal.
    const css = readFileSync(
      'components/sections/S01Operator/S01Operator.module.css',
      'utf8',
    );
    const portraitRule = css.match(/\.portrait\s*\{[^}]*\}/)?.[0] ?? '';
    expect(portraitRule).not.toBe('');
    expect(portraitRule).not.toContain('clip-path');
  });

  it('marks the ACQUIRING OPERATOR tag and scan line decorative', () => {
    const { container } = render(<S01Operator />);
    expect(container.querySelector('[data-tag="acquiring"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('exposes the section heading', () => {
    render(<S01Operator />);
    expect(screen.getByRole('heading', { level: 2, name: 'OPERATOR' })).toBeInTheDocument();
  });
});
