import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs TypeScript with strict settings', () => {
    const values: readonly number[] = [1, 2, 3];
    const first: number | undefined = values[0];
    expect(first).toBe(1);
  });
});
