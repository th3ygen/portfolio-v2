import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('useReducedMotion', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false when the user has no preference', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('queries prefers-reduced-motion: reduce', () => {
    const spy = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', spy);
    renderHook(() => useReducedMotion());
    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('subscribes to changes and unsubscribes on unmount', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener, removeEventListener }));

    const { unmount } = renderHook(() => useReducedMotion());
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
