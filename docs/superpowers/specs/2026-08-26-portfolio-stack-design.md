# Portfolio Rebuild — Tech Stack Design

Date: 2026-08-26
Status: Approved (framework choice), pending review of full spec
Scope: the stack, project structure, and conventions for rebuilding the
`Portfolio Redesign.dc.html` prototype as a real site. Not a feature plan —
section-by-section implementation is a separate document.

## Context

`README.md` in this directory is a handoff for a completed high-fidelity
design: a single-page HUD / digital-brutalism portfolio, seven full-height
sections (`s00`–`s06`) plus a boot overlay, heavy scroll-driven motion, and a
pinned SVG zoom transition between `s04` and `s05`.

The prototype is a single self-contained HTML file with inline styles and one
JS class. It is a visual reference, explicitly not a structure to port.

Constraints taken from the handoff and from the stack conversation:

- Content is static and low-churn (4 spotlights, 16 index rows, 5 timeline
  posts, ~8 core skills plus a full manifest).
- The contact section must actually send.
- Analytics is wanted.
- Per-project case-study subpages are a likely future addition.
- Design values are final and exact. Colours, type scale, easing curves, and
  timing numbers are all specified in `README.md` and must be reproduced.
- Fonts are Archivo Black (display) and JetBrains Mono (everything else).
- The prototype has no reduced-motion path. That is a gap to fill, not a
  behaviour to replicate.

## Decisions

### Framework — Next.js 16, App Router

Chosen over Astro and a Vite SPA.

Resolved at install time as 16.3.3 with React 19.2. The spec was written against 15; `create-next-app@latest` now ships 16, and nothing this design relies on — App Router, route handlers, `next/font/local`, `next/image` — changed across that major. Taking the current stable rather than deliberately pinning back a major.

Next.js covers all three forward-looking needs with no additional services: a
route handler for the contact form, a one-import analytics integration, and
real file-based routing when case studies arrive. It also brings self-hosted
fonts and image optimization, both of which this design needs.

Astro was the closer alternative and would ship less JavaScript, but its
advantage is partial hydration, and this page has no static regions worth
preserving — GSAP, Lenis, ScrollTrigger, a pinned SVG stage and a canvas layer
all run client-side across every section. The islands boundary would become an
obstacle to a shared GSAP context rather than a benefit.

A Vite SPA is the leanest dev loop but hands back routing, fonts, image
handling, and the form endpoint as separate decisions.

Accepted cost: React Server Components buy us almost nothing here. Every
animated section is a client component. Server rendering still produces the
correct initial HTML for crawlers and for the pre-hydration paint, which is
what matters.

### Rendering — static, with one dynamic route handler

Pages are statically generated at build time. The only server-side code is
`app/api/contact/route.ts`.

Full `output: 'export'` is deliberately not used, because it would rule out the
route handler and force the form onto a third-party service.

### Language — TypeScript, `strict: true`

Content lives in typed data modules, so the types are the content schema.
`noUncheckedIndexedAccess` on as well — the index and timeline are array-driven
and this catches the off-by-one class of bug at compile time.

### Styling — CSS Modules plus CSS custom properties

The design ships as a token table and a set of exact values: hard-edged
`repeating-linear-gradient` stripes, `clip-path: inset()` wipes, a two-colour
chromatic-aberration `text-shadow`, `clamp()` type ramps, named `@keyframes`.

Tokens (colour, spacing rhythm, type scale) are declared once as custom
properties on `:root` in `app/globals.css`. Each section gets a colocated
`.module.css` consuming those variables.

Tailwind was considered and rejected: nearly every value in this design is an
arbitrary value, so utility classes would degrade into bracket syntax that is
harder to read than the CSS it replaces, and the keyframe set would live
outside the system anyway.

`border-radius: 0` is a global default, overridden only by the 6px status dot.
This is load-bearing to the direction and belongs in the base layer.

### Animation — GSAP + `@gsap/react` + Lenis

- `gsap` with `ScrollTrigger`, installed as a dependency, not loaded from a CDN.
  GSAP including ScrollTrigger is free under its standard license as of 3.12;
  re-confirm at install time and record the resolved version in this repo.
- `@gsap/react`'s `useGSAP` for every timeline. Its cleanup and dependency
  handling is what replaces the prototype's `_afterBoot` / `data-revealed` /
  `_introPlayed` / watchdog guards. Those guards exist only because the
  prototype hot-reloads a single class. Do not port them.
- `lenis` for smooth scroll, wired to ScrollTrigger via its scroll event. The
  prototype's `scrollerProxy` shim exists because its scroll container was not
  `window`; here it is, so the shim is dropped.

A single `<SmoothScrollProvider>` mounted in the root layout owns the Lenis
instance and the ScrollTrigger wiring, so sections never touch it directly.

### Fonts — `next/font/local`, self-hosted

Archivo Black and JetBrains Mono (300/400/500/700/800) are downloaded and
self-hosted rather than linked from Google Fonts. The boot overlay renders a
counter at `clamp(72px, 15vw, 200px)` in Archivo Black within the first
frames; a swap flash there is highly visible. Self-hosting also removes a
third-party request from the critical path.

Exposed as CSS variables (`--font-display`, `--font-mono`) on `<html>`.

### Images — `next/image`

Only two places need real image assets: the `s01` operator portrait and the
four `s03` spotlights. The prototype's `image-slot.js` is placeholder tooling
and is not ported.

Everything else in the design — corner brackets, hatch greebles, the analog
clock, the stripe progress bar — is reproduced as CSS and inline SVG, with no
image dependency.

Real assets are an open input. See Open Questions.

### Content — typed modules under `content/`

Copy, project entries, index rows, manifest items, and timeline posts are
exported from typed `.ts` modules. No CMS, no MDX. Edits are code changes.

This matches the churn rate (a few edits a year) and makes the data available
to both the page and future case-study routes without a fetch layer.

### Contact — route handler plus Resend

`app/api/contact/route.ts` accepts the `s06` form and sends via Resend. Server-
side validation with Zod; the API key stays in an environment variable and is
never exposed to the client.

Rate limiting is deliberately out of scope for v1 — a single low-traffic
personal contact form. If it gets abused, add it then.

### Analytics — `@vercel/analytics`

One component in the root layout. No cookie banner, no personal data
collected. Chosen over Plausible purely because the site is already on Vercel
and this removes a subscription and a script origin.

### Hosting — Vercel

The previous site was already there, and the route handler and analytics are
native to it.

## Project structure

```
app/
  layout.tsx              root layout, fonts, providers, analytics
  page.tsx                composes s00–s06 in order
  globals.css             reset, tokens, base type, keyframes
  api/contact/route.ts    form handler
components/
  boot/BootOverlay.tsx    the pre-s00 overlay
  sections/               one directory per section, .tsx + .module.css
  chrome/                 rail nav, progress track, ticker, grain, scanlines
  motion/
    SmoothScrollProvider.tsx
    useReducedMotion.ts
content/
  operator.ts  manifest.ts  spotlights.ts  index.ts  trajectory.ts
lib/
  types.ts  tokens.ts
public/fonts/  public/img/
docs/superpowers/specs/
```

One component per section, one stylesheet beside it. The `s04`→`s05` zoom is
the exception in size and gets its own directory with the camera math, the
odometer, and the clock as separate modules — it is the largest single piece
of work in the build and should not live in one file.

## Motion and accessibility

`prefers-reduced-motion: reduce` is honoured through a single hook consumed by
every animated component:

- Boot overlay is skipped entirely; the page renders at `s00`.
- Parallax and reveal animations are disabled; elements render at their final
  state.
- The `s04`→`s05` zoom becomes a cross-fade with the year set directly to
  2020, with no pinning.

The two prototype props, `parallax` and `reveal`, survive as booleans on the
motion provider, defaulting to true and forced false under reduced motion.

The boot overlay runs once per session, gated on `sessionStorage`, rather than
on every load.

The zoom section is expensive. It is measured on a mid-range Android device
before ship; if it does not hold frame rate, a breakpoint-gated static
fallback replaces it on small screens. That threshold is decided from the
measurement, not guessed now.

## Testing

This is a static, animation-driven page, so the testing weight goes where
logic actually exists:

- **Unit (Vitest):** the zoom camera's log-space scale function, the odometer's
  single-source-of-truth digit rule (the one that keeps a fast scroll flick
  from landing the wrong year), the clock rotation math, and the contact
  handler's validation schema. These are pure functions and are extracted as
  such specifically so they can be tested.
- **Component (Vitest + Testing Library):** content modules render the right
  counts and copy; the `s02` manifest toggle works; the form surfaces
  validation and success states.
- **E2E (Playwright):** one smoke test that boots the page, scrolls through all
  seven sections, and asserts no console errors — plus the same run with
  reduced motion forced, asserting the boot overlay never appears and the page
  is scrollable immediately.

Visual regression is explicitly out of scope. Screenshot diffing a page whose
every frame is mid-animation produces noise, not signal. Fidelity is verified
by eye against the prototype.

## Out of scope for v1

- CMS or any editing interface
- Case-study subpages (the structure permits them; they are not built)
- Internationalisation
- Dark/light theming — the design is one committed look
- Rate limiting on the contact endpoint

## Open questions

1. **Real image assets.** The portrait and the four spotlight images do not
   exist in this bundle. The build proceeds with placeholders and the layout is
   correct without them, but the site cannot ship until they are supplied.
2. **GSAP licensing.** Confirm ScrollTrigger's license at install time and
   record the resolved version.
3. **Git.** This directory is not yet a repository. It needs `git init` and a
   first commit before any implementation work starts.

## Consequences

- Adding a case study later is a new file under `content/` and a route under
  `app/work/[slug]/`. No architectural change.
- Moving to a CMS later means replacing the `content/` modules with a fetch
  layer that returns the same types. The types are the seam.
- Changing the accent colour, or any token, is a one-line edit in `globals.css`.
- Dropping Vercel means replacing the analytics import and finding a host for
  one route handler. Nothing else is Vercel-specific.
