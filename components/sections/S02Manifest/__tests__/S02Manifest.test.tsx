import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { S02Manifest } from '../index';
import { MANIFEST, MANIFEST_LABEL } from '@/content/manifest';

const TOTAL_ITEMS = MANIFEST.reduce((sum, c) => sum + c.items.length, 0);

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('S02Manifest', () => {
  it('renders the whole manifest expanded by default', () => {
    render(<S02Manifest />);
    expect(screen.getAllByRole('listitem')).toHaveLength(TOTAL_ITEMS);
  });

  it('renders one subheading per lettered category', () => {
    render(<S02Manifest />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(MANIFEST.map((c) => c.category));
  });

  it('collapses the grid on toggle', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    await user.click(screen.getByRole('button'));
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('reflects expanded state to assistive tech', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('swaps the toggle label with the state', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveTextContent(MANIFEST_LABEL.open);
    await user.click(toggle);
    expect(toggle).toHaveTextContent(MANIFEST_LABEL.closed);
  });

  it('reopens after collapsing', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    const toggle = screen.getByRole('button');
    await user.click(toggle);
    await user.click(toggle);
    expect(screen.getAllByRole('listitem')).toHaveLength(TOTAL_ITEMS);
  });

  it('points the toggle at the region it controls', () => {
    render(<S02Manifest />);
    const controls = screen.getByRole('button').getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls ?? '')).toBeInTheDocument();
  });
});
