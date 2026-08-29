import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TitleStage } from '../TitleStage';
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

  it('ends the cycle on the title actually being claimed', () => {
    expect(OPERATOR_ROLES[OPERATOR_ROLES.length - 1]).toBe('FULL-STACK');
    expect(OPERATOR_ROLES.length).toBeGreaterThan(1);
  });
});
