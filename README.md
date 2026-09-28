# Handoff: Portfolio Redesign — M. Aidil Syazwan Hamdan

## Overview

A single-page personal portfolio, redesigned around a **HUD / digital-brutalism** aesthetic: monospace chrome, hard edges, acid-green accent, terminal readouts, scroll-driven motion. Seven full-height sections with a fixed left rail nav and a right-side progress track.

The redesign fixed two problems in the previous site:

1. **It contradicted itself on experience level** — copy claimed both junior and senior framing.
2. **It buried the real story.** The interesting throughline is physical-systems and IoT work from 2020 onward (vehicle/face recognition, piping calculators, safety telemetry). The old site hid this under a generic full-stack skills dump (90 skills across 9 categories).

The redesign resolves both: one consistent voice, an 8-item "core loadout" with the full manifest beneath it, 4 project spotlights instead of 17 flat cards, and a reverse-chronological career timeline as the emotional centre.

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

The 8-item core loadout lives in `s01`; `s02` is the full manifest, always open, printing in on view with the eight tagged `[EQ]` where they sit. This is the section that replaced the old 90-skill grid — **keep the count discipline.**

### `s03` — Spotlight (projects)

Four projects, detailed: **CAM Kenderaan**, **CAM Muka**, **Piping Calc Tools**, **GajahSafe**. Each has framed imagery with a 2.5D drift inside its frame on scroll.

### `s04` — Full index

16-tile bento grid, four columns. The four s03 spotlights take 2×2 tiles; `grid-auto-flow: dense` backfills the singles. At rest each tile is type only; hovering wipes the project's screen up from the bottom edge (clip-path, accent scan line on the leading edge, image settling from 1.12 to 1). Without hover, the screens show dimmed from the start.

### `s05` — Trajectory (career timeline) — **the signature section**

Dark ground, continuous with the end of the zoom (which lands inside the dot on `--color-bg`). Five posts, **reverse chronological**, each `min-height: 60vh`, vertically centred. The year is a single **sticky odometer** in a left column (`minmax(150px,210px)`) — the same `20•20` counter the zoom rewinds, picked up at mid-screen and rolled forward as each post crosses the middle of the viewport; each post keeps its own year and tag in its head for screen readers. The accent marks the year, the post being read (filled rail node, role at full weight) and the two posts still running (`ACTIVE`, with a pulsing dot). Below 700px the year becomes a bar stuck under the masthead.

| # | Year | Organisation |
|---|------|--------------|
| POST.01 | 2020 | DITEC |
| POST.02 | 2020 | UNIVERSITI MALAYSIA PAHANG AL-SULTAN ABDULLAH |
| POST.03 | 2022 | ASCENITY SOLUTIONS · MY OWN COMPANY |
| POST.04 | 2023 | SATOK BRIDGE DIGITAL |
| POST.05 | 2025 | ARKI FINANCE · SINGAPORE · FULL-TIME |

Each post carries a giant ghost year numeral behind it: Archivo Black, `clamp(150px, 21vw, 300px)`, line-height `.78`, `-.05em`, outlined in `--color-surface3`, positioned `right: 1%`, vertically centred. Org labels are `.16em` tracking in `--color-textDim`. An earlier version put this section on a full `#c6f21a` ground, inherited from a flood at the end of the zoom; it was too much green for a dark page.

### `s06` — Uplink (contact)

Dark background, like `s05` before it.

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

### `s04` → `s05` UPTIME and the rewind — **the centrepiece**

One stage, two sections, and the dive between them and `s05`:

1. **UPTIME.** The word, with a summary around it, two widgets a side (above and below it on upright screens). It is a place to read, not a transition: it builds in as the page arrives, then waits.
2. **The clock.** One scroll and the summary's data flies into a clock, which winds smoothly back until 2020 is in the window at twelve. It waits there. The next scroll dives through 2020's dot onto `s05`'s ground.

It is **triggered, not scrubbed**: a one-screen stage (never pinned) that takes the page as it comes up and plays each part through at its own speed, waiting for a scroll between them. There is no progress indicator: the summary and the clock are the content.

**The gate** (`rewindGate.ts`, `lib/zoom/gate.ts`). When the stage's top edge comes within 30% of the viewport's, from either side, Lenis stops, the stage glides flush (`.5s`) and the next beat plays. From there, scroll input is read as **requests for beats, not distance**:

- Events are grouped into gestures: a run in one direction with no gap over `180ms`. A gesture asks for **exactly one beat**, however long or hard it is. A trackpad swipe plus its inertia is one beat, not sixty; so is a wheel spun hard.
- The gesture that carried the reader in is treated as continuing, so arriving plays beat one and nothing more.
- Anything asked for **while a beat is playing is dropped**. A beat always plays out at its written speed, and nothing queues behind it. Hurrying (5× on a mid-beat scroll) and throw-to-skip were both built and removed: beats collapsing into each other read as the page glitching.
- Arrows, Page keys and Space step like a scroll.
- Asking past either end lets the page go: down onto the top of `s05` (`.9s` glide), or up to 45% of a screen above the stage. After the dive the page carries on by itself, since the frame is already `s05`'s ground.
- It holds from below too. Coming back up out of `s05`, the same beats play **backwards**: out of the dot, the year rolling forward, UPTIME reassembling.
- A jump that crosses the band in one frame (rail link, restored scroll) doesn't hold. It sets the stage to whichever end it landed past.

The first stop is the summary unbuilt: arriving plays the build, and scrolling back up from the built summary lets the page go without un-building it.

**The world** (`RewindWorld.tsx`). One SVG coordinate space, filmed by the camera. Units are a thousandth of the viewport's shorter side (`viewBox="-500 -500 1000 1000"`, `meet`), so the clock fills the same share of a phone as of a monitor. The clock is centred on the origin: a 60-tick face (`r 300`), an outer rim (`r 400`), three hands and a square accent hub. Between them is the **year ring** (`r 350`), twelve slots 30° apart. This year down to 2020 fill seven of them, newest at twelve and older anticlockwise, written like the odometer (`20•26`); the other five are blank squares. A **window** is fixed to the dial at twelve: an accent frame, a ▼ marker, and `SINCE` beneath it. Only 2020 carries the opening for the dive.

**Camera.** Positioned by **depth** (the fraction of log-space travel from `1×` to `260×`: `scale = exp(L0 + (L1 − L0)·depth)`) and a **focus** on the vertical axis. Apparent zoom speed is the slope of `ln(scale)`, so equal steps of depth are equal pushes of the lens at any magnification. 260× is what it takes for the dot to cover the corners of an upright phone. The camera writes its own transform attribute, `scale(s) translate(0 −focus)`. A GSAP transform would resolve its origin against the moving bounding box and drift.

**The summary** (`UptimeWidgets.tsx`, `content/uptime.ts`). Every figure is derived from content the page already states, so it cannot disagree with the sections it summarises:
- **SYS.UPTIME**: years since the first post (a ring gauge cut into a segment per year).
- **POSTS OPENED / YR**: a bar per year from 2020, empty years included.
- **DEPLOYMENTS**: a cell per index project (public filled), with the top sectors.
- **RUNNING**: the `ACTIVE` posts, plus client and stack counts.

Each widget is split into **chrome** (frame, headings, labels, numbers; `data-w-chrome`), which fades as the clock assembles, and **data**, which flies into the clock and becomes part of it. The flights are measured from the layout, not authored, and are re-measured on resize. The summary is `aria-hidden`: it restates `s01`, `s04` and `s05` in figures, and a reader meets those in order.

**The timeline** (`rewindTimeline.ts`) is one paused timeline, played between stops by the gate. Every tween is a `fromTo` with both ends stated, and every readout (camera, ring, label) is written in an `onUpdate` from its own tween's value, never in a `call`. That is what makes it reversible. Nothing before the dive steps: the clock moves on eased curves throughout.

1. **Summary** (`1s`). The widgets rise in, the gauge's segments light in turn, the bars grow, the project cells fill and the figures count up to what the markup already prints.
2. **Clock** (about `3.7s` from the scroll to 2020, then a `.2s` hold). The data flies into place on `power3.inOut` (`.55`–`.75s` flights) while the chrome fades:
   - the **gauge** swells into the **rim**, its stroke counter-scaled so it stays a line;
   - the **project cells** spread out to become **ticks**, and a sweep turns once and fills in the rest of the face;
   - each year's **bar** lands on its **year on the ring**, oldest first;
   - the **running processes** fall into the centre, where UPTIME folds down into the **hub**, and the hands grow out of it.

   The last piece lands at `.9s`, the clock **holds, built and still, for `.35s`**, and then one continuous turn winds the ring back six slots (`2.4s`, `power1.inOut`). The hands grow out of the hub straight into the sweep (no spin-up of their own) and turn back on the same curve: two minute-hand turns across the whole rewind, not six whips. The camera closes in and pans up toward the window at the same time. Each year brightens continuously as it comes round into the window. By the time 2020 is in the window, the window is the centre of the frame at `2.4×`.
3. **DIVE** (`.5s` lock + `1.5s` dive + `.35s` hold). Four brackets snap in around 2020's dot (`steps(3)`), its digits and `SINCE` dim to `.22` so the dot is the only lit thing, and every hand turns round to twelve: zero hour. Then the camera dives (`power3.in` on depth; the one move on the page that is still accelerating when it ends). The dial fades as it swells past the lens, warp streaks shoot out from the dot in screen space, and from 60% of the dive the dot **opens**. A disc of page ground widens inside it to its full radius, so the green becomes a ring whose band sweeps out past the frame. It lands inside the dot on `--color-bg`. There is no flood.

Under reduced motion there is no hold and no clock: the stage shows the summary, built and still.

Rejected alternatives, for the record: a scroll-scrubbed zoom across a `340%` pin (the whole transition before this one); UPTIME detonating into hollow clones with `SINCE <year>` on an odometer, and the years left behind stamped huge behind the frame (the first triggered version; only its dive survived); a clock that clicked a slot per year with the hands whipping an hour each click, behind a beat-progress HUD (too steppy, too fast, and nothing to read while it played); a horizontal seam bar that split open; a scaleY flip; literal `steps()` easing on the words (the *stepped trail look* was wanted, the *stepped motion* was not); and a full-screen `#c6f21a` flood at the end, which `s05` inherited as its ground — too much green for a dark page.

### Ambient

Grain and scanline overlays; a `om-flick` keyframe animation on the scanline layer; a scrolling tech ticker; parallax on `data-px` / `data-py` elements. An autonomous green sweep was built and then **removed** — all motion should be user-triggered.

## State Management

Minimal — this is a static page. What exists:

- Boot overlay: progress value, current log index, done flag. Locks body scroll while active.
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
