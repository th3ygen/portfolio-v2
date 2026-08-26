# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `Portfolio Redesign.dc.html` prototype as a production Next.js site — seven full-height scroll-driven sections, a boot overlay, a pinned zoom transition, and a working contact form.

**Architecture:** Next.js 16 App Router, statically generated except one route handler for the contact form. One component per section under `components/sections/`, each with a colocated CSS Module consuming custom-property design tokens declared once in `app/globals.css`. All motion is GSAP driven through `@gsap/react`'s `useGSAP`, with Lenis smooth scroll owned by a single provider in the root layout. Content is typed TypeScript modules, so the types are the content schema.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, CSS Modules, GSAP 3.12+ with ScrollTrigger, `@gsap/react`, Lenis, Zod, Resend, `@vercel/analytics`, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-26-portfolio-stack-design.md`

**Design reference:** `README.md` in the repo root is the design handoff. It holds every exact value — colours, type ramps, easing curves, timing thresholds, keyframes. When a task says "values per README", open it and copy them precisely. `Portfolio Redesign.dc.html` is the visual prototype; reference it for look and motion timing, never for file structure, styling method, or DOM structure.

## Global Constraints

- Node 24.x, npm 11.x. React 19, Next.js 16, App Router only — no `pages/`.
  (Resolved 16.3.3 / React 19.2.8 at scaffold time. The plan was drafted against 15; nothing here depends on the difference.)
- TypeScript `strict: true` and `noUncheckedIndexedAccess: true`. No `any`. No non-null assertions (`!`) in application code.
- `border-radius: 0` everywhere. The only exception is the 6px pulsing status dot, which is `border-radius: 50%`. This is load-bearing to the brutalist direction.
- One accent colour only: `#c6f21a`. The warm secondary `#ff8a3d` appears in exactly three
  places — the hero name's chromatic aberration, the masthead `COFFEE: CRITICAL` readout, and the
  tail of the rail progress gradient (`linear-gradient(180deg, #c6f21a, #ff8a3d)`). The cool
  aberration `rgba(26,120,242,.35)` appears only in the hero `text-shadow`.
- No box shadows for elevation. Glows only, at the exact values in README's "Other values" section.
- Minimum font size is 9px, used only for chrome micro-labels.
- Every colour, size, and spacing value in a CSS Module must reference a custom property from `app/globals.css`. No raw hex in a module file.
- Do not port the prototype's re-init guards: `_afterBoot`, `data-revealed`, `_introPlayed`, and the watchdog timers. `useGSAP` cleanup replaces them.
- Do not port `image-slot.js` or `support.js`. They are prototype tooling.
- Do not reintroduce two rejected treatments: the green strobe flash at boot handoff (the clip-path wipe is the intended treatment), and the 6-cycle yoyo opacity flicker on section reveal.
- Every animated component must consult `useReducedMotion()` and render its final state without animation when reduced motion is set.
- Commit after every task. Conventional commit prefixes (`feat:`, `test:`, `chore:`, `fix:`).

---

## File Structure

**Created by this plan:**

| Path | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout: font variables, `SmoothScrollProvider`, analytics |
| `app/page.tsx` | Composes `BootOverlay` + `s00`–`s06` in order |
| `app/globals.css` | Reset, design tokens, base type, all `@keyframes` |
| `app/api/contact/route.ts` | Contact form POST handler |
| `lib/types.ts` | Content type definitions — the content schema |
| `lib/zoom/camera.ts` | Log-space scale function for the s04→s05 zoom |
| `lib/zoom/odometer.ts` | Digit-roll state machine for the year counter |
| `lib/zoom/clock.ts` | Counter-clockwise hand rotation + rewind label |
| `lib/contact/schema.ts` | Zod schema shared by client and route handler |
| `content/*.ts` | Copy, manifest, spotlights, index rows, trajectory posts |
| `components/motion/useReducedMotion.ts` | Single source of truth for the reduced-motion flag |
| `components/motion/SmoothScrollProvider.tsx` | Owns the Lenis instance and ScrollTrigger wiring |
| `components/boot/BootOverlay.tsx` | Pre-`s00` overlay, once per session |
| `components/chrome/*` | Rail nav, progress track, ticker, grain, scanlines |
| `components/sections/S00Hero` … `S06Uplink` | One directory per section, `.tsx` + `.module.css` |
| `components/sections/S04ToS05Zoom/` | The pinned zoom stage — split into stage, words, odometer, clock |

The zoom is the deliberate exception to one-file-per-section. It is the largest single piece of work in the build and its maths are pure functions extracted specifically so they can be unit tested without a browser.

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a running Next.js dev server and a working `npm test` command. Every later task depends on both.

- [ ] **Step 1: Create the Next.js app**

Run in the repo root. The prototype files already present must survive, so scaffold in place rather than into a subdirectory:

```bash
npx create-next-app@latest . \
  --typescript --app --eslint --no-tailwind --no-src-dir \
  --import-alias "@/*" --use-npm --yes
```

If it refuses because the directory is non-empty, scaffold into `.next-scaffold/` and move the generated files up, then delete the scaffold directory.

- [ ] **Step 2: Tighten TypeScript**

Edit `tsconfig.json` — add to `compilerOptions`:

```json
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true
```

- [ ] **Step 3: Install test tooling**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a failing smoke test**

Create `lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs TypeScript with strict settings', () => {
    const values: readonly number[] = [1, 2, 3];
    const first: number | undefined = values[0];
    expect(first).toBe(1);
  });
});
```

- [ ] **Step 6: Run the suite**

Run: `npm test`
Expected: PASS, 1 test. If it fails to resolve the environment, the jsdom install did not complete — rerun Step 3.

- [ ] **Step 7: Verify the dev server boots**

Run: `npm run dev`
Expected: server on `http://localhost:3000` with no console errors. Stop it.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with strict TypeScript and Vitest"
```

---

### Task 2: Design tokens and base styles

**Files:**
- Modify: `app/globals.css` (replace entirely)
- Create: `lib/tokens.ts`
- Test: `lib/__tests__/tokens.test.ts`

**Interfaces:**
- Consumes: Task 1's `app/globals.css`.
- Produces: CSS custom properties consumed by every `.module.css` in the build, and `lib/tokens.ts` exporting `COLORS` (a `Record<string, string>` of the same values) for the few places JS needs a colour — the boot canvas and the SVG zoom stage.

**Source of truth:** README sections "Design Tokens → Colours", "Typography", "Other values", and "Keyframes". Copy every value exactly.

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { COLORS } from '@/lib/tokens';

describe('COLORS', () => {
  it('exposes the single accent', () => {
    expect(COLORS.accent).toBe('#c6f21a');
  });

  it('exposes the page background', () => {
    expect(COLORS.bg).toBe('#070809');
  });

  it('uses no colour twice under different names', () => {
    const values = Object.values(COLORS);
    expect(new Set(values).size).toBe(values.length);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — cannot resolve `@/lib/tokens`.

- [ ] **Step 3: Write `lib/tokens.ts`**

```ts
export const COLORS = {
  bg: '#070809',
  bgAlt1: '#0a0c0d',
  bgAlt2: '#0b0d0e',
  bgAlt3: '#08090a',
  surface1: '#0e1112',
  surface2: '#111516',
  surface3: '#121617',
  border: '#1b2022',
  borderDim1: '#14181a',
  borderDim2: '#101314',
  borderDim3: '#151a1b',
  borderMid1: '#1f2426',
  borderMid2: '#1f2527',
  borderMid3: '#242a2c',
  textPrimary: '#e8ecea',
  textSecondary: '#a8b0ae',
  textMuted: '#7c8583',
  textDim: '#4a5250',
  textFaint: '#38403f',
  textGhost: '#23292b',
  accent: '#c6f21a',
} as const;

export type ColorToken = keyof typeof COLORS;
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- tokens`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write `app/globals.css`**

Replace the file entirely. Structure it in four blocks, in this order:

1. **Reset** — `box-sizing: border-box`, zero margin/padding, `border-radius: 0` on everything, `-webkit-font-smoothing: antialiased`.
2. **Tokens** — every value from `COLORS` as `--color-*`; the spacing rhythm from README ("Rhythm gaps") as `--gap-64` through `--gap-6`; the glow values as `--glow-scan`, `--glow-wipe`, `--glow-soft`.
3. **Base type** — `body` defaults to `var(--font-mono), ui-monospace, monospace`; `::selection` is `#c6f21a` on `#070809`.
4. **Keyframes** — all seven from README: `om-blink`, `om-pulse`, `om-tick`, `om-flick`, `om-drift`, `om-sweep`, `om-glitch`. Copy the exact stops; `om-flick` in particular holds `.5` opacity, drops to `.15` at 94%, spikes `.6` at 96%.

Open the prototype's `<style>` block for the keyframe bodies rather than reconstructing them from the prose.

Start of the file:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0;
}

:root {
  --color-bg: #070809;
  --color-accent: #c6f21a;
  /* …every token from lib/tokens.ts, plus gaps and glows… */
  --glow-scan: 0 0 26px 4px rgba(198, 242, 26, 0.35);
  --glow-wipe: 0 0 30px 6px rgba(198, 242, 26, 0.45);
  --glow-soft: 0 0 24px 4px rgba(198, 242, 26, 0.4);
}

html, body {
  background: var(--color-bg);
  color: var(--color-textPrimary);
  -webkit-font-smoothing: antialiased;
}

::selection { background: #c6f21a; color: #070809; }
```

- [ ] **Step 6: Verify tokens render**

Run: `npm run dev`, open `http://localhost:3000`, and confirm in devtools that `getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()` is `#c6f21a` and the page background is `#070809`.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css lib/tokens.ts lib/__tests__/tokens.test.ts
git commit -m "feat: add design tokens, reset, and keyframes"
```

---

### Task 3: Self-hosted fonts

**Files:**
- Create: `public/fonts/ArchivoBlack-Regular.woff2`, `public/fonts/JetBrainsMono-Variable.woff2`
  (Google serves JetBrains Mono as a single variable file covering 300–800; requesting the five
  weights separately returns five byte-identical copies. One face declaration at `weight: '300 800'`
  covers the whole range.)
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (wire `--font-display` / `--font-mono`)

**Interfaces:**
- Consumes: Task 2's tokens.
- Produces: `--font-display` (Archivo Black) and `--font-mono` (JetBrains Mono) as CSS variables on `<html>`. Every section stylesheet uses these two and no others.

**Why self-hosted:** the boot overlay paints a counter at `clamp(72px, 15vw, 200px)` in Archivo Black within the first frames. A font swap there is highly visible.

- [ ] **Step 1: Download the font files**

Fetch Archivo Black 400 and JetBrains Mono 300/400/500/700/800 as `.woff2` (from `fonts.google.com` or `gwfh.mranftl.com`) into `public/fonts/`.

- [ ] **Step 2: Write `app/fonts.ts`**

```ts
import localFont from 'next/font/local';

export const archivoBlack = localFont({
  src: [{ path: '../public/fonts/ArchivoBlack-Regular.woff2', weight: '400', style: 'normal' }],
  variable: '--font-display',
  display: 'block',
  fallback: ['Impact', 'Haettenschweiler', 'sans-serif'],
});

export const jetbrainsMono = localFont({
  src: [{ path: '../public/fonts/JetBrainsMono-Variable.woff2', weight: '300 800', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});
```

`display: 'block'` on the display face, not `swap` — a brief invisible period is better than a visible reflow on the boot counter.

- [ ] **Step 3: Wire into the root layout**

In `app/layout.tsx`:

```tsx
import { archivoBlack, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata = {
  title: 'M. Aidil Syazwan Hamdan — Full-Stack Developer',
  description: 'Physical-systems and IoT engineering. Kuala Lumpur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify no swap flash**

Run `npm run dev`, add a temporary `<h1 style={{fontFamily:'var(--font-display)',fontSize:'200px'}}>000</h1>` to `app/page.tsx`, hard-reload with the network throttled to Slow 3G, and confirm the numerals never render in a fallback face. Remove the temporary markup.

- [ ] **Step 5: Commit**

```bash
git add public/fonts app/fonts.ts app/layout.tsx app/globals.css
git commit -m "feat: self-host Archivo Black and JetBrains Mono"
```

---

### Task 4: Content types and modules

**Files:**
- Create: `lib/types.ts`
- Create: `content/operator.ts`, `content/manifest.ts`, `content/spotlights.ts`, `content/index-rows.ts`, `content/trajectory.ts`
- Test: `content/__tests__/content.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the types and data every section component imports.

```ts
type LoadoutItem = { name: string; detail: string };
type ManifestCategory = { letter: string; category: string; items: readonly string[] };
type SpotlightMeta = { label: string; value: string };
type Spotlight = { id: string; code: string; name: string; tagline: string; years: string;
                   tags: readonly string[]; blurb: string; meta: readonly SpotlightMeta[];
                   stack: string; image: string };
type IndexRow = { n: string; name: string; sector: string; keyTech: string; access: 'PRIVATE' | 'PUBLIC' };
type TrajectoryPost = { post: string; year: string; tag: string; status: 'ACTIVE' | 'ARCHIVED';
                        role: string; org: string; body: string };
```

Exports: `OPERATOR`, `OPERATOR_CARD`, `HERO_STATS`, `CORE_LOADOUT`, `TICKER`, `MANIFEST`,
`MANIFEST_LABEL`, `SPOTLIGHTS`, `INDEX_ROWS`, `TRAJECTORY`, `UPLINK`, `CHANNELS`, `FOOTER`.

**Correction against the prototype.** The plan originally modelled one `MANIFEST` array with a
`core: boolean` flag. The prototype does something different, and the prototype is the approved
design:

- The **8-item core loadout lives in s01**, as `CORE_LOADOUT`, and each item carries a detail
  sub-label (`Next.js` / `APP ROUTER · SERVER ACTIONS`).
- **s02 holds the full manifest** — nine lettered categories A–I, 73 items — as `MANIFEST`. The
  toggle shows and hides the entire grid and **defaults to open**. Labels are
  `[ − ] COLLAPSE MANIFEST` and `[ + ] EXPAND FULL MANIFEST`.
- `TrajectoryPost` carries a `tag` (`INTERNSHIP` / `RESEARCH` / `→ PRESENT`) and a `status`
  (`ACTIVE` / `ARCHIVED`) that the original type omitted.
- `IndexRow` columns are ID / SYSTEM / SECTOR / KEY TECH / ACCESS, not year and role.

**Counts are load-bearing.** README calls out "keep the count discipline" — the redesign exists
partly to replace a 90-skill dump. Exactly 8 core loadout items, exactly 4 spotlights, exactly 16
index rows, exactly 5 trajectory posts, exactly 9 manifest categories. The tests enforce this.

**Copy comes from the prototype verbatim.** Every string in these modules is lifted from
`Portfolio Redesign.dc.html`, which holds the final approved copy. Do not rewrite it.

- [ ] **Step 1: Write the failing test**

Create `content/__tests__/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MANIFEST } from '@/content/manifest';
import { SPOTLIGHTS } from '@/content/spotlights';
import { INDEX_ROWS } from '@/content/index-rows';
import { TRAJECTORY } from '@/content/trajectory';

describe('content counts', () => {
  it('has exactly 8 core loadout items', () => {
    expect(MANIFEST.filter((m) => m.core)).toHaveLength(8);
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
});

describe('trajectory', () => {
  it('is reverse chronological — POST.01 is oldest, POST.05 newest', () => {
    const years = TRAJECTORY.map((p) => Number(p.year));
    const sorted = [...years].sort((a, b) => a - b);
    expect(years).toEqual(sorted);
  });

  it('matches the organisations in the design handoff', () => {
    expect(TRAJECTORY.map((p) => p.year)).toEqual(['2020', '2020', '2022', '2023', '2025']);
    expect(TRAJECTORY[4]?.org).toContain('ARKI FINANCE');
  });
});

describe('spotlights', () => {
  it('covers the four named projects', () => {
    const names = SPOTLIGHTS.map((s) => s.name);
    expect(names).toEqual(['CAM Kenderaan', 'CAM Muka', 'Piping Calc Tools', 'GajahSafe']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- content`
Expected: FAIL — cannot resolve `@/content/manifest`.

- [ ] **Step 3: Write `lib/types.ts`**

```ts
export type ManifestItem = {
  readonly label: string;
  readonly category: string;
  readonly core: boolean;
};

export type Spotlight = {
  readonly id: string;
  readonly name: string;
  readonly year: string;
  readonly blurb: string;
  readonly stack: readonly string[];
  readonly image: string;
};

export type IndexRow = {
  readonly n: string;
  readonly name: string;
  readonly year: string;
  readonly role: string;
  readonly stack: string;
};

export type TrajectoryPost = {
  readonly post: string;
  readonly year: string;
  readonly org: string;
  readonly role: string;
  readonly body: string;
};

export type Operator = {
  readonly name: readonly [string, string];
  readonly title: string;
  readonly location: string;
  readonly intro: string;
  readonly lead: string;
  readonly body: readonly string[];
  readonly chips: readonly string[];
  readonly stats: readonly { readonly label: string; readonly value: string }[];
};
```

- [ ] **Step 4: Write the content modules**

Pull every string from the prototype `Portfolio Redesign.dc.html` — it holds the final approved copy. Do not rewrite it.

`content/trajectory.ts`, exact rows per README's table:

```ts
import type { TrajectoryPost } from '@/lib/types';

export const TRAJECTORY: readonly TrajectoryPost[] = [
  { post: 'POST.01', year: '2020', org: 'DITEC', role: '…', body: '…' },
  { post: 'POST.02', year: '2020', org: 'UNIVERSITI MALAYSIA PAHANG AL-SULTAN ABDULLAH', role: '…', body: '…' },
  { post: 'POST.03', year: '2022', org: 'ASCENITY SOLUTIONS · MY OWN COMPANY', role: '…', body: '…' },
  { post: 'POST.04', year: '2023', org: 'SATOK BRIDGE DIGITAL', role: '…', body: '…' },
  { post: 'POST.05', year: '2025', org: 'ARKI FINANCE · SINGAPORE · FULL-TIME', role: '…', body: '…' },
] as const;
```

Replace each `'…'` with the real copy from the prototype before committing. `content/spotlights.ts` covers CAM Kenderaan, CAM Muka, Piping Calc Tools, and GajahSafe, with `image` pointing at `/img/<id>.jpg`. `content/index-rows.ts` holds the 16 rows. `content/manifest.ts` holds the full manifest with `core: true` on exactly 8. `content/operator.ts` holds the hero and s01 copy.

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- content`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts content
git commit -m "feat: add typed content modules for all sections"
```

---

### Task 5: Reduced-motion hook

**Files:**
- Create: `components/motion/useReducedMotion.ts`
- Test: `components/motion/__tests__/useReducedMotion.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `useReducedMotion(): boolean` — returns `true` when the user prefers reduced motion. Every animated component in Tasks 6–16 calls this. It returns `false` during SSR and on the first client render, then updates after mount, so server and client markup match.

- [ ] **Step 1: Write the failing test**

Create `components/motion/__tests__/useReducedMotion.test.tsx`:

```tsx
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
    const spy = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    vi.stubGlobal('matchMedia', spy);
    renderHook(() => useReducedMotion());
    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- useReducedMotion`
Expected: FAIL — cannot resolve `../useReducedMotion`.

- [ ] **Step 3: Write the hook**

```ts
'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- useReducedMotion`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add components/motion
git commit -m "feat: add useReducedMotion hook"
```

---

### Task 6: Smooth scroll provider

**Files:**
- Create: `components/motion/SmoothScrollProvider.tsx`
- Create: `components/motion/gsap.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `useReducedMotion` from Task 5.
- Produces: `<SmoothScrollProvider>` wrapping the app, and `components/motion/gsap.ts` exporting a pre-registered `gsap` and `ScrollTrigger`. Every section imports GSAP from that module, never from `gsap` directly — registration must happen exactly once.

**Confirm GSAP licensing at this step** and record the resolved version in the commit message. ScrollTrigger is free under the standard license as of 3.12; verify before shipping commercially.

- [ ] **Step 1: Install**

```bash
npm i gsap @gsap/react lenis
npm ls gsap
```

Note the resolved version for the commit message.

- [ ] **Step 2: Write the registration module**

Create `components/motion/gsap.ts`:

```ts
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 3: Write the provider**

Create `components/motion/SmoothScrollProvider.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { useReducedMotion } from './useReducedMotion';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
```

No `scrollerProxy`. The prototype needed one because its scroll container was not `window`; here it is.

- [ ] **Step 4: Mount it in the layout**

In `app/layout.tsx`, wrap `{children}` in `<SmoothScrollProvider>`.

- [ ] **Step 5: Verify**

Run `npm run dev`. Temporarily set `app/page.tsx` to render a `<div style={{height:'400vh'}} />`, scroll, and confirm the motion is eased rather than native-stepped. Then run with reduced motion forced (Chrome devtools → Rendering → Emulate `prefers-reduced-motion: reduce`) and confirm scrolling is native and no Lenis instance is created. Revert the temporary markup.

- [ ] **Step 6: Commit**

```bash
git add components/motion app/layout.tsx package.json package-lock.json
git commit -m "feat: add Lenis smooth scroll wired to ScrollTrigger"
```

---

### Task 7: Page chrome

**Files:**
- Create: `content/sections.ts` — the seven-section registry, shared with Task 8
- Create: `components/chrome/Masthead.tsx` + `.module.css`
- Create: `components/chrome/RailNav.tsx` + `.module.css`
- Create: `components/chrome/Ambient.tsx` + `.module.css`
- Create: `components/chrome/Reticle.tsx` + `.module.css`
- Test: `components/chrome/__tests__/chrome.test.tsx`

**Correction against the prototype.** The plan listed four components and got two of them
wrong:

- **`Masthead` was missing entirely.** The prototype has a fixed 38px top bar carrying
  `DIL.SYS` with a glowing dot, the operator name, `BUILD 2026.08`, a live MYT clock, KL
  coordinates, and `COFFEE: CRITICAL`. The clock must server-render a `--:--:-- MYT`
  placeholder — a real time in SSR output can never match what the client computes.
- **`Reticle` was missing entirely.** A pointer-tracking crosshair with a live coordinate
  readout, gated on `(pointer: fine)` and skipped under reduced motion. Positions are written
  straight to `style` inside a rAF; it fires on every mousemove and must not re-render React.
- **`ProgressTrack` is not a separate component.** The handoff's "right-side progress track"
  means the right edge *of the 52px rail*, not of the viewport. It lives inside `RailNav` as a
  2px track with a `#c6f21a → #ff8a3d` gradient.
- **`Ticker` does not belong here.** It sits inside s00 in the prototype, so it moves to
  Task 10.
- `Ambient` is two layers, not one: the scanline at `rgba(255,255,255,.022)` (the README says
  `.03`; the prototype wins) with `om-flick 7s infinite`, plus a vignette at
  `inset 0 0 220px 60px rgba(0,0,0,.9)`.
- `om-drift` is defined in the prototype but never used. It stays declared, unused.

**Interfaces:**
- Consumes: tokens (Task 2), `gsap` module (Task 6), `useReducedMotion` (Task 5).
- Produces: `<RailNav />`, `<ProgressTrack />`, `<Ticker />`, `<Ambient />`, all mounted by `app/page.tsx` in Task 8. `RailNav` takes `sections: readonly { id: string; label: string }[]`.

`Ambient` renders the grain and scanline overlay layers, with `om-flick` on the scanline layer. Parallax on `data-px` / `data-py` elements lives here too, gated on reduced motion.

The autonomous green sweep was built in the prototype and then removed. All motion is user-triggered. Do not add it back.

- [ ] **Step 1: Write the failing test**

Create `components/chrome/__tests__/RailNav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RailNav } from '../RailNav';

const SECTIONS = [
  { id: 's00', label: 'HERO' },
  { id: 's01', label: 'OPERATOR' },
] as const;

describe('RailNav', () => {
  it('renders one link per section, anchored by id', () => {
    render(<RailNav sections={SECTIONS} />);
    expect(screen.getByRole('link', { name: /HERO/ })).toHaveAttribute('href', '#s00');
    expect(screen.getByRole('link', { name: /OPERATOR/ })).toHaveAttribute('href', '#s01');
  });

  it('exposes itself as navigation', () => {
    render(<RailNav sections={SECTIONS} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- RailNav`
Expected: FAIL — cannot resolve `../RailNav`.

- [ ] **Step 3: Implement the chrome components**

`RailNav` is a fixed left rail of anchor links, one per section, in 9–10px mono at `.2em` tracking. The active section's label switches to `--color-accent`; track it with a `ScrollTrigger` per section rather than a scroll listener.

`ProgressTrack` is the right-side vertical progress indicator, driven by a single `ScrollTrigger` on `document.body` with `scrub: true`.

`Ticker` is the scrolling tech ticker using the `om-tick` keyframe (`translateX(0 → -50%)`), with its content duplicated so the loop is seamless. Give it `aria-hidden="true"` — it is decoration.

`Ambient` renders two fixed full-viewport layers: the grain layer using `om-drift` on `background-position`, and the scanline layer at `rgba(255,255,255,.03)` in a 1px/3px pattern with `om-flick`. Both `aria-hidden`, both `pointer-events: none`. When `useReducedMotion()` is true, render them static — no `animation`.

Exact values per README's "Ambient" and "Keyframes" sections.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- RailNav`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add components/chrome
git commit -m "feat: add rail nav, progress track, ticker, and ambient layers"
```

---

### Task 8: Page shell

**Files:**
- Modify: `app/page.tsx`
- Create: `components/sections/SectionShell.tsx` + `.module.css`
- Test: `app/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 4–7.
- Produces: `app/page.tsx` rendering all seven section anchors in order, and `<SectionShell id label number>` — the shared wrapper giving every section its `min-height: 100vh`, its `id`, its padding, and its section-number label. Tasks 9–16 fill each section's body; this task establishes that they all mount and scroll.

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Page from '@/app/page';

describe('page', () => {
  it('renders all seven section anchors in order', () => {
    const { container } = render(<Page />);
    const ids = Array.from(container.querySelectorAll('section[id]')).map((el) => el.id);
    expect(ids).toEqual(['s00', 's01', 's02', 's03', 's04', 's05', 's06']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- page`
Expected: FAIL — the page renders the scaffold's default content, so `ids` is empty.

- [ ] **Step 3: Write `SectionShell`**

```tsx
import styles from './SectionShell.module.css';

type Props = {
  id: string;
  number: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionShell({ id, number, label, children, className }: Props) {
  return (
    <section id={id} className={`${styles.section} ${className ?? ''}`}>
      <header className={styles.head} aria-hidden="true">
        <span className={styles.number}>{number}</span>
        <span className={styles.label}>{label}</span>
      </header>
      {children}
    </section>
  );
}
```

Section numbers fade in over `.45s power2.out` on reveal. Do not use the 6-cycle yoyo flicker — it was tried, read as a bug, and was rejected.

- [ ] **Step 4: Write `app/page.tsx`**

Render `<Ambient />`, `<RailNav />`, `<ProgressTrack />`, then the seven sections in order with placeholder bodies, then `<Ticker />`. Each section gets a `SectionShell` with its id, number, and label. Tasks 9–16 replace the placeholder bodies one at a time.

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- page`
Expected: PASS, 1 test.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/sections/SectionShell.tsx components/sections/SectionShell.module.css app/__tests__
git commit -m "feat: add page shell composing all seven sections"
```

---

### Task 9: Boot overlay

**Files:**
- Create: `components/boot/BootOverlay.tsx` + `.module.css`
- Create: `components/boot/bootProgress.ts`
- Test: `components/boot/__tests__/bootProgress.test.ts`
- Test: `components/boot/__tests__/BootOverlay.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: tokens, `useReducedMotion`.
- Produces: `<BootOverlay onComplete={() => void} />`, plus two pure functions:
  - `bootTarget(elapsedMs: number): number` — eased progress 0–100
  - `logIndexFor(percent: number): number` — how many of the seven log lines are visible

**The maths, from README:** `target = min(1, elapsed / 2300) ** 0.75 * 100`, then the displayed value lerps toward that target at `0.14` per frame. A 4.5s safety timeout force-completes.

**Thresholds** for the seven log lines: 18, 31, 47, 58, 72, 88, 99.

**Once per session:** gate on `sessionStorage`, not on every load.

- [ ] **Step 1: Write the failing test**

Create `components/boot/__tests__/bootProgress.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bootTarget, logIndexFor, LOG_THRESHOLDS } from '../bootProgress';

describe('bootTarget', () => {
  it('starts at zero', () => {
    expect(bootTarget(0)).toBe(0);
  });

  it('reaches 100 at 2300ms', () => {
    expect(bootTarget(2300)).toBeCloseTo(100, 5);
  });

  it('clamps at 100 past 2300ms', () => {
    expect(bootTarget(9999)).toBe(100);
  });

  it('is eased, not linear — halfway in time is past halfway in progress', () => {
    expect(bootTarget(1150)).toBeGreaterThan(50);
  });

  it('never decreases', () => {
    let previous = -1;
    for (let t = 0; t <= 2400; t += 50) {
      const value = bootTarget(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('logIndexFor', () => {
  it('shows nothing before the first threshold', () => {
    expect(logIndexFor(0)).toBe(0);
    expect(logIndexFor(17.9)).toBe(0);
  });

  it('reveals lines one threshold at a time', () => {
    expect(logIndexFor(18)).toBe(1);
    expect(logIndexFor(47)).toBe(3);
    expect(logIndexFor(88)).toBe(6);
  });

  it('shows all seven at completion', () => {
    expect(logIndexFor(100)).toBe(7);
  });

  it('has one threshold per log line', () => {
    expect(LOG_THRESHOLDS).toHaveLength(7);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- bootProgress`
Expected: FAIL — cannot resolve `../bootProgress`.

- [ ] **Step 3: Write `bootProgress.ts`**

```ts
export const BOOT_DURATION_MS = 2300;
export const BOOT_TIMEOUT_MS = 4500;
export const LERP_RATE = 0.14;

export const LOG_THRESHOLDS = [18, 31, 47, 58, 72, 88, 99] as const;

export function bootTarget(elapsedMs: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs) / BOOT_DURATION_MS);
  return t ** 0.75 * 100;
}

export function logIndexFor(percent: number): number {
  return LOG_THRESHOLDS.filter((threshold) => percent >= threshold).length;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- bootProgress`
Expected: PASS, 9 tests.

- [ ] **Step 5: Write the failing component test**

Create `components/boot/__tests__/BootOverlay.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BootOverlay } from '../BootOverlay';

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('BootOverlay', () => {
  it('renders on a fresh session', () => {
    render(<BootOverlay onComplete={vi.fn()} />);
    expect(screen.getByText('COLD BOOT')).toBeInTheDocument();
  });

  it('does not render if it already ran this session', () => {
    sessionStorage.setItem('boot-played', '1');
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });

  it('does not render under reduced motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: true, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
    const onComplete = vi.fn();
    const { container } = render(<BootOverlay onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- BootOverlay`
Expected: FAIL — cannot resolve `../BootOverlay`.

- [ ] **Step 7: Implement `BootOverlay`**

Structure per README's "Boot screen" section — a CSS grid of header / body / footer, four 26×26px L-shaped corner brackets in 2px `--color-accent` inset 18px, the seven-line boot log on the left, the `LOADING` label and three-digit zero-padded counter on the right, and the striped progress bar in the footer.

The stripe is `repeating-linear-gradient(90deg, #c6f21a 0 9px, transparent 9px 13px)` — hard-edged, not a solid fill.

Drive the counter from a `requestAnimationFrame` loop: compute `bootTarget(elapsed)`, lerp the displayed value toward it at `LERP_RATE`, and derive log lines from `logIndexFor`. Lock body scroll (`overflow: hidden`) and reset scroll to 0 while active. A `BOOT_TIMEOUT_MS` timer force-completes.

Exit is the three-stage sequence from README: panels translate `-14px` and fade over `.34s cubic-bezier(.4,0,.2,1)` staggered 40ms; after 300ms the overlay wipes upward via `clip-path: inset(0 0 0 0)` → `inset(0 0 100% 0)` over `.62s cubic-bezier(.76,0,.24,1)`; a 2px green bar with `var(--glow-wipe)` rides the wipe's bottom edge, translating `-100vh` on the same curve.

**Do not add the green strobe flash at handoff.** It was built and explicitly rejected. The wipe is the intended treatment.

On completion: unlock scroll, set `sessionStorage.setItem('boot-played', '1')`, remove the overlay, call `ScrollTrigger.refresh()`, then call `onComplete()`. Only then does the hero intro play.

Return `null` immediately — and call `onComplete()` in an effect — when `sessionStorage` says it already played or `useReducedMotion()` is true.

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- BootOverlay`
Expected: PASS, 3 tests.

- [ ] **Step 9: Verify by eye**

Run `npm run dev` and compare against the prototype: the counter easing, the log line timing, the wipe. Reload in a new tab to see it once, then reload again in the same tab to confirm it is skipped.

- [ ] **Step 10: Commit**

```bash
git add components/boot app/page.tsx
git commit -m "feat: add boot overlay with eased progress and clip-path wipe"
```

---

### Task 10: s00 Hero

**Files:**
- Create: `components/sections/S00Hero/index.tsx`, `S00Hero.module.css`, `DatamoshCanvas.tsx`
- Test: `components/sections/S00Hero/__tests__/S00Hero.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `OPERATOR` (Task 4), `SectionShell` (Task 8), `gsap`/`useGSAP` (Task 6), `useReducedMotion` (Task 5).
- Produces: `<S00Hero bootDone={boolean} />`. The `bootDone` prop gates the intro timeline — it must not play until the boot overlay has handed off.

**Wiring:** `app/page.tsx` holds `const [bootDone, setBootDone] = useState(false)`, passes `onComplete={() => setBootDone(true)}` to the `<BootOverlay />` from Task 9, and passes `bootDone` down to `<S00Hero />`. Because this makes the page stateful, `app/page.tsx` becomes a client component (`'use client'` at the top). That is acceptable here — the page is animated end to end and gains nothing from staying a server component.

**Layout per README:** `min-height: 100vh`, flex column, `padding: 38px 0 0 52px`, `overflow: hidden`. Content in order: status row (green outline pill + meta at 10px `.24em`), `$ whoami` prompt (11px `.2em` `--color-textDim`), the `h1` with two block lines, a `max-width: 44ch` intro paragraph, a wrapping chip row, and a bordered stat strip with `border-top: 1px solid var(--color-border)`.

**The name is the one place aberration appears:** `Muhd Aidil` in `--color-textPrimary`, `Syazwan` in `--color-accent` with `text-shadow: 3px 0 0 rgba(255,138,61,.5), -3px 0 0 rgba(26,120,242,.35)`.

- [ ] **Step 1: Write the failing test**

Create `components/sections/S00Hero/__tests__/S00Hero.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S00Hero } from '../index';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('S00Hero', () => {
  it('renders the name as a single accessible heading', () => {
    render(<S00Hero bootDone />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Muhd Aidil Syazwan');
  });

  it('renders the whoami prompt', () => {
    render(<S00Hero bootDone />);
    expect(screen.getByText('$ whoami')).toBeInTheDocument();
  });
});
```

The heading assertion matters: the name is split into two styled lines, but it must read as one heading to a screen reader.

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- S00Hero`
Expected: FAIL — cannot resolve `../index`.

- [ ] **Step 3: Implement the hero**

Build the markup and stylesheet to the layout above. The `h1` contains two `<span>` block lines; the accent line carries the aberration `text-shadow`.

`DatamoshCanvas` is the background `<canvas>` layer. Give it `aria-hidden="true"`, size it to its container with a `ResizeObserver`, and drive it from a single `requestAnimationFrame` loop cancelled on unmount. When reduced motion is set, paint one static frame and stop.

Parallax greeble blocks carry `data-px` / `data-py` and are moved by the `Ambient` parallax from Task 7.

Intro timeline, in a `useGSAP` with `{ dependencies: [bootDone, reduced], revertOnUpdate: true }`:

```tsx
useGSAP(() => {
  if (!bootDone) return;
  if (reduced) return;
  gsap.from(`.${styles.introItem}`, {
    opacity: 0, y: 26, duration: 0.8, ease: 'power3.out', stagger: 0.08,
  });
}, { dependencies: [bootDone, reduced], scope: rootRef, revertOnUpdate: true });
```

Scroll-out, scrubbed: the parallax layers drift `y: -70` and fade to `.12` opacity.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- S00Hero`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add components/sections/S00Hero app/page.tsx
git commit -m "feat: add s00 hero with datamosh canvas and intro timeline"
```

---

### Task 11: s01 Operator

**Files:**
- Create: `components/sections/S01Operator/index.tsx` + `.module.css`
- Test: `components/sections/S01Operator/__tests__/S01Operator.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `OPERATOR` (Task 4), `SectionShell`, `gsap`/`useGSAP`, `useReducedMotion`, `next/image`.
- Produces: `<S01Operator />`.

**Layout per README:** grid `340px minmax(0,1fr)`, `gap: 64px`, `align-items: start`. Left is the portrait card, with the `OPERATOR_CARD` identity facts beneath it; right is a lead statement in Archivo Black at `clamp(24px, 2.6vw, 38px)`, then the body copy blocks, then the 8-item `CORE_LOADOUT` grid under a `CORE LOADOUT / DAILY DRIVERS — FULL MANIFEST IN 02` header.

**The scan animation** is scrubbed at `scrub: .45`, from `top 78%` to `top -30%` — a deliberately long window so it completes on screen rather than below the fold.

- Scan line travels `top: 0` → `100%` over progress `0`–`.8`, then fades out. It is a 2px line inset 40px left and right, `linear-gradient(90deg, transparent, #c6f21a 12%, #c6f21a 88%, transparent)` with `var(--glow-scan)`.
- The `ACQUIRING OPERATOR` tag (9px, `.22em`, accent, `right: 40px; top: -22px`) fades in at `0` and out by `.55`.
- The portrait card wipes down via `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)` with **`ease: "steps(5)"`**. The hard stepping is intentional — do not smooth it.
- Copy lines animate `opacity 0→1`, `y 14→0`, and `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` over `.3s`, `power2.out`, `.07s` stagger.

- [ ] **Step 1: Write the failing test**

Create `components/sections/S01Operator/__tests__/S01Operator.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S01Operator } from '../index';
import { OPERATOR } from '@/content/operator';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('S01Operator', () => {
  it('renders the lead statement', () => {
    render(<S01Operator />);
    expect(screen.getByText(OPERATOR.lead)).toBeInTheDocument();
  });

  it('renders every body copy block', () => {
    render(<S01Operator />);
    for (const block of OPERATOR.body) {
      expect(screen.getByText(block)).toBeInTheDocument();
    }
  });

  it('gives the portrait a real alt text', () => {
    render(<S01Operator />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  it('marks the ACQUIRING OPERATOR tag as decorative', () => {
    const { container } = render(<S01Operator />);
    const tag = container.querySelector('[data-tag="acquiring"]');
    expect(tag).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- S01Operator`
Expected: FAIL — cannot resolve `../index`.

- [ ] **Step 3: Implement the section**

Use `next/image` for the portrait with a real `alt`. `image-slot.js` is prototype tooling and is not ported. Until a real portrait file exists, point at a placeholder in `public/img/` of the same aspect ratio — the layout must be correct without it.

Build the scan timeline in a `useGSAP` scoped to the section root, skipped entirely when `useReducedMotion()` is true (render the portrait unclipped and the copy at final state).

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- S01Operator`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/sections/S01Operator app/page.tsx public/img
git commit -m "feat: add s01 operator with scrubbed scan reveal"
```

---

### Task 12: s02 Manifest and s03 Spotlight

**Files:**
- Create: `components/sections/S02Manifest/index.tsx` + `.module.css`
- Create: `components/sections/S03Spotlight/index.tsx` + `.module.css`
- Test: `components/sections/S02Manifest/__tests__/S02Manifest.test.tsx`
- Test: `components/sections/S03Spotlight/__tests__/S03Spotlight.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `MANIFEST`, `SPOTLIGHTS` (Task 4), `SectionShell`, `gsap`/`useGSAP`, `useReducedMotion`, `next/image`.
- Produces: `<S02Manifest />`, `<S03Spotlight />`.

These two ship together because each is small and neither depends on the other; splitting them would mean two review gates for one afternoon of work.

**s02** is the full manifest: nine lettered categories, 73 items, behind a toggle that shows and
hides the whole grid and defaults to open. The 8-item core loadout it contrasts against lives in
s01 (Task 11), not here. See the correction note in Task 4.

**s03** shows four projects, each with framed imagery that drifts in 2.5D inside its frame on scroll.

- [ ] **Step 1: Write the failing tests**

Create `components/sections/S02Manifest/__tests__/S02Manifest.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { S02Manifest } from '../index';
import { MANIFEST } from '@/content/manifest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

const TOTAL_ITEMS = MANIFEST.reduce((sum, c) => sum + c.items.length, 0);

describe('S02Manifest', () => {
  it('renders the whole manifest expanded by default', () => {
    render(<S02Manifest />);
    expect(screen.getAllByRole('listitem')).toHaveLength(TOTAL_ITEMS);
  });

  it('collapses the grid on toggle', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    await user.click(screen.getByRole('button'));
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('reflects expanded state to assistive tech', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('swaps the toggle label with the state', async () => {
    const user = userEvent.setup();
    render(<S02Manifest />);
    expect(screen.getByRole('button')).toHaveTextContent('COLLAPSE MANIFEST');
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('EXPAND FULL MANIFEST');
  });
});
```

Create `components/sections/S03Spotlight/__tests__/S03Spotlight.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S03Spotlight } from '../index';
import { SPOTLIGHTS } from '@/content/spotlights';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('S03Spotlight', () => {
  it('renders all four projects with their names', () => {
    render(<S03Spotlight />);
    for (const project of SPOTLIGHTS) {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    }
  });

  it('gives every project image a real alt', () => {
    render(<S03Spotlight />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    for (const img of images) {
      expect(img.getAttribute('alt')).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -- S02Manifest S03Spotlight`
Expected: FAIL — neither module resolves.

- [ ] **Step 3: Implement s02**

State is one boolean, initialised to `true`. Render the nine category columns as a grid of `<ul>`s
when open and nothing when closed. The toggle is a real `<button>` carrying `aria-expanded` and
`MANIFEST_LABEL.open` / `MANIFEST_LABEL.closed` as its text.

- [ ] **Step 4: Implement s03**

One frame per project. The 2.5D drift is a `ScrollTrigger` per frame with `scrub`, translating the inner image while the frame stays fixed — so the frame must be `overflow: hidden` and the image slightly larger than it. Skip the drift under reduced motion.

- [ ] **Step 5: Run them to verify they pass**

Run: `npm test -- S02Manifest S03Spotlight`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add components/sections/S02Manifest components/sections/S03Spotlight app/page.tsx
git commit -m "feat: add s02 manifest toggle and s03 project spotlights"
```

---

### Task 13: Zoom mathematics

**Files:**
- Create: `lib/zoom/camera.ts`, `lib/zoom/odometer.ts`, `lib/zoom/clock.ts`
- Test: `lib/zoom/__tests__/camera.test.ts`, `odometer.test.ts`, `clock.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: three pure modules consumed by Task 14:
  - `zoomScale(p: number): number`
  - `zoomFraction(p: number): number`
  - `nextDigitState(current: DigitState, target: number): DigitState`
  - `handAngles(p: number): { hour: number; minute: number; second: number }`
  - `rewindLabel(p: number): string`

This task is pure functions only, no DOM. It exists as its own task because these are the parts of the zoom that can be proven correct without a browser, and the zoom is the highest-risk piece in the build.

**The camera, from README.** Scale is driven in log space because apparent zoom speed is the slope of `ln(scale)`. A naive `power2.out` → `power2.in` chain produced a visible velocity trough at the word handoff; a single linear tween through log space removes it.

```
L0 = ln(0.55), L1 = ln(190), SPLIT = 0.13, SHARE = 0.22
f = p < SPLIT
      ? SHARE * (p / SPLIT)
      : SHARE + (1 - SHARE) * ((p - SPLIT) / (1 - SPLIT))
scale = exp(L0 + (L1 - L0) * f)
```

End scale is **190×**, not 62×. At 62× the background was still visible around the expanding dot when the zoom finished.

**The odometer rule, from README.** The numeric counter is the single source of truth. A digit lands instantly — skipping its roll — if a roll is already in flight, or if the jump is more than one step. Without this, a fast scroll flick drops increments and the year lands wrong. This rule is the single most important assertion in the file.

- [ ] **Step 1: Write the failing camera test**

Create `lib/zoom/__tests__/camera.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { zoomScale, zoomFraction, START_SCALE, END_SCALE, SPLIT, SHARE } from '../camera';

describe('zoomFraction', () => {
  it('is zero at the start', () => {
    expect(zoomFraction(0)).toBe(0);
  });

  it('has spent SHARE of its travel by SPLIT', () => {
    expect(zoomFraction(SPLIT)).toBeCloseTo(SHARE, 10);
  });

  it('is one at the end', () => {
    expect(zoomFraction(1)).toBeCloseTo(1, 10);
  });

  it('is continuous at the split point', () => {
    const before = zoomFraction(SPLIT - 1e-9);
    const after = zoomFraction(SPLIT + 1e-9);
    expect(Math.abs(after - before)).toBeLessThan(1e-6);
  });
});

describe('zoomScale', () => {
  it('starts at 0.55', () => {
    expect(zoomScale(0)).toBeCloseTo(START_SCALE, 10);
  });

  it('ends at 190, not 62', () => {
    expect(zoomScale(1)).toBeCloseTo(END_SCALE, 6);
    expect(END_SCALE).toBe(190);
  });

  it('increases monotonically', () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const scale = zoomScale(p);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
  });

  it('has no velocity trough — log-space slope never dips below the cruise rate', () => {
    const step = 0.002;
    const slopeAt = (p: number) => (Math.log(zoomScale(p + step)) - Math.log(zoomScale(p))) / step;
    const cruise = slopeAt(0.5);
    for (let p = SPLIT + step; p < 1 - step * 2; p += step) {
      expect(slopeAt(p)).toBeGreaterThan(cruise * 0.99);
    }
  });

  it('pushes faster than cruise while UPTIME is on screen', () => {
    const step = 0.002;
    const slopeAt = (p: number) => (Math.log(zoomScale(p + step)) - Math.log(zoomScale(p))) / step;
    expect(slopeAt(0.05)).toBeGreaterThan(slopeAt(0.5));
  });

  it('clamps outside 0–1', () => {
    expect(zoomScale(-1)).toBeCloseTo(START_SCALE, 10);
    expect(zoomScale(2)).toBeCloseTo(END_SCALE, 6);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- camera`
Expected: FAIL — cannot resolve `../camera`.

- [ ] **Step 3: Write `lib/zoom/camera.ts`**

```ts
export const START_SCALE = 0.55;
export const END_SCALE = 190;
export const SPLIT = 0.13;
export const SHARE = 0.22;

const L0 = Math.log(START_SCALE);
const L1 = Math.log(END_SCALE);

export function zoomFraction(p: number): number {
  const t = Math.min(1, Math.max(0, p));
  if (t < SPLIT) return SHARE * (t / SPLIT);
  return SHARE + (1 - SHARE) * ((t - SPLIT) / (1 - SPLIT));
}

export function zoomScale(p: number): number {
  return Math.exp(L0 + (L1 - L0) * zoomFraction(p));
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- camera`
Expected: PASS, 10 tests.

- [ ] **Step 5: Write the failing odometer test**

Create `lib/zoom/__tests__/odometer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nextDigitState, type DigitState } from '../odometer';

const idle = (value: number): DigitState => ({ value, rolling: false, from: value });

describe('nextDigitState', () => {
  it('rolls when the jump is exactly one step', () => {
    const next = nextDigitState(idle(5), 4);
    expect(next).toEqual({ value: 4, rolling: true, from: 5 });
  });

  it('rolls upward by one step too', () => {
    const next = nextDigitState(idle(4), 5);
    expect(next).toEqual({ value: 5, rolling: true, from: 4 });
  });

  it('lands instantly when a roll is already in flight', () => {
    const inFlight: DigitState = { value: 5, rolling: true, from: 6 };
    const next = nextDigitState(inFlight, 4);
    expect(next).toEqual({ value: 4, rolling: false, from: 4 });
  });

  it('lands instantly when the jump is more than one step', () => {
    const next = nextDigitState(idle(9), 4);
    expect(next).toEqual({ value: 4, rolling: false, from: 4 });
  });

  it('is a no-op when the target is unchanged', () => {
    const current = idle(7);
    expect(nextDigitState(current, 7)).toBe(current);
  });

  it('lands the right year after a fast flick from 2026 to 2020', () => {
    let state = idle(6);
    for (const target of [5, 4, 3, 2, 1, 0]) {
      state = nextDigitState(state, target);
    }
    expect(state.value).toBe(0);
  });
});
```

That last test is the regression guard. A fast scroll flick delivers every intermediate target while the previous roll is still in flight; the instant-land rule is what keeps the final value correct.

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- odometer`
Expected: FAIL — cannot resolve `../odometer`.

- [ ] **Step 7: Write `lib/zoom/odometer.ts`**

```ts
export type DigitState = {
  readonly value: number;
  readonly rolling: boolean;
  readonly from: number;
};

export const ROLL_DURATION_S = 0.34;
export const ROLL_TRAVEL_PX = -84;

export function nextDigitState(current: DigitState, target: number): DigitState {
  if (current.value === target) return current;

  const isSingleStep = Math.abs(current.value - target) === 1;
  if (current.rolling || !isSingleStep) {
    return { value: target, rolling: false, from: target };
  }

  return { value: target, rolling: true, from: current.value };
}
```

The rolling glyph rises from below at `y: 0 → -84` over `.34s` with `power3.out`, inside a clipped window — that is what `ROLL_TRAVEL_PX` and `ROLL_DURATION_S` feed in Task 14.

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- odometer`
Expected: PASS, 6 tests.

- [ ] **Step 9: Write the failing clock test**

Create `lib/zoom/__tests__/clock.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { handAngles, rewindLabel } from '../clock';

describe('handAngles', () => {
  it('is at rest at zero progress', () => {
    const { hour, minute, second } = handAngles(0);
    expect(hour).toBeCloseTo(0, 10);
    expect(minute).toBeCloseTo(0, 10);
    expect(second).toBeCloseTo(0, 10);
  });

  it('spins counter-clockwise — every angle is negative', () => {
    const { hour, minute, second } = handAngles(0.5);
    expect(hour).toBeLessThan(0);
    expect(minute).toBeLessThan(0);
    expect(second).toBeLessThan(0);
  });

  it('completes six full second-hand turns over the sweep', () => {
    expect(handAngles(1).second).toBe(-2160);
    expect(handAngles(1).minute).toBe(-360);
    expect(handAngles(1).hour).toBe(-90);
  });
});

describe('rewindLabel', () => {
  it('starts at the full six-year rewind', () => {
    expect(rewindLabel(0)).toBe('REWIND 06Y');
  });

  it('finishes the countdown at p = 0.34, before the zoom ends', () => {
    expect(rewindLabel(0.34)).toBe('REWIND 00Y');
  });

  it('stays at zero past 0.34 while the hands keep spinning', () => {
    expect(rewindLabel(0.7)).toBe('REWIND 00Y');
    expect(rewindLabel(1)).toBe('REWIND 00Y');
  });

  it('zero-pads to two digits', () => {
    expect(rewindLabel(0.17)).toMatch(/^REWIND \d{2}Y$/);
  });
});
```

- [ ] **Step 10: Run it to verify it fails**

Run: `npm test -- clock`
Expected: FAIL — cannot resolve `../clock`.

- [ ] **Step 11: Write `lib/zoom/clock.ts`**

```ts
export const REWIND_YEARS = 6;
export const REWIND_COMPLETE_AT = 0.34;

export function handAngles(p: number): { hour: number; minute: number; second: number } {
  const t = Math.min(1, Math.max(0, p));
  return { hour: -t * 90, minute: -t * 360, second: -t * 2160 };
}

export function rewindLabel(p: number): string {
  const progress = Math.min(Math.max(0, p) / REWIND_COMPLETE_AT, 1);
  const remaining = Math.round(REWIND_YEARS * (1 - progress));
  return `REWIND ${String(remaining).padStart(2, '0')}Y`;
}
```

The hands keep spinning through the entire zoom and never fade out; only the label finishes early, alongside the year roll.

- [ ] **Step 12: Run the whole zoom suite**

Run: `npm test -- zoom`
Expected: PASS, 20 tests across three files.

- [ ] **Step 13: Commit**

```bash
git add lib/zoom
git commit -m "feat: add zoom camera, odometer, and clock mathematics"
```

---

### Task 14: s04 index and the s04→s05 zoom

**Files:**
- Create: `components/sections/S04Index/index.tsx` + `.module.css`
- Create: `components/sections/S04ToS05Zoom/index.tsx`, `ZoomStage.module.css`, `ZoomWords.tsx`, `YearOdometer.tsx`, `BrutalistClock.tsx`
- Test: `components/sections/S04Index/__tests__/S04Index.test.tsx`
- Test: `components/sections/S04ToS05Zoom/__tests__/YearOdometer.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `INDEX_ROWS` (Task 4), all three modules from `lib/zoom/` (Task 13), `gsap`/`ScrollTrigger`/`useGSAP` (Task 6), `useReducedMotion` (Task 5).
- Produces: `<S04Index />` and `<S04ToS05Zoom />`.

This is the centrepiece and the largest task in the plan. Budget a full day.

**s04** is a 16-row monospace project index. Dense, tabular, low-contrast — deliberately a lookup table, not cards. Render it as a real `<table>` so it is navigable.

**The zoom** is a pinned SVG stage. All timings below are normalised progress `0`–`1` of the pinned scroll, driven by one `ScrollTrigger` with `pin: true` and `scrub`.

**Camera:** a single linear tween drives `p: 0→1`; scale comes from `zoomScale(p)`. Never tween scale directly.

**Word handoff, `UPTIME` → `SINCE <year>`:**
- Each word has a two-step motion trail — duplicate copies at `y: 150` (opacity `.16`) and `y: 76` (opacity `.36`).
- Trail ghosts start invisible and collapsed onto the word (`y: -offset`), then fade in while staggering down into their trailing offsets over `.05s`, `.016s` stagger, `power2.out`. `UPTIME`'s trail starts at `p = 0`, the moment the zoom begins.
- `UPTIME` translates `y: -320` over `.085` with `power2.in`, then hides at `.135`.
- `SINCE <year>` fades in at `.13` and travels `y: 150 → 0` over `.09` with `power3.out`, with its own trail.
- Trails **do not fade out** during the zoom — they persist.

Rejected alternatives, recorded so they are not retried: a horizontal seam bar that split open, and a scaleY flip. Literal `steps()` easing on the words was also tried — the stepped *trail look* was wanted, the stepped *motion* was not.

**Year counter:** rolls backwards from the current year to 2020, starting at `p = 0.10` over `.3` with `power1.inOut`, through `YearOdometer`.

**Background clock:** `min(78vh, 78vw)` square, centred, `z-index: 0`. Two nested borders (`--color-borderDim1`, `--color-borderDim2`); 60 tick marks with majors every 5th at 3px wide and `4.5%` tall in `--color-borderMid2`, minors at 1px and `2%` in `--color-borderDim3`; three hands — hour 4×26% `--color-border`, minute 3×38% `--color-borderMid3`, second 2×44% accent at `.28` opacity — and a 14px accent centre block at `.22` opacity. Angles from `handAngles(p)`, starting at `p = 0.10` on a linear `.88`-duration tween.

**Flood:** an accent overlay brings the section to full green as the dot fills the viewport. `s06` fades back to dark on exit.

- [ ] **Step 1: Write the failing s04 test**

Create `components/sections/S04Index/__tests__/S04Index.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S04Index } from '../index';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('S04Index', () => {
  it('renders 16 project rows in a real table', () => {
    render(<S04Index />);
    expect(screen.getAllByRole('row')).toHaveLength(17); // 16 rows + header
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- S04Index`
Expected: FAIL — cannot resolve `../index`.

- [ ] **Step 3: Implement s04**

A `<table>` with a header row and 16 body rows from `INDEX_ROWS`, in 11px mono at low contrast (`--color-textDim` for most cells, `--color-textMuted` for names). Rows reveal with the standard `ScrollTrigger.batch` treatment from Task 15's shared reveal.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- S04Index`
Expected: PASS, 1 test.

- [ ] **Step 5: Write the failing odometer component test**

Create `components/sections/S04ToS05Zoom/__tests__/YearOdometer.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearOdometer } from '../YearOdometer';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('YearOdometer', () => {
  it('renders the year it is given', () => {
    render(<YearOdometer year={2026} />);
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('lands on the target year after a rerender', () => {
    const { rerender } = render(<YearOdometer year={2026} />);
    rerender(<YearOdometer year={2020} />);
    expect(screen.getByText('2020')).toBeInTheDocument();
  });
});
```

Give the odometer an `aria-label` carrying the plain year and mark the per-digit glyph windows `aria-hidden`, so a screen reader reads one number rather than eight loose digits. Assert the visible text via the label.

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- YearOdometer`
Expected: FAIL — cannot resolve `../YearOdometer`.

- [ ] **Step 7: Implement `YearOdometer`**

Four digit windows, each `overflow: hidden`, each holding a current and next glyph. Digit transitions go through `nextDigitState` from Task 13 — never mutate the displayed digit directly. When `rolling` is true, animate the incoming glyph `y: 0 → ROLL_TRAVEL_PX` over `ROLL_DURATION_S` with `power3.out`; when false, set it with no tween.

- [ ] **Step 8: Implement `BrutalistClock`**

Pure SVG. Generate the 60 ticks in a loop; majors are every 5th. Expose a `setProgress(p: number)` through a ref, or accept `progress` as a prop and apply `handAngles(p)` in a `useGSAP` — either way the parent's single ScrollTrigger drives it. `aria-hidden="true"` throughout.

- [ ] **Step 9: Implement `ZoomWords`**

Two word groups, each rendering its text plus two trail ghosts at the specified offsets and opacities. Build the handoff timeline to the exact progress positions listed above.

- [ ] **Step 10: Implement the stage**

One `ScrollTrigger` with `pin: true`, `scrub: true`, and a generous `end` (the pinned distance sets how long the zoom lasts — start at `end: '+=300%'` and tune by eye against the prototype). Inside a `useGSAP`, build one timeline containing: the linear `p` tween feeding `zoomScale`, the word handoff, the year roll from `p = 0.10` over `.3`, the clock spin from `p = 0.10` over `.88`, and the flood.

Under reduced motion: render no pin and no zoom. Show `SINCE 2020` and the flood at final state, cross-fading into `s05`.

- [ ] **Step 11: Run it to verify it passes**

Run: `npm test -- YearOdometer S04Index`
Expected: PASS, 3 tests.

- [ ] **Step 12: Verify against the prototype and measure**

Open both the prototype and `npm run dev` side by side. Scroll the transition slowly, then flick it fast, and confirm the year lands on 2020 both times. Then profile it on a mid-range Android device. If it does not hold frame rate, add a breakpoint-gated static fallback and record the chosen threshold in the spec's Open Questions — decide the threshold from the measurement, not in advance.

- [ ] **Step 13: Commit**

```bash
git add components/sections/S04Index components/sections/S04ToS05Zoom app/page.tsx
git commit -m "feat: add s04 index and the pinned s04-to-s05 zoom transition"
```

---

### Task 15: s05 Trajectory and shared reveals

**Files:**
- Create: `components/sections/S05Trajectory/index.tsx` + `.module.css`
- Create: `components/motion/useSectionReveal.ts`
- Test: `components/sections/S05Trajectory/__tests__/S05Trajectory.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `TRAJECTORY` (Task 4), `gsap`/`ScrollTrigger`/`useGSAP`, `useReducedMotion`.
- Produces: `<S05Trajectory />` and `useSectionReveal(scopeRef, selector)` — the shared reveal used by every section from here on and retrofitted onto Tasks 10–14.

**The shared reveal, from README:** `ScrollTrigger.batch` at `start: "top 92%"`. Elements begin at `opacity: 0, y: 26` and animate to `opacity: 1, y: 0` over `.8s`, `power3.out`, `.08s` stagger. Section numbers fade over `.45s power2.out`.

The earlier 6-cycle yoyo opacity flicker on section numbers read as a flashing bug and was replaced. Do not reintroduce it.

**s05 is the signature section** and it is inverted: background `--color-accent`, text dark. Five posts, reverse chronological, each `min-height: 60vh`, grid `minmax(150px,210px) 24px minmax(0,1fr)`, vertically centred. Padding is `110px 40px 40px`.

**On the green background, dark values are alpha over green,** not opaque tokens: labels `rgba(7,8,9,.62)`, year text `rgba(7,8,9,.45)`, hatch greebles `rgba(7,8,9,.5)`, ghost numerals `rgba(7,8,9,.06)`.

Each post carries a giant ghost year numeral behind it: Archivo Black at `clamp(150px, 21vw, 300px)`, line-height `.7`, `-.05em`, `rgba(7,8,9,.06)`, `right: 1%`, vertically centred. Org labels are `.16em` tracking.

- [ ] **Step 1: Write the failing test**

Create `components/sections/S05Trajectory/__tests__/S05Trajectory.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S05Trajectory } from '../index';
import { TRAJECTORY } from '@/content/trajectory';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('S05Trajectory', () => {
  it('renders all five posts', () => {
    const { container } = render(<S05Trajectory />);
    expect(container.querySelectorAll('[data-post]')).toHaveLength(5);
  });

  it('renders posts in the order the content defines', () => {
    const { container } = render(<S05Trajectory />);
    const posts = Array.from(container.querySelectorAll('[data-post]')).map(
      (el) => el.getAttribute('data-post'),
    );
    expect(posts).toEqual(TRAJECTORY.map((p) => p.post));
  });

  it('marks the ghost year numerals as decorative', () => {
    const { container } = render(<S05Trajectory />);
    const ghosts = container.querySelectorAll('[data-ghost-year]');
    expect(ghosts).toHaveLength(5);
    for (const ghost of ghosts) {
      expect(ghost).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('names every organisation', () => {
    render(<S05Trajectory />);
    for (const post of TRAJECTORY) {
      expect(screen.getByText(post.org)).toBeInTheDocument();
    }
  });
});
```

The ghost-year assertion matters: the numeral duplicates the year already in the post text, so leaving it exposed makes a screen reader say every year twice.

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- S05Trajectory`
Expected: FAIL — cannot resolve `../index`.

- [ ] **Step 3: Write `useSectionReveal`**

```ts
'use client';

import { useGSAP, gsap, ScrollTrigger } from './gsap';
import { useReducedMotion } from './useReducedMotion';

export function useSectionReveal(
  scope: React.RefObject<HTMLElement | null>,
  selector: string,
) {
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;

    const elements = gsap.utils.toArray<HTMLElement>(selector, scope.current);
    gsap.set(elements, { opacity: 0, y: 26 });

    ScrollTrigger.batch(elements, {
      start: 'top 92%',
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
        }),
    });
  }, { dependencies: [reduced, selector], scope, revertOnUpdate: true });
}
```

- [ ] **Step 4: Implement s05**

Build the five posts to the grid and padding above. Every dark value on this section is `rgba(7,8,9, …)` — do not reach for the opaque text tokens, they were mixed for the dark background.

Ghost numerals get `data-ghost-year` and `aria-hidden="true"`.

- [ ] **Step 5: Retrofit the shared reveal**

Replace the ad-hoc reveal code in Tasks 10–14's sections with `useSectionReveal`. Run the full suite afterwards.

- [ ] **Step 6: Run it to verify it passes**

Run: `npm test`
Expected: PASS, the whole suite green.

- [ ] **Step 7: Commit**

```bash
git add components/sections/S05Trajectory components/motion/useSectionReveal.ts components/sections app/page.tsx
git commit -m "feat: add s05 trajectory and shared section reveal"
```

---

### Task 16: s06 Uplink, contact endpoint, analytics, and e2e

**Files:**
- Create: `components/sections/S06Uplink/index.tsx` + `.module.css`
- Create: `lib/contact/schema.ts`
- Create: `app/api/contact/route.ts`
- Create: `.env.example`
- Test: `lib/contact/__tests__/schema.test.ts`
- Test: `app/api/contact/__tests__/route.test.ts`
- Test: `e2e/smoke.spec.ts`
- Modify: `app/layout.tsx`, `app/page.tsx`, `.gitignore`

**Interfaces:**
- Consumes: everything prior.
- Produces: `<S06Uplink />`, `POST /api/contact`, `contactSchema`, and a Playwright smoke suite.

**s06 returns to the dark background** and fades back from green on exit from `s05`.

Rate limiting is deliberately out of scope, per the spec — a single low-traffic personal contact form.

- [ ] **Step 1: Install**

```bash
npm i zod resend @vercel/analytics
npm i -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write the failing schema test**

Create `lib/contact/__tests__/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contactSchema } from '../schema';

describe('contactSchema', () => {
  it('accepts a well-formed message', () => {
    const result = contactSchema.safeParse({
      name: 'Ada', email: 'ada@example.com', message: 'Hello there, this is a real enquiry.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = contactSchema.safeParse({
      name: 'Ada', email: 'not-an-email', message: 'Hello there, this is a real enquiry.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = contactSchema.safeParse({
      name: '', email: 'ada@example.com', message: 'Hello there, this is a real enquiry.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a message under 10 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Ada', email: 'ada@example.com', message: 'hi',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a message over 5000 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Ada', email: 'ada@example.com', message: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- schema`
Expected: FAIL — cannot resolve `../schema`.

- [ ] **Step 4: Write the schema**

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- schema`
Expected: PASS, 5 tests.

- [ ] **Step 6: Write the failing route test**

Create `app/api/contact/__tests__/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: class { emails = { send }; },
}));

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_TO_EMAIL = 'to@example.com';
  process.env.CONTACT_FROM_EMAIL = 'from@example.com';
});

async function post(body: unknown) {
  const { POST } = await import('../route');
  return POST(new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

const valid = { name: 'Ada', email: 'ada@example.com', message: 'A genuine enquiry, at length.' };

describe('POST /api/contact', () => {
  it('sends a valid message and returns 200', async () => {
    const response = await post(valid);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
  });

  it('rejects invalid input with 400 and does not send', async () => {
    const response = await post({ ...valid, email: 'nope' });
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a non-JSON body with 400', async () => {
    const { POST } = await import('../route');
    const response = await POST(new Request('http://localhost/api/contact', {
      method: 'POST', body: 'not json',
    }));
    expect(response.status).toBe(400);
  });

  it('returns 500 when the mail provider fails, without leaking details', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'provider exploded' } });
    const response = await post(valid);
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('provider exploded');
  });
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npm test -- route`
Expected: FAIL — cannot resolve `../route`.

- [ ] **Step 8: Write the route handler**

```ts
import { Resend } from 'resend';
import { contactSchema } from '@/lib/contact/schema';

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error('contact: missing mail configuration');
    return Response.json({ error: 'Unavailable.' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Uplink from ${name}`,
    text: `${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error('contact: send failed', error);
    return Response.json({ error: 'Unavailable.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
```

The provider's error text is logged server-side and never returned — the client gets a generic message.

- [ ] **Step 9: Run it to verify it passes**

Run: `npm test -- route`
Expected: PASS, 4 tests.

- [ ] **Step 10: Write `.env.example`**

```
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

`.gitignore` already excludes `.env*` while allowing `.env.example`. Confirm with `git check-ignore -v .env.example` — it should report no match.

- [ ] **Step 11: Implement s06**

A real `<form>` with labelled `name`, `email`, and `message` fields, validated client-side with the same `contactSchema` before POSTing. Surface validation errors and a success state in the section's own voice — mono, uppercase, `.2em` tracking. Disable the submit button while in flight.

The section returns to `--color-bg` and fades back from the green flood on exit from `s05`.

- [ ] **Step 12: Test the form's states**

Create `components/sections/S06Uplink/__tests__/S06Uplink.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { S06Uplink } from '../index';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
});

async function fill(user: ReturnType<typeof userEvent.setup>, message: string) {
  await user.type(screen.getByLabelText(/name/i), 'Ada');
  await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
  await user.type(screen.getByLabelText(/message/i), message);
  await user.click(screen.getByRole('button', { name: /transmit|send/i }));
}

describe('S06Uplink', () => {
  it('surfaces a validation error and does not POST', async () => {
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'hi');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('POSTs a valid message and shows the success state', async () => {
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'A genuine enquiry, at length.');
    expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('surfaces a failure without claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })));
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'A genuine enquiry, at length.');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
```

Run: `npm test -- S06Uplink`
Expected: PASS, 3 tests. If the field queries fail, the inputs are missing real `<label for>` associations — fix the markup rather than the test.

- [ ] **Step 13: Add analytics**

In `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';
// …inside <body>, after {children}:
<Analytics />
```

- [ ] **Step 14: Write the e2e smoke suite**

Create `playwright.config.ts` with `webServer` running `npm run build && npm run start` on port 3000, then `e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('scrolls through all seven sections with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  for (const id of ['s00', 's01', 's02', 's03', 's04', 's05', 's06']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('skips the boot overlay and leaves the page scrollable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('COLD BOOT')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await page.locator('#s06').scrollIntoViewIfNeeded();
    await expect(page.locator('#s06')).toBeVisible();
  });
});
```

Add `"test:e2e": "playwright test"` to `package.json` scripts.

- [ ] **Step 15: Run everything**

```bash
npm test
npm run build
npm run test:e2e
```

Expected: unit suite green, build succeeds with no type errors, both e2e tests pass.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: add s06 uplink, contact endpoint, analytics, and e2e smoke tests"
```

---

## Verification

Before calling the build done:

- [ ] `npm test` — full unit suite green
- [ ] `npm run build` — no type errors, no lint errors
- [ ] `npm run test:e2e` — both smoke tests pass
- [ ] Side-by-side against `Portfolio Redesign.dc.html`: boot timing, the s01 stepped portrait wipe, the s04→s05 zoom, the s05 inversion
- [ ] Fast-flick the zoom repeatedly — the year lands on 2020 every time
- [ ] Reduced motion forced: no boot, no pin, no parallax, page fully readable
- [ ] Mid-range Android: the zoom holds frame rate, or a static fallback is in place
- [ ] Keyboard-only: rail nav links reach every section, the s02 toggle operates, the form submits
- [ ] Real images supplied for the portrait and four spotlights

## Deferred

Carried from the spec, not built here: CMS, case-study subpages, i18n, theming, and rate limiting on the contact endpoint.
