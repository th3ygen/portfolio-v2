import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { TitleStage, STACK_BREAKPOINT } from '../TitleStage';
import { S01Operator } from '../index';
import { OPERATOR_ROLES } from '@/content/operator';

describe('TitleStage', () => {
  it('renders every title in the column against a fixed dev suffix', () => {
    const { container } = render(<TitleStage />);
    const items = [...container.querySelectorAll('[data-role-item]')].map(
      (el) => el.textContent,
    );
    // All of them are present at once — the column shows the whole list as
    // hollow outlines and only marks one solid.
    expect(items).toEqual([...OPERATOR_ROLES]);
    expect(container.querySelector('[data-title-suffix]')?.textContent).toBe('dev');
  });

  it('keeps every title readable as a prefix of the suffix', () => {
    // The lockup renders "<title> dev", so a title that already carries its own
    // noun — DEVOPS, or FULL-STACK DEVELOPER — reads as nonsense beside it.
    for (const role of OPERATOR_ROLES) {
      expect(role, role).not.toMatch(/DEV/);
    }
  });

  it('hides the whole stage from assistive tech', () => {
    const { container } = render(<TitleStage />);
    // The word cycles through five values as you scroll. A heading whose
    // accessible name changes announces itself five times, so the lockup is
    // decorative and the section's real h2 carries the name.
    const stage = container.querySelector('[data-title-lockup]')?.parentElement;
    expect(stage).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('h1, h2, h3')).toBeNull();
  });

  it('leaves the section with exactly one heading', () => {
    const { container } = render(<S01Operator />);
    expect(container.querySelectorAll('h2')).toHaveLength(1);
    expect(container.querySelector('h2')?.textContent).toBe('OPERATOR');
  });

  it('stacks at the same width in script and in stylesheet', () => {
    // matchMedia decides whether to measure a row or a column, and the
    // stylesheet decides which one is rendered. If these disagree the sequence
    // computes a centring offset for a layout that is not on screen.
    const css = readFileSync(
      'components/sections/S01Operator/TitleStage.module.css',
      'utf8',
    );
    const breakpoints = [...css.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map((m) =>
      Number(m[1]),
    );
    expect(breakpoints).toContain(STACK_BREAKPOINT);
  });

  it('sets the suffix in mono, against the display-face titles', () => {
    // The face change is what says `dev` is the constant and the column is the
    // variable. In the display face it read as a sixth entry in the list.
    const css = readFileSync(
      'components/sections/S01Operator/TitleStage.module.css',
      'utf8',
    );
    const suffix = /\.suffix\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(suffix).toContain('--font-mono');
    const item = /\.item\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(item).not.toContain('--font-mono');
  });

  it('renders a cycle readout sized to the number of titles', () => {
    const { container } = render(<TitleStage />);
    const readout = container.querySelector('[data-title-readout]');
    expect(readout).toBeInTheDocument();
    expect(readout?.textContent).toBe(`01/0${OPERATOR_ROLES.length}`);
  });

  it('marks a static active slot for the column to ride through', () => {
    const { container } = render(<TitleStage />);
    // The slot is a sibling of the column, not a child: it must not inherit the
    // transform, or the reading head would travel with the list it is reading.
    const slot = container.querySelector('[data-title-slot]');
    const column = container.querySelector('[data-title-column]');
    expect(slot).toBeInTheDocument();
    expect(column?.contains(slot ?? null)).toBe(false);
    expect(slot?.parentElement).toBe(column?.parentElement);
  });

  it('defaults the slot to its settled state, not mid-approach', () => {
    // The entrance animates these away from their CSS values and back. If the
    // defaults were the approach state instead, a JS failure would leave the
    // brackets frozen apart and half-transparent.
    const css = readFileSync(
      'components/sections/S01Operator/TitleStage.module.css',
      'utf8',
    );
    const slot = /\.slot\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(slot).toMatch(/--slot-spread:\s*0\s*;/);
    expect(slot).toMatch(/--slot-alpha:\s*0\.34\s*;/);
  });

  it('ends the cycle on the title actually being claimed', () => {
    expect(OPERATOR_ROLES[OPERATOR_ROLES.length - 1]).toBe('FULL-STACK');
    expect(OPERATOR_ROLES.length).toBeGreaterThan(1);
  });
});
