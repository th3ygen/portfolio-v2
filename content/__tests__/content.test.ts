import { describe, it, expect } from 'vitest';
import { CORE_LOADOUT, SOCIALS } from '@/content/operator';
import { MANIFEST } from '@/content/manifest';
import { SPOTLIGHTS } from '@/content/spotlights';
import { INDEX_ROWS } from '@/content/index-rows';
import { TRAJECTORY } from '@/content/trajectory';

describe('content counts', () => {
  it('has exactly 8 core loadout items', () => {
    expect(CORE_LOADOUT).toHaveLength(8);
  });

  it('has exactly 4 spotlights', () => {
    expect(SPOTLIGHTS).toHaveLength(4);
  });

  it('has exactly 16 index rows', () => {
    expect(INDEX_ROWS).toHaveLength(16);
  });

  it('has exactly 5 trajectory posts', () => {
    expect(TRAJECTORY).toHaveLength(5);
  });

  it('has 9 lettered manifest categories', () => {
    expect(MANIFEST).toHaveLength(9);
    expect(MANIFEST.map((c) => c.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
  });
});

describe('manifest', () => {
  it('lists no skill twice within a category', () => {
    for (const category of MANIFEST) {
      expect(new Set(category.items).size).toBe(category.items.length);
    }
  });

  it('is substantially larger than the core loadout — that contrast is the point', () => {
    const total = MANIFEST.reduce((sum, c) => sum + c.items.length, 0);
    expect(total).toBeGreaterThan(CORE_LOADOUT.length * 4);
  });
});

describe('trajectory', () => {
  it('is ordered oldest to newest — POST.01 is 2020, POST.05 is 2025', () => {
    const years = TRAJECTORY.map((p) => Number(p.year));
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(years).toEqual([2020, 2020, 2022, 2023, 2025]);
  });

  it('numbers posts sequentially', () => {
    expect(TRAJECTORY.map((p) => p.post)).toEqual([
      'POST.01', 'POST.02', 'POST.03', 'POST.04', 'POST.05',
    ]);
  });

  it('matches the organisations in the design handoff', () => {
    expect(TRAJECTORY[4]?.org).toContain('ARKI FINANCE');
    expect(TRAJECTORY[0]?.org).toBe('DITEC');
  });

  it('marks the two current roles ACTIVE and the rest ARCHIVED', () => {
    expect(TRAJECTORY.filter((p) => p.status === 'ACTIVE').map((p) => p.post)).toEqual([
      'POST.03', 'POST.05',
    ]);
  });

  it('rewinds to 2020, the year the zoom counter lands on', () => {
    expect(Math.min(...TRAJECTORY.map((p) => Number(p.year)))).toBe(2020);
  });
});

describe('spotlights', () => {
  it('covers the four named projects in order', () => {
    expect(SPOTLIGHTS.map((s) => s.name)).toEqual([
      'CAM Kenderaan', 'CAM Muka', 'Piping Calc. Tools', 'GajahSafe',
    ]);
  });

  it('numbers them S/01 through S/04', () => {
    expect(SPOTLIGHTS.map((s) => s.code)).toEqual(['S/01', 'S/02', 'S/03', 'S/04']);
  });

  it('gives every spotlight an image path and a stack', () => {
    for (const project of SPOTLIGHTS) {
      expect(project.image).toMatch(/^\/img\/.+\.(jpg|png|webp)$/);
      expect(project.stack.length).toBeGreaterThan(0);
    }
  });

  it('every spotlight appears in the full index', () => {
    const indexNames = INDEX_ROWS.map((r) => r.name);
    for (const project of SPOTLIGHTS) {
      expect(indexNames).toContain(project.name);
    }
  });
});

describe('index rows', () => {
  it('numbers rows 01 through 16 with no gaps', () => {
    expect(INDEX_ROWS.map((r) => r.n)).toEqual(
      Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it('names each system exactly once', () => {
    const names = INDEX_ROWS.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('socials', () => {
  it('gives every social label a real absolute URL', () => {
    for (const social of SOCIALS) {
      expect(social.href).toMatch(/^https:\/\//);
    }
  });

  it('covers the six labels the hero renders', () => {
    expect(SOCIALS.map((s) => s.label)).toEqual([
      'GITHUB', 'LINKEDIN', 'X', 'STACKOVERFLOW', 'DEV.TO', 'INSTAGRAM',
    ]);
  });
});
