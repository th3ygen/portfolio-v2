import { expect, test } from '@playwright/test';

/**
 * The camera must write a bare `scale()` and nothing else.
 *
 * GSAP resolves transformOrigin against the bounding box, and the scaler's
 * bbox moves every frame as UPTIME leaves and SINCE arrives — so a GSAP-driven
 * scale emits a compensating `translate()` that drifts the zoom target frame by
 * frame. Asserting the shape of the attribute is what catches that coming back.
 */
test('the zoom camera scales about the dot, not the bounding box', async ({ page }) => {
  await page.goto('/');

  const scaler = page.locator('[data-zoom-scaler]');
  await scaler.scrollIntoViewIfNeeded();

  const seen: string[] = [];
  for (const y of [0, 900, 1800, 2700]) {
    await page.mouse.wheel(0, y === 0 ? 0 : 900);
    await page.waitForTimeout(400);
    seen.push((await scaler.getAttribute('transform')) ?? '');
  }

  for (const transform of seen) {
    expect(transform).toMatch(/^scale\(\d+(\.\d+)?\)$/);
  }
  // And it actually moved, or the assertion above proves nothing.
  expect(new Set(seen).size).toBeGreaterThan(1);
});

/** Scroll to a fraction of the way through the pinned zoom. */
async function scrub(page: import('@playwright/test').Page, progress: number) {
  await page.evaluate((p) => {
    const stage = document.querySelector('[data-zoom-stage]');
    if (!stage) throw new Error('zoom stage missing');
    const top = window.scrollY + stage.getBoundingClientRect().top;
    window.scrollTo(0, top + p * window.innerHeight * 3.4);
  }, progress);
  await page.waitForTimeout(1200);
}

test('UPTIME detonates into a vertical column of clones', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const spread = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('[data-clone]')].map((el) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return m.m42;
      }),
    );

  await scrub(page, 0.005);
  // Stacked on the solid word before the blast.
  for (const y of await spread()) expect(Math.abs(y)).toBeLessThan(40);

  await scrub(page, 0.09);
  const landed = await spread();
  // Spread on the vertical axis, symmetrically about the word.
  expect(Math.min(...landed)).toBeLessThan(-300);
  expect(Math.max(...landed)).toBeGreaterThan(300);
});

test('UPTIME is gone before SINCE arrives', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const both = () =>
    page.evaluate(() => ({
      uptime: Number.parseFloat(getComputedStyle(document.querySelector('[data-zw="0"]')!).opacity),
      since: Number.parseFloat(getComputedStyle(document.querySelector('[data-zw="1"]')!).opacity),
    }));

  // The two must never share a frame — that overlap is what the handoff beat
  // exists to prevent.
  for (const progress of [0.11, 0.145, 0.165, 0.2]) {
    await scrub(page, progress);
    const { uptime, since } = await both();
    expect(Math.min(uptime, since), `both visible at ${progress}`).toBeLessThan(0.02);
  }

  await scrub(page, 0.2);
  expect((await both()).since).toBeGreaterThan(0.9);
});
