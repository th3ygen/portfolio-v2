import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const construct = vi.fn();
const destroy = vi.fn();

vi.mock('lenis', () => ({
  default: class {
    constructor(opts: unknown) {
      construct(opts);
    }
    on = vi.fn();
    raf = vi.fn();
    stop = vi.fn();
    start = vi.fn();
    scrollTo = vi.fn();
    destroy = destroy;
  },
}));
vi.mock('lenis/dist/lenis.css', () => ({}));

import { SmoothScrollProvider } from '../SmoothScrollProvider';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  construct.mockReset();
  destroy.mockReset();
  vi.unstubAllGlobals();
});

describe('SmoothScrollProvider', () => {
  it('creates a Lenis instance when motion is allowed', () => {
    mockMatchMedia(false);
    render(<SmoothScrollProvider>
      <p>content</p>
    </SmoothScrollProvider>);
    expect(construct).toHaveBeenCalledOnce();
  });

  it('creates no Lenis instance under reduced motion', () => {
    mockMatchMedia(true);
    render(<SmoothScrollProvider>
      <p>content</p>
    </SmoothScrollProvider>);
    expect(construct).not.toHaveBeenCalled();
  });

  it('destroys the instance on unmount', () => {
    mockMatchMedia(false);
    const { unmount } = render(<SmoothScrollProvider>
      <p>content</p>
    </SmoothScrollProvider>);
    unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('always renders its children', () => {
    mockMatchMedia(true);
    const { getByText } = render(<SmoothScrollProvider>
      <p>content</p>
    </SmoothScrollProvider>);
    expect(getByText('content')).toBeInTheDocument();
  });
});
