import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { TitleStage, STACK_BREAKPOINT, RUNWAY_VH } from '../TitleStage';
import { S01Operator } from '../index';
import { OPERATOR_OPENERS, OPERATOR_ROLES, SUFFIX_FROM } from '@/content/operator';

describe('TitleStage', () => {
  it('renders every title in the column against a fixed dev suffix', () => {
    const { container } = render(<TitleStage />);
    const items = [...container.querySelectorAll('[data-role-item]')].map(
      (el) => el.textContent,
    );
    // All of them are present at once — the column shows the whole list as
    // hollow outlines and only marks one solid.
    expect(items).toEqual([...OPERATOR_OPENERS, ...OPERATOR_ROLES]);
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

  it('sets the suffix in the same face as the titles', () => {
    // It has to share their vocabulary to share their released state — in mono
    // it was outside the column's typography and could not go hollow with it.
    const css = readFileSync(
      'components/sections/S01Operator/TitleStage.module.css',
      'utf8',
    );
    const suffix = /\.suffix\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(suffix).not.toContain('--font-mono');

    // And it must declare the hollow fallback the titles use.
    expect(css).toMatch(/\.suffix\[data-suffix-hollow='true'\]/);
  });

  it('renders a cycle readout sized to the number of titles', () => {
    const { container } = render(<TitleStage />);
    const readout = container.querySelector('[data-title-readout]');
    expect(readout).toBeInTheDocument();
    const total = OPERATOR_OPENERS.length + OPERATOR_ROLES.length;
    expect(readout?.textContent).toBe(`01/0${total}`);
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

  it('opens on a line that stands without the suffix', () => {
    // `hello world!` is not a role and reads alone; `dev` does not appear until
    // the column reaches SUFFIX_FROM, where the line becomes a whole phrase.
    expect(OPERATOR_OPENERS[0]).toBe('hello world!');
    expect(SUFFIX_FROM).toBe(1);
    expect(OPERATOR_OPENERS[SUFFIX_FROM]).toBe('im a');
  });

  it('maps the timeline onto exactly the runway it is given', () => {
    // The runway is the scroll distance the pinned stage is dragged through and
    // the timeline is mapped onto it. Too short and the sequence is cut off
    // before it ends; too long and it finishes early and holds.
    const css = readFileSync(
      'components/sections/S01Operator/S01Operator.module.css',
      'utf8',
    );
    const runway = /\.titleRunway\s*\{[^}]*height:\s*(\d+)vh/.exec(css)?.[1];
    expect(Number(runway)).toBe(RUNWAY_VH);
  });

  it('ends the cycle on the title actually being claimed', () => {
    expect(OPERATOR_ROLES[OPERATOR_ROLES.length - 1]).toBe('FULL-STACK');
    expect(OPERATOR_ROLES.length).toBeGreaterThan(1);
  });
});
