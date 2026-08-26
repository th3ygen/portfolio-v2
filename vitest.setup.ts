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
