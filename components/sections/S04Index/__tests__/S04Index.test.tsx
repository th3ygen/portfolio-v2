import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { S04Index } from '../index';
import { INDEX_COLUMNS, INDEX_ROWS } from '@/content/index-rows';
import { SPOTLIGHTS } from '@/content/spotlights';

describe('S04Index', () => {
  it('renders a real table with a header row and 16 body rows', () => {
    render(<S04Index />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(INDEX_ROWS.length + 1);
    expect(INDEX_ROWS).toHaveLength(16);
  });

  it('labels every column', () => {
    render(<S04Index />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([...INDEX_COLUMNS]);
  });

  it('makes each system name the row header, so a screen reader announces it', () => {
    render(<S04Index />);
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders.map((h) => h.textContent)).toEqual(INDEX_ROWS.map((r) => r.name));
  });

  it('renders every cell value', () => {
    render(<S04Index />);
    for (const row of INDEX_ROWS) {
      expect(screen.getByRole('rowheader', { name: row.name })).toBeInTheDocument();
    }
  });

  it('accents exactly the four rows that also appear in s03', () => {
    const { container } = render(<S04Index />);
    const accented = Array.from(container.querySelectorAll('[data-spotlit="true"]')).map(
      (el) => el.textContent,
    );
    expect(accented).toEqual(SPOTLIGHTS.map((p) => p.name));
    expect(accented).toHaveLength(4);
  });

  it('gives the table a caption for assistive tech', () => {
    render(<S04Index />);
    expect(screen.getByRole('table').querySelector('caption')).toBeInTheDocument();
  });

  it('renders the section heading and the access note', () => {
    render(<S04Index />);
    expect(screen.getByRole('heading', { level: 2, name: 'FULL INDEX' })).toBeInTheDocument();
  });
});
