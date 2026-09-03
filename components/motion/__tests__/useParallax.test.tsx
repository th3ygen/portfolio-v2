import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { useParallax } from '../useParallax';

/**
 * The pointer half of useParallax used to take a document-wide snapshot of
 * `[data-px]` on mount. Both tests here fail against that: one because the
 * snapshot cannot contain a layer that did not exist yet, the other because a
 * document-wide query does not respect the scope the hook is handed.
 */

function Harness() {
  const scope = useRef<HTMLDivElement>(null);
  useParallax(scope);
  return (
    <div ref={scope} data-scope>
      <div data-px="20" data-layer="inside" />
    </div>
  );
}

/** Matches a fine pointer and no motion preference — the case the hook runs in. */
function stubPointerFine() {
  vi.stubGlobal(
    'matchMedia',
    (query: string) => ({
      matches: query.includes('pointer: fine'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
}

/** Drive the hook's rAF chase far enough that the eased value is measurable. */
function settle(frames = 60) {
  act(() => {
    for (let i = 0; i < frames; i += 1) {
      vi.advanceTimersByTime(16);
    }
  });
}

describe('useParallax pointer layers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no rAF loop of its own worth relying on; run it off the timers
    // the test controls so the chase advances deterministically.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 16) as unknown as number,
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) =>
      clearTimeout(id as unknown as NodeJS.Timeout),
    );
    stubPointerFine();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function movePointer() {
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 0, clientY: 0, bubbles: true }),
      );
    });
    settle();
  }

  it('drives a layer that was added after the hook mounted', () => {
    const { container } = render(<Harness />);
    const scope = container.querySelector<HTMLElement>('[data-scope]')!;

    const late = document.createElement('div');
    late.dataset.px = '20';
    late.dataset.layer = 'late';
    scope.appendChild(late);

    movePointer();

    expect(late.style.transform).toContain('translate3d');
    expect(late.style.transform).not.toBe('');
  });

  it('leaves layers outside its scope alone', () => {
    const outside = document.createElement('div');
    outside.dataset.px = '20';
    document.body.appendChild(outside);

    try {
      render(<Harness />);
      movePointer();
      expect(outside.style.transform).toBe('');
    } finally {
      outside.remove();
    }
  });
});
