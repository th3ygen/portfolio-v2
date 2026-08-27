import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  bootDebugReplay,
  bootTarget,
  logIndexFor,
  stateLabelFor,
  lerp,
  LOG_THRESHOLDS,
  BOOT_LINES,
  BOOT_TASKS,
  BOOT_DURATION_MS,
} from '../bootProgress';

describe('bootTarget', () => {
  it('starts at zero', () => {
    expect(bootTarget(0)).toBe(0);
  });

  it('reaches 100 at the end of the boot duration', () => {
    expect(bootTarget(BOOT_DURATION_MS)).toBeCloseTo(100, 5);
  });

  it('clamps at 100 past the boot duration', () => {
    expect(bootTarget(9999)).toBe(100);
  });

  it('clamps at 0 for negative elapsed time', () => {
    expect(bootTarget(-500)).toBe(0);
  });

  it('is eased, not linear — halfway in time is past halfway in progress', () => {
    expect(bootTarget(BOOT_DURATION_MS / 2)).toBeGreaterThan(50);
  });

  it('never decreases', () => {
    let previous = -1;
    for (let t = 0; t <= 2400; t += 25) {
      const value = bootTarget(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('lerp', () => {
  it('moves a fraction of the distance toward the target', () => {
    expect(lerp(0, 100, 0.14)).toBeCloseTo(14, 10);
  });

  it('converges on the target rather than overshooting', () => {
    let value = 0;
    for (let i = 0; i < 200; i += 1) value = lerp(value, 100, 0.14);
    expect(value).toBeCloseTo(100, 6);
    expect(value).toBeLessThanOrEqual(100);
  });

  it('returns the target directly when the current value is not finite', () => {
    expect(lerp(Number.NaN, 42, 0.14)).toBe(42);
    expect(lerp(Number.POSITIVE_INFINITY, 42, 0.14)).toBe(42);
  });
});

describe('logIndexFor', () => {
  it('shows nothing before the first threshold', () => {
    expect(logIndexFor(0)).toBe(0);
    expect(logIndexFor(17)).toBe(0);
  });

  it('reveals lines one threshold at a time', () => {
    expect(logIndexFor(18)).toBe(1);
    expect(logIndexFor(47)).toBe(3);
    expect(logIndexFor(88)).toBe(6);
  });

  it('shows all seven at completion', () => {
    expect(logIndexFor(100)).toBe(7);
  });

  it('has one threshold, one line, and one task label each', () => {
    expect(LOG_THRESHOLDS).toHaveLength(7);
    expect(BOOT_LINES).toHaveLength(7);
    expect(BOOT_TASKS).toHaveLength(7);
  });

  it('never reveals more lines than exist', () => {
    for (let v = 0; v <= 120; v += 1) {
      expect(logIndexFor(v)).toBeLessThanOrEqual(BOOT_LINES.length);
    }
  });
});

describe('stateLabelFor', () => {
  it('steps POST to LOAD to HANDOFF', () => {
    expect(stateLabelFor(0)).toBe('POST');
    expect(stateLabelFor(39)).toBe('POST');
    expect(stateLabelFor(40)).toBe('LOAD');
    expect(stateLabelFor(84)).toBe('LOAD');
    expect(stateLabelFor(85)).toBe('HANDOFF');
    expect(stateLabelFor(100)).toBe('HANDOFF');
  });

  it('only ever moves forward as progress rises', () => {
    const order = ['POST', 'LOAD', 'HANDOFF'];
    let seen = 0;
    for (let v = 0; v <= 100; v += 1) {
      const index = order.indexOf(stateLabelFor(v));
      expect(index).toBeGreaterThanOrEqual(seen);
      seen = index;
    }
  });
});

describe('boot log content', () => {
  it('ends on the session-open line', () => {
    expect(BOOT_LINES[6]?.label).toContain('SESSION OPEN');
  });

  it('reports the counts the rest of the page renders', () => {
    expect(BOOT_LINES[2]?.value).toBe('8 MODULES');
    expect(BOOT_LINES[3]?.value).toBe('16 RECORDS');
  });
});

describe('bootDebugReplay', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps the once-per-session gate in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(bootDebugReplay()).toBe(false);
  });

  it('replays every load everywhere else', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(bootDebugReplay()).toBe(true);
  });
});
