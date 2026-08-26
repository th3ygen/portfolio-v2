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
});

describe('BootOverlay', () => {
  it('emits nothing on the first render pass, so hydration cannot mismatch', () => {
    // Visibility depends on sessionStorage and a media query, neither of which
    // exists on the server. If the component decided during render, the client's
    // first pass would disagree with the server's HTML. Both must emit nothing
    // and let the effect take over.
    expect(renderToString(<BootOverlay onComplete={vi.fn()} />)).toBe('');
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
    sessionStorage.setItem(SESSION_KEY, '1');
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });

  it('leaves scroll unlocked when it skips', () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('skips under reduced motion', () => {
    mockMatchMedia(true);
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });

  it('marks the session as played so a reload does not replay it', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('1');
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
