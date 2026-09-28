import { expect, test, type Page } from '@playwright/test';

/** The opening in 2020's dot widens to the dot's radius (RewindWorld's MARK_DOT_R). */
const MARK_DOT_R = 6;

/**
 * The s04 → s05 stage is triggered, not scrubbed. It takes the page when it
 * comes up to fill the screen and holds it on two sections in turn — the
 * UPTIME summary, then the clock wound back to 2020 — waiting for a scroll at
 * each, and dives through the dot into s05 on the last.
 * See components/sections/S04ToS05Zoom.
 *
 * The clock label counts the years left to rewind: 06Y is 2026, 00Y is 2020.
 */

const stage = '[data-zoom-stage]';

/** The summary builds in 1s; the clock assembles and winds back in about 5. */
const SUMMARY_MS = 1500;
const CLOCK_MS = 5500;

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
}

/** Where the stage's top edge is, in page coordinates. */
const stageTop = (page: Page) =>
  page.evaluate((selector) => {
    const element = document.querySelector(selector)!;
    return Math.round(element.getBoundingClientRect().top + window.scrollY);
  }, stage);

async function notches(page: Page, dy: number, count = 1) {
  for (let i = 0; i < count; i += 1) {
    await page.mouse.wheel(0, dy);
    await page.waitForTimeout(40);
  }
}

/** Scroll up to the stage from above until it takes the page. */
async function arrive(page: Page) {
  const top = await stageTop(page);
  await page.evaluate((y) => window.scrollTo(0, y - window.innerHeight * 0.6), top);
  await page.waitForTimeout(400);
  await notches(page, 100, 5);
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'true');
}

const readout = (page: Page) =>
  page.evaluate((selector) => {
    const root = document.querySelector(selector)!;
    const opacity = (query: string) => Number.parseFloat(getComputedStyle(root.querySelector(query)!).opacity);
    return {
      label: root.querySelector('[data-clock-label]')!.textContent,
      uptime: opacity('[data-uptime]'),
      hub: opacity('[data-hub]'),
      widget: opacity('[data-w-widget]'),
      chrome: opacity('[data-w-chrome]'),
      hole: Number(root.querySelector('[data-zoom-hole]')!.getAttribute('r')),
      transform: root.querySelector('[data-zoom-scaler]')!.getAttribute('transform') ?? '',
    };
  }, stage);

/** How far the centre of `query`, inside the stage, is from the viewport's. */
const offCentre = (page: Page, query: string) =>
  page.evaluate(
    ([selector, inner]) => {
      const box = document.querySelector(`${selector} ${inner}`)!.getBoundingClientRect();
      return {
        x: box.x + box.width / 2 - window.innerWidth / 2,
        y: box.y + box.height / 2 - window.innerHeight / 2,
      };
    },
    [stage, query] as const,
  );

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

test('the page holds on the summary, then the clock, and waits for a scroll at each', async ({ page }) => {
  await ready(page);
  await arrive(page);
  const top = await stageTop(page);

  // Section one: the summary builds around UPTIME, and stays.
  await page.waitForTimeout(SUMMARY_MS);
  let now = await readout(page);
  expect(now.widget).toBeGreaterThan(0.98);
  expect(now.uptime).toBeGreaterThan(0.98);
  expect(now.hub).toBeLessThan(0.02);
  await page.waitForTimeout(1500);
  expect((await readout(page)).hub).toBeLessThan(0.02);
  expect(await scrollY(page)).toBe(top);

  // Section two: the clock, assembled out of it and wound back to 2020.
  await notches(page, 100);
  await page.waitForTimeout(CLOCK_MS);
  now = await readout(page);
  expect(now.chrome).toBeLessThan(0.02);
  expect(now.uptime).toBeLessThan(0.02);
  expect(now.hub).toBeGreaterThan(0.98);
  expect(now.label).toBe('REWIND 00Y');
  expect(now.hole).toBe(0);
  expect(await scrollY(page)).toBe(top);

  // 2020's dot is in the window, and the window is the centre of the frame.
  const dot = await offCentre(page, '[data-year-mark="2020"] [data-mark-dot]');
  expect(Math.abs(dot.x)).toBeLessThan(3);
  expect(Math.abs(dot.y)).toBeLessThan(3);

  // Through the dot, and the page goes on into s05 by itself.
  await notches(page, 100);
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'false', { timeout: 4_000 });
  await page.waitForTimeout(1300);
  expect((await readout(page)).hole).toBeCloseTo(MARK_DOT_R, 1);
  const s05 = await page.evaluate(() => document.getElementById('s05')!.getBoundingClientRect().top);
  expect(Math.abs(s05)).toBeLessThan(4);
});

test('the summary flies into the clock: the gauge onto the rim, the processes into the hub', async ({ page }) => {
  await ready(page);
  await arrive(page);
  await page.waitForTimeout(SUMMARY_MS);
  await notches(page, 100);
  await page.waitForTimeout(CLOCK_MS);

  // The flights land where the clock was once assembled: centred on the
  // stage, which fills the viewport while the page is held.
  for (const piece of ['[data-w-gauge]', '[data-w-proc]']) {
    const off = await offCentre(page, piece);
    expect(Math.abs(off.x), piece).toBeLessThan(3);
    expect(Math.abs(off.y), piece).toBeLessThan(3);
  }
});

/**
 * The camera writes its own transform: a zoom, then a pan onto the focus.
 *
 * GSAP resolves transformOrigin against the bounding box, and the scaler's
 * bbox moves every frame as UPTIME goes and the ring turns — so a GSAP-driven
 * scale drifts off its target frame by frame. Asserting the shape of the
 * attribute is what catches that coming back.
 */
test('the camera writes its own zoom and pan, not a GSAP transform', async ({ page }) => {
  await ready(page);
  await arrive(page);
  await page.waitForTimeout(SUMMARY_MS);
  await notches(page, 100);

  const seen: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    await page.waitForTimeout(450);
    seen.push((await readout(page)).transform);
  }
  for (const transform of seen) {
    expect(transform).toMatch(/^scale\(\d+\.\d+\) translate\(0 -?\d+\.\d+\)$/);
  }
  expect(new Set(seen).size).toBeGreaterThan(5);
});

test('a scroll during a beat is dropped, not queued', async ({ page }) => {
  await ready(page);
  await arrive(page);

  // While the summary builds: a fresh gesture, then a trackpad-length run.
  await page.waitForTimeout(400);
  await notches(page, 100, 12);

  // The summary lands and the page waits; the clock never starts.
  await page.waitForTimeout(2500);
  const now = await readout(page);
  expect(now.hub).toBeLessThan(0.02);
  expect(now.uptime).toBeGreaterThan(0.98);
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'true');
});

test('a jump past the stage does not hold, and leaves it through the dot', async ({ page }) => {
  await ready(page);
  await page.click('a[href="#s06"]');
  await page.waitForTimeout(800);

  await expect(page.locator(stage)).toHaveAttribute('data-held', 'false');
  const now = await readout(page);
  expect(now.label).toBe('REWIND 00Y');
  expect(now.hole).toBeCloseTo(MARK_DOT_R, 1);
});

test('coming back up from s05 plays it backwards', async ({ page }) => {
  await ready(page);
  await page.click('a[href="#s06"]');
  await page.waitForTimeout(800);

  const top = await stageTop(page);
  await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 0.45), top);
  await page.waitForTimeout(400);
  await notches(page, -100, 3);
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'true');

  // Out of the dot, onto the clock.
  await page.waitForTimeout(2600);
  let now = await readout(page);
  expect(now.hole).toBe(0);
  expect(now.label).toBe('REWIND 00Y');

  // The clock winds forward and comes apart back into the summary.
  await notches(page, -100);
  await page.waitForTimeout(CLOCK_MS);
  now = await readout(page);
  expect(now.label).toBe('REWIND 06Y');
  expect(now.uptime).toBeGreaterThan(0.98);
  expect(now.chrome).toBeGreaterThan(0.98);
  expect(now.hub).toBeLessThan(0.02);

  // One more and the page goes on up — the summary does not un-build first.
  await notches(page, -100);
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'false');
  expect((await readout(page)).widget).toBeGreaterThan(0.98);
});

test('nothing on the stage paints the accent over the whole frame', async ({ page }) => {
  await ready(page);
  await arrive(page);
  await page.waitForTimeout(SUMMARY_MS);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(CLOCK_MS);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator(stage)).toHaveAttribute('data-held', 'false', { timeout: 4_000 });

  const flood = await page.evaluate(
    (selector) =>
      [...document.querySelectorAll(`${selector} *`)].some((el) => {
        const cs = getComputedStyle(el);
        return cs.position === 'absolute' && cs.inset === '0px' && cs.backgroundColor === 'rgb(198, 242, 26)';
      }),
    stage,
  );
  expect(flood).toBe(false);
});
