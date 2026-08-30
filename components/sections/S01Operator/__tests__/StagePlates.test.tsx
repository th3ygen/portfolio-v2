import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { StagePlates } from '../StagePlates';
import { STAGE_PLATES } from '@/content/operator';

describe('StagePlates', () => {
  it('renders one plate per entry, hidden from assistive tech', () => {
    const { container } = render(<StagePlates />);
    expect(container.querySelectorAll('[data-stage-plate]')).toHaveLength(STAGE_PLATES.length);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    // Atmosphere, not content — the same photographs carry real alt text in s03.
    for (const image of container.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt', '');
    }
  });

  it('splits scroll and pointer parallax across nested nodes', () => {
    const { container } = render(<StagePlates />);
    for (const plate of container.querySelectorAll('[data-stage-plate]')) {
      // useParallax's pointer loop assigns style.transform directly, so a node
      // carrying both would have its scroll tween overwritten every frame.
      expect(plate).not.toHaveAttribute('data-px');
      expect(plate.querySelector('[data-px]')).toBeInTheDocument();
    }
  });

  it('keeps size, travel and brightness in the same order', () => {
    // This is the depth illusion, not styling. A plate that is larger must also
    // travel further and sit brighter; a big dim plate creeping past a small
    // bright one reads as a mistake rather than as distance.
    const byWidth = [...STAGE_PLATES].sort((a, b) => b.width - a.width);
    for (let i = 1; i < byWidth.length; i += 1) {
      const near = byWidth[i - 1]!;
      const far = byWidth[i]!;
      expect(near.py, `${near.src} vs ${far.src}`).toBeGreaterThanOrEqual(far.py);
      expect(near.alpha, `${near.src} vs ${far.src}`).toBeGreaterThanOrEqual(far.alpha);
      expect(near.px, `${near.src} vs ${far.src}`).toBeGreaterThanOrEqual(far.px);
    }
  });

  it('stacks plates behind the title and the title behind the content', () => {
    // The plates are wide enough to run under the lockup now, so the order is
    // declared rather than left to markup order — which was all that kept them
    // apart while they still sat in the margins and never met.
    const zIndex = (file: string, selector: string) => {
      const css = readFileSync(`components/sections/S01Operator/${file}`, 'utf8');
      const rule = new RegExp(`\\${selector}\\s*\\{[^}]*\\}`).exec(css)?.[0] ?? '';
      return Number(/z-index:\s*(-?\d+)/.exec(rule)?.[1]);
    };

    const plates = zIndex('StagePlates.module.css', '.plates');
    const stage = zIndex('TitleStage.module.css', '.stage');
    const inner = zIndex('S01Operator.module.css', '.inner');

    expect(plates).toBeLessThan(stage);
    expect(stage).toBeLessThan(inner);
  });

  it('spreads the plates down both margins', () => {
    const sides = new Set(STAGE_PLATES.map((plate) => plate.side));
    expect(sides).toEqual(new Set(['left', 'right']));
    // No two at the same height, or they read as a pair rather than as scenery.
    const tops = STAGE_PLATES.map((plate) => plate.top);
    expect(new Set(tops).size).toBe(tops.length);
  });
});
