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
