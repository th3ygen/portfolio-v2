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
    const lead = container.querySelector('[data-op-line]');
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

  it('shows an explicit pending frame while no portrait file exists', () => {
    const { container } = render(<S01Operator />);
    // Guards against quietly shipping a stand-in: when src is null the gap is
    // stated, not disguised, and no <img> is emitted at all.
    expect(PORTRAIT.src).toBeNull();
    expect(container.querySelector('[data-portrait-pending]')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
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
