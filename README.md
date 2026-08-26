# Handoff: Portfolio Redesign — M. Aidil Syazwan Hamdan

## Overview

A single-page personal portfolio, redesigned around a **HUD / digital-brutalism** aesthetic: monospace chrome, hard edges, acid-green accent, terminal readouts, scroll-driven motion. Seven full-height sections with a fixed left rail nav and a right-side progress track.

The redesign fixed two problems in the previous site:

1. **It contradicted itself on experience level** — copy claimed both junior and senior framing.
2. **It buried the real story.** The interesting throughline is physical-systems and IoT work from 2020 onward (vehicle/face recognition, piping calculators, safety telemetry). The old site hid this under a generic full-stack skills dump (90 skills across 9 categories).

The redesign resolves both: one consistent voice, an 8-item "core loadout" with the full manifest behind a toggle, 4 project spotlights instead of 17 flat cards, and a reverse-chronological career timeline as the emotional centre.

## About the Design Files

**The files in this bundle are design references created in HTML.** They are prototypes that show intended look and behaviour — they are **not production code to copy directly.**

`Portfolio Redesign.dc.html` is a single self-contained file with all markup inline-styled and all motion in one JS class. That structure exists so the design could be iterated on quickly in a design tool. It is deliberately not how the real site should be built.

**The task is to recreate these designs in a real codebase** — Next.js/React is the natural target for this content (static, content-driven, animation-heavy, deploys to Vercel; the previous site was already on Vercel). Componentize by section, move copy into data files, and use the codebase's own styling approach rather than porting inline styles verbatim.

Reference the prototype for: exact visual values, motion timing, and copy. Do not reference it for: file structure, styling method, or DOM structure.

## Fidelity

**High-fidelity.** Colours, typography, spacing, and all interaction/animation behaviour are final. Recreate pixel-faithfully.

Two known compromises made for the prototype environment, both of which should be *improved* in the real build rather than reproduced:

- **Scrolling** is native with a GSAP ScrollTrigger `scrollerProxy` shim, because the prototype's scroll container isn't `window`. In a real app, drop the proxy and use a real smooth-scroll library (Lenis) wired to ScrollTrigger.
- **Defensive re-init guards** (`_afterBoot`, `data-revealed`, `_introPlayed`, watchdog timers) exist only because the prototype hot-reloads its logic class and could double-initialize animations. **Do not port these.** In React, `useGSAP` with a proper dependency array and cleanup makes them unnecessary.

## Screens / Views

One continuous scrolling page. Section IDs `s00`–`s06` in the prototype.

### Boot screen (overlay, before `s00`)

Full-viewport dark overlay that self-dismisses after ~2.3s. Fires before any page animation.

- **Layout:** CSS grid, three rows (header / body / footer). Fixed, `z-index: 200`.
- **Frame:** four 26×26px L-shaped corner brackets, 2px `#c6f21a`, inset 18px.
- **Header bar:** 38px tall, `0 54px` padding, 1px bottom border `#1b2022`, 10px type, `.2em` tracking, `#4a5250`. Left: pulsing 6px green dot + `DIL.SYS` (green, 700). Then `/`, `COLD BOOT`. Right: a state label that steps `POST` → `LOAD` → `HANDOFF`, then `/`, `KRNL 2026.08`.
- **Body:** two columns, bottom-aligned, `40px 54px` padding.
  - Left: seven boot log lines, 11px / 1.7 / `.06em`, `#4a5250`, values in `#c6f21a`. Each starts at `opacity: 0` and snaps to 1 at a percentage threshold. Lines, in order, with their trigger percentage:

    | % | Line | Value |
    |---|---|---|
    | 18 | `> POST ................` | `OK` |
    | 31 | `> MOUNT /operator .....` | `OK` |
    | 47 | `> LOAD loadout.cfg ....` | `8 MODULES` |
    | 58 | `> INDEX systems .......` | `16 RECORDS` |
    | 72 | `> UPLINK handshake ....` | `ESTABLISHED` |
    | 88 | `> RENDER pipeline .....` | `READY` |
    | 99 | `> SESSION OPEN` | blinking `_` cursor, text `#e8ecea` |

  - Right: `LOADING` label (10px, `.24em`, `#4a5250`), then a 3-digit zero-padded counter in Archivo Black, `clamp(72px, 15vw, 200px)`, line-height `.8`, `-.04em`, `#e8ecea`, `font-variant-numeric: tabular-nums`.
- **Footer:** progress bar — 22px tall, `#0e1112` fill, 1px `#1b2022` border, 3px inner padding. Inner bar is a **hard-edged 9px-on / 4px-off green stripe pattern** (`repeating-linear-gradient(90deg, #c6f21a 0 9px, transparent 9px 13px)`), not a solid fill. Below: 9px `.18em` `#38403f` — left a task label, right `M.AIDIL SYAZWAN HAMDAN · KUALA LUMPUR`.
- **Task labels**, stepping with the same thresholds: `INITIALISING`, `MOUNTING /operator`, `READING loadout.cfg`, `INDEXING systems`, `NEGOTIATING uplink`, `WARMING pipeline`, `SESSION OPEN`.
- **Overlays:** 1px/3px horizontal scanline pattern at `rgba(255,255,255,.03)`, plus a heavy inset vignette (`inset 0 0 200px 50px rgba(0,0,0,.85)`).

### `s00` — Hero

- **Layout:** `min-height: 100vh`, flex column, `padding: 38px 0 0 52px`, `overflow: hidden`.
- **Content, in order:** a status row (`FULL-STACK DEVELOPER` in a 1px green outline pill + supporting meta, 10px `.24em`); `$ whoami` prompt line (11px `.2em` `#4a5250`); the name as an `h1` with two block lines — `Muhd Aidil` in `#e8ecea`, `Syazwan` in `#c6f21a` with a chromatic-aberration text-shadow (`3px 0 0 rgba(255,138,61,.5), -3px 0 0 rgba(26,120,242,.35)`); a `max-width: 44ch` intro paragraph; a wrapping chip row; and a bordered stat strip (`border-top: 1px solid #1b2022`).
- **Right side:** a floating HUD readout panel (`data-px="8"`).
- **Background:** a `<canvas>` datamosh layer plus parallax greeble blocks.

### `s01` — Operator

- **Layout:** grid `340px minmax(0,1fr)`, `gap: 64px`, `align-items: start`.
- **Left:** portrait card (`image-slot` placeholder in the prototype — swap for a real optimized image).
- **Right:** a lead statement in Archivo Black `clamp(24px, 2.6vw, 38px)`, then body copy blocks.
- **Transition chrome:** a 2px scan line inset 40px left/right, `linear-gradient(90deg, transparent, #c6f21a 12%, #c6f21a 88%, transparent)` with `0 0 26px 4px rgba(198,242,26,.35)` glow; and an `ACQUIRING OPERATOR` tag, 9px `.22em` green, positioned `right: 40px; top: -22px`.

### `s02` — Full manifest (skills)

8-item core loadout shown by default; full manifest expands behind a toggle. This is the section that replaced the old 90-skill grid — **keep the count discipline.**

### `s03` — Spotlight (projects)

Four projects, detailed: **CAM Kenderaan**, **CAM Muka**, **Piping Calc Tools**, **GajahSafe**. Each has framed imagery with a 2.5D drift inside its frame on scroll.

### `s04` — Full index

16-row monospace project index. Dense, tabular, low-contrast — deliberately a lookup table, not cards.

### `s05` — Trajectory (career timeline) — **the signature section**

Inverted: background `#c6f21a`, text dark. Five posts, **reverse chronological**, each `min-height: 60vh`, grid `minmax(150px,210px) 24px minmax(0,1fr)`, vertically centred.

| # | Year | Organisation |
|---|------|--------------|
| POST.01 | 2020 | DITEC |
| POST.02 | 2020 | UNIVERSITI MALAYSIA PAHANG AL-SULTAN ABDULLAH |
| POST.03 | 2022 | ASCENITY SOLUTIONS · MY OWN COMPANY |
| POST.04 | 2023 | SATOK BRIDGE DIGITAL |
| POST.05 | 2025 | ARKI FINANCE · SINGAPORE · FULL-TIME |

Each post carries a giant ghost year numeral behind it: Archivo Black, `clamp(150px, 21vw, 300px)`, line-height `.7`, `-.05em`, `rgba(7,8,9,.06)`, positioned `right: 1%`, vertically centred. Org labels are `.16em` tracking at `rgba(7,8,9,.62)`. Diagonal hatch greebles at `rgba(7,8,9,.5)`.

### `s06` — Uplink (contact)

Returns to the dark background. Fades back from green on exit from `s05`.

## Interactions & Behavior

### Boot sequence

Progress is eased, not linear: `target = min(1, elapsed/2300)^0.75 * 100`, then lerped toward that target at `0.14` per frame. Body scroll is locked (`overflow: hidden`) and scroll position reset to 0 for the duration. A 4.5s safety timeout force-completes if anything stalls.

**Exit (~2.6s in), three stages:**

1. Header, body, and footer panels each translate `-14px` up and fade out — `.34s cubic-bezier(.4,0,.2,1)`, staggered 40ms apart.
2. After 300ms, the whole overlay wipes upward via `clip-path: inset(0 0 0 0)` → `inset(0 0 100% 0)`, `.62s cubic-bezier(.76,0,.24,1)`.
3. Riding the wipe's bottom edge: a full-width 2px green bar with a `0 0 30px 6px rgba(198,242,26,.45)` glow, translating `-100vh` on the same curve and fading at the end.

Then scroll unlocks, the overlay is removed, ScrollTrigger refreshes, and **only then** does the hero intro timeline play. There was an earlier version with a stuttering green strobe flash at handoff — it was explicitly rejected. The wipe is the intended treatment.

### Hero intro

Plays once, after boot. Standard staggered fade-and-rise. On scroll out of `s00`, the hero's parallax layers drift `y: -70` and fade to `.12` opacity, scrubbed.

### Section reveals

`ScrollTrigger.batch` at `start: "top 92%"`. Elements begin at `opacity: 0, y: 26` and animate to `opacity: 1, y: 0` over `.8s`, `power3.out`, `.08s` stagger.

An earlier version used a 6-cycle yoyo opacity flicker on section numbers. It read as a flashing bug and was replaced with a clean `.45s power2.out` fade — **do not reintroduce flicker on reveal.**

### `s01` operator scan

Scrubbed, `scrub: .45`, from `top 78%` to `top -30%` (a long window so it completes on screen rather than below the fold).

- Scan line travels `top: 0` → `100%` over `0–.8`, then fades out.
- `ACQUIRING OPERATOR` tag fades in at `0`, out by `.55`.
- Portrait card wipes down via `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)`, **`ease: "steps(5)"`** — the hard stepping is intentional.
- Copy lines animate `opacity 0→1`, `y 14→0`, and `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` (left-to-right reveal), `.3s`, `power2.out`, `.07s` stagger.

### `s04` → `s05` zoom transition — **the centrepiece**

A pinned SVG stage. All timings below are normalized progress `0`–`1` of the pinned scroll.

**Camera.** Scale is driven **in log space**, because apparent zoom speed is the slope of `ln(scale)`. A naive `power2.out` → `power2.in` chain produced a visible velocity trough at the word handoff. Instead, a single linear tween drives `p: 0→1`, and:

```
L0 = ln(0.55), L1 = ln(190), SPLIT = 0.13, SHARE = 0.22
f = p < SPLIT
      ? SHARE * (p / SPLIT)                          // fast first leg
      : SHARE + (1 - SHARE) * ((p - SPLIT)/(1 - SPLIT))  // steady cruise
scale = exp(L0 + (L1 - L0) * f)
```

This gives a snappier push while `UPTIME` is on screen and constant perceived speed after, with no trough. **End scale is 190×**, not 62× — at 62× the background was still visible around the expanding dot when the zoom finished.

**Word handoff (`UPTIME` → `SINCE <year>`).** Each word has a **two-step motion trail**: duplicate copies at `y: 150` (opacity `.16`) and `y: 76` (opacity `.36`).

- Trail ghosts start invisible and collapsed onto the word (`y: -offset`), then fade in while staggering down into their trailing offsets — `.05s`, `.016s` stagger, `power2.out`. `UPTIME`'s trail starts at `p = 0`, the moment the zoom begins.
- `UPTIME` translates `y: -320` over `.085`, `power2.in`, then hides at `.135`.
- `SINCE <year>` fades in at `.13` and translates from `y: 150` to `0` over `.09`, `power3.out`, with its own trail.
- Trails **do not fade out** during the zoom — they persist.

Rejected alternatives, for the record: a horizontal seam bar that split open (disliked), and a scaleY flip (disliked). Literal `steps()` easing on the words was also tried — the *stepped trail look* was wanted, the *stepped motion* was not.

**Year counter.** Rolls **backwards from the current year to 2020**, starting at `p = 0.10` over `.3`, `power1.inOut`.

Implemented as an odometer: each digit has a current and next glyph in a clipped window; the new digit rises from below while the old exits (`y: 0 → -84`, `.34s`, `power3.out`). **The numeric counter is the single source of truth** — a digit lands instantly (skipping its roll) if a roll is already in flight or the jump is more than one step. Without this, a fast scroll flick drops increments and the year lands wrong.

**Background clock.** A brutalist analog clock, `min(78vh, 78vw)` square, centred, `z-index: 0`. Two nested borders (`#14181a`, `#101314`), 60 tick marks (majors every 5th: 3px wide, `4.5%` tall, `#1f2527`; minors 1px, `2%`, `#151a1b`), three hands — hour 4×26% `#1b2022`, minute 3×38% `#242a2c`, second 2×44% `#c6f21a` at `.28` opacity — and a 14px green centre block at `.22` opacity.

Hands spin **counter-clockwise** (matching the backwards year), driven by a linear `.88`-duration tween from `p = 0.10`: second `-p*2160°`, minute `-p*360°`, hour `-p*90°`. **The clock keeps spinning through the entire zoom and never fades out.** Its label counts down: `REWIND 06Y` → `REWIND 00Y`, using `min(p/.34, 1)` so the countdown finishes with the year roll while the hands continue.

**Flood.** A `#c6f21a` overlay brings the section to full green as the dot fills the viewport. `s06` fades back to dark on exit.

### Ambient

Grain and scanline overlays; a `om-flick` keyframe animation on the scanline layer; a scrolling tech ticker; parallax on `data-px` / `data-py` elements. An autonomous green sweep was built and then **removed** — all motion should be user-triggered.

## State Management

Minimal — this is a static page. What exists:

- Boot overlay: progress value, current log index, done flag. Locks body scroll while active.
- `s02`: full-manifest expanded/collapsed boolean.
- Everything else is scroll position, owned by ScrollTrigger.

Two tweakable props on the root component, both booleans defaulting to `true`, grouped under "Motion": `parallax` and `reveal`. Worth keeping as feature flags, and worth wiring to `prefers-reduced-motion`.

## Design Tokens

### Colours

| Token | Hex | Use |
|---|---|---|
| Background | `#070809` | Page background |
| Background alt | `#0a0c0d`, `#0b0d0e`, `#08090a` | Section variation — max 1–2 per page |
| Surface | `#0e1112`, `#111516`, `#121617` | Cards, wells, bar tracks |
| Border | `#1b2022` | Primary hairline |
| Border dim | `#14181a`, `#101314`, `#151a1b` | Clock frame, faint structure |
| Border mid | `#1f2426`, `#1f2527`, `#242a2c` | Clock ticks and hands |
| Text primary | `#e8ecea` | Headings, body |
| Text secondary | `#a8b0ae` | Supporting copy |
| Text muted | `#7c8583` | Labels |
| Text dim | `#4a5250` | Log lines, prompts |
| Text faint | `#38403f` | Footnotes |
| Text ghost | `#23292b` | Separators |
| **Accent** | **`#c6f21a`** | Acid green — the single accent |
| Aberration warm | `#ff8a3d` / `rgba(255,138,61,.5)` | Hero text-shadow only |
| Aberration cool | `rgba(26,120,242,.35)` | Hero text-shadow only |

On the green `s05` background, dark values are expressed as alpha over green: `rgba(7,8,9,.62)` for labels, `rgba(7,8,9,.45)` for year text, `rgba(7,8,9,.5)` for hatch greebles, `rgba(7,8,9,.06)` for ghost numerals.

### Typography

Two families only, both Google Fonts:

- **Archivo Black** — display. Name, section numbers, big numerals, lead statements.
- **JetBrains Mono** — everything else. Weights 300, 400, 500, 700, 800.

Import: `https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@300;400;500;700;800&display=swap`

Body default is JetBrains Mono with `ui-monospace, monospace` fallback and `-webkit-font-smoothing: antialiased`.

| Role | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| Hero name | `clamp()` up to very large, Archivo Black | — | tight negative | — |
| Boot counter | `clamp(72px, 15vw, 200px)` Archivo Black | — | `-.04em` | `.8` |
| Ghost year | `clamp(150px, 21vw, 300px)` Archivo Black | — | `-.05em` | `.7` |
| Zoom word | 104px Archivo Black | — | `-3px` | — |
| Zoom year | 34px JetBrains Mono | 300 | `14px` | — |
| Lead statement | `clamp(24px, 2.6vw, 38px)` Archivo Black | — | — | — |
| Body | 11–13px mono | 400 | `.06em` | 1.7 |
| Label | 10px mono | 400 | `.2em`–`.24em` | — |
| Micro label | 9px mono | 400 | `.18em`–`.22em` | — |
| Org label | mono | — | `.16em` | — |

Minimum size is 9px, used only for chrome micro-labels.

### Other values

- **Border radius: 0 everywhere**, except the 6px pulsing status dot (`border-radius: 50%`). This is load-bearing to the brutalist direction.
- Borders: 1px hairlines for structure, 2px for corner brackets and scan lines.
- No box shadows for elevation. Glows only: `0 0 26px 4px rgba(198,242,26,.35)` (scan line), `0 0 30px 6px rgba(198,242,26,.45)` (wipe edge), `0 0 24px 4px rgba(198,242,26,.4)`. One inset vignette on boot.
- Section padding: `40px`–`54px` horizontal; `110px 40px 40px` for trajectory posts.
- Rhythm gaps: `64px` (major columns), `40px`, `34px`, `26px`, `22px`, `16px`, `12px`, `10px`, `6px`.
- `::selection` is `#c6f21a` on `#070809`.

### Keyframes

`om-blink` (cursor, 1.1s step-end), `om-pulse` (status dot, 1.1s), `om-tick` (ticker, `translateX(0 → -50%)`), `om-flick` (scanline flicker — holds `.5` opacity, drops to `.15` at 94%, spikes `.6` at 96%), `om-drift` (background-position `0 0 → 0 -400px`), `om-sweep` (scaleX with a fade tail), `om-glitch`.

## Assets

- **Fonts:** Archivo Black + JetBrains Mono from Google Fonts. Self-host in production.
- **GSAP 3.12.5** + ScrollTrigger, from jsDelivr CDN in the prototype. Install as a dependency instead. **ScrollTrigger is a GSAP paid-plugin-adjacent tool — it is free as of GSAP 3.12 but confirm current licensing before shipping commercially.**
- **Images:** all imagery in the prototype is a drag-and-drop `image-slot.js` placeholder — **no real assets are included in this bundle.** You need real files for: the operator portrait (`s01`) and the four spotlight projects (`s03`). Ask Aidil for these.
- **Graphics:** everything else — corner brackets, hatch patterns, the analog clock, greebles, the stripe progress bar — is CSS/SVG with no image dependency. Reproduce as CSS, not as exported images.

## Files

- `Portfolio Redesign.dc.html` — the complete design. Markup is inline-styled; all motion lives in the `Component` class at the bottom of the file.
- `image-slot.js` — the placeholder image component. **Prototype tooling only — do not port.** Replace with the target framework's image component.

## Implementation notes for a real build

Suggested structure, if Next.js:

- One component per section, `app/page.tsx` composing them in order.
- Copy and timeline data in a `content/` module — the trajectory posts, index rows, and manifest are all data, not markup.
- `@gsap/react`'s `useGSAP` for every timeline, with proper cleanup. **The prototype's re-init guards exist to work around hot-reloading a single class and should not be ported.**
- Lenis for smooth scroll, wired to `ScrollTrigger.scrollerProxy`. Drop the prototype's proxy shim.
- Honour `prefers-reduced-motion`: skip the boot sequence, disable parallax, and make the `s04`→`s05` zoom a simple cross-fade. The current design has no reduced-motion path — this is a genuine gap, not an oversight to replicate.
- Boot overlay should probably only run on first visit per session (`sessionStorage`), not on every navigation. Currently it runs every load.
- The zoom section is expensive. Test on a mid-range phone before committing to it on mobile; a static fallback below some breakpoint is reasonable.
