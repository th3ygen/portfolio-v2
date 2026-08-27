import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { BootOverlay } from '../BootOverlay';
import { SESSION_KEY } from '../bootProgress';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  sessionStorage.clear();
  document.body.style.overflow = '';
  vi.unstubAllGlobals();
  mockMatchMedia(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('BootOverlay', () => {
  it('ships in the server HTML, so it covers the page from the first paint', () => {
    // Emitting nothing until an effect ran let the page paint first and dropped
    // the overlay in a frame later, which was visible. The server renders it
    // unconditionally instead.
    expect(renderToString(<BootOverlay onComplete={vi.fn()} />)).toContain('data-boot');
  });

  it('renders the same thing on the first client pass, so hydration cannot mismatch', () => {
    // Whether to skip depends on sessionStorage and a media query, neither of
    // which exists on the server — so the decision cannot happen during render.
    // Both passes emit the overlay; the effect decides afterwards.
    sessionStorage.setItem(SESSION_KEY, '1');
    vi.stubEnv('NODE_ENV', 'production');
    expect(renderToString(<BootOverlay onComplete={vi.fn()} />)).toContain('data-boot');
  });

  it('renders on a fresh session', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(screen.getByText('COLD BOOT')).toBeInTheDocument();
  });

  it('renders all seven log lines', () => {
    const { container } = render(<BootOverlay onComplete={vi.fn()} />);
    expect(container.querySelectorAll('[data-boot-log]')).toHaveLength(7);
  });

  it('starts the counter at 000', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(screen.getByText('000')).toBeInTheDocument();
  });

  it('locks body scroll while it holds the viewport', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('skips entirely if it already played this session', () => {
    vi.stubEnv('NODE_ENV', 'production');
    sessionStorage.setItem(SESSION_KEY, '1');
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });

  it('leaves scroll unlocked when it skips', () => {
    vi.stubEnv('NODE_ENV', 'production');
    sessionStorage.setItem(SESSION_KEY, '1');
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('replays despite the session flag outside production, for debugging', () => {
    // The gate is a visitor courtesy, not correctness. In dev it only hides
    // the thing you are trying to look at.
    sessionStorage.setItem(SESSION_KEY, '1');
    const { container } = render(<BootOverlay onComplete={vi.fn()} />);
    expect(container.querySelector('[data-boot]')).toBeInTheDocument();
  });

  it('skips under reduced motion', () => {
    mockMatchMedia(true);
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });

  it('marks the session played only once it has finished, not on mount', () => {
    vi.useFakeTimers();
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { unmount } = render(<BootOverlay onComplete={vi.fn()} />);
    // Marking on mount breaks development StrictMode: the second effect
    // invocation would see the flag and skip the boot entirely.
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(4500 + 300 + 680 + 50);
    });
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('1');

    unmount();
    raf.mockRestore();
    caf.mockRestore();
  });

  it('still plays when an effect is invoked twice, as StrictMode does', () => {
    // Simulates the double-invoke by mounting, unmounting, and mounting again
    // within one session — the boot must still appear the second time.
    const first = render(<BootOverlay onComplete={vi.fn()} />);
    first.unmount();
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(screen.getByText('COLD BOOT')).toBeInTheDocument();
  });

  it('completes and restores scroll even if the frame loop never runs', () => {
    vi.useFakeTimers();
    // No rAF ticks at all — the safety timeout is the only thing that can
    // finish the boot. spyOn patches window itself, so the stub is still in
    // place when React unmounts during cleanup; vi.stubGlobal is not.
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const onComplete = vi.fn();
    const { unmount } = render(<BootOverlay onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(4500 + 300 + 680 + 50);
    });

    expect(onComplete).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).not.toBe('hidden');

    unmount();
    raf.mockRestore();
    caf.mockRestore();
  });

  it('leaves the DOM entirely once it has handed off', () => {
    vi.useFakeTimers();
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { container, unmount } = render(<BootOverlay onComplete={vi.fn()} />);
    expect(container).not.toBeEmptyDOMElement();

    act(() => {
      vi.advanceTimersByTime(4500 + 300 + 680 + 50);
    });

    // A clipped-away overlay is still a fixed, full-viewport live region.
    expect(container).toBeEmptyDOMElement();

    unmount();
    raf.mockRestore();
    caf.mockRestore();
  });

  it('hides its decorative chrome from assistive tech', () => {
    const { container } = render(<BootOverlay onComplete={vi.fn()} />);
    for (const bracket of container.querySelectorAll('[data-boot-bracket]')) {
      expect(bracket).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('announces itself as a busy status region', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });
});
