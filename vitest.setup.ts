import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * jsdom does not implement matchMedia. ScrollTrigger calls it during
 * `gsap.registerPlugin`, which runs at module scope in components/motion/gsap.ts
 * — before any test's beforeEach can stub it. So the default has to exist here.
 *
 * Tests that care about the preference override this with vi.stubGlobal.
 */
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

/**
 * jsdom does not implement scrollTo. The boot overlay resets scroll position
 * while it holds the viewport, which is correct behaviour, not a test concern.
 */
// jsdom defines scrollTo but throws "Not implemented" when called, so this is
// assigned unconditionally rather than guarded on existence.
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

/**
 * jsdom cannot provide a rendering context without the native `canvas`
 * package. Returning null is the real "no WebGL available" path, which the
 * datamosh canvas is built to handle silently — so this exercises the fallback
 * rather than papering over anything.
 */
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as
  HTMLCanvasElement['getContext'];
