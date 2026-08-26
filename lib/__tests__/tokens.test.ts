import { describe, it, expect } from 'vitest';
import { COLORS } from '@/lib/tokens';

describe('COLORS', () => {
  it('exposes the single accent', () => {
    expect(COLORS.accent).toBe('#c6f21a');
  });

  it('exposes the page background', () => {
    expect(COLORS.bg).toBe('#070809');
  });

  it('uses no colour twice under different names', () => {
    const values = Object.values(COLORS);
    expect(new Set(values).size).toBe(values.length);
  });
});
