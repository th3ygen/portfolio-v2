import { expect, test, type Page } from '@playwright/test';

async function bootHandsOff(page: Page) {
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
}

/** The block's position, per paragraph, as a number of percent. */
async function positions(page: Page, section: string): Promise<number[]> {
  return page.evaluate((sel) => {
    const nodes = [...document.querySelectorAll(`${sel} [data-box-reveal]`)];
    return nodes.map((el) =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue('--box-reveal-x')),
    );
  }, section);
}

/** Scroll so the section's top sits `offset` px below the viewport top. */
async function park(page: Page, section: string, offset: number) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel as string);
      if (!el) throw new Error(`${sel} missing`);
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (off as number));
    },
    [section, offset] as const,
  );
}

/**
 * Scroll so the section's FIRST revealable paragraph sits `offset` px below the
 * viewport top.
 *
 * Parking against the section top is not enough for s01: its title sequence
 * opens with three viewports of scroll runway, so the section's top and its
 * copy are thousands of pixels apart and parking at the top left every
 * paragraph untouched below the fold.
 */
async function parkCopy(page: Page, section: string, offset: number) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(`${sel as string} [data-box-reveal]`);
      if (!el) throw new Error(`${sel} has no [data-box-reveal]`);
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (off as number));
    },
    [section, offset] as const,
  );
}

test('the block covers the paragraph at rest, before anything moves', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  // Below the trigger line: the blocks must be sitting there covered, not
  // waiting off-frame. Starting off-frame was a flash, not a reveal.
  await park(page, '#s01', 1400);
  await page.waitForTimeout(600);

  const resting = await positions(page, '#s01');
  expect(resting.length).toBeGreaterThan(0);
  for (const value of resting) expect(value).toBe(0);
});

test('the block clears the paragraph on entry, staggered, and never returns', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  await parkCopy(page, '#s01', 1400);
  await page.waitForTimeout(400);
  await parkCopy(page, '#s01', 180);

  // Mid-flight the first paragraph must be ahead of the last, or the stagger
  // is not doing anything.
  await page.waitForTimeout(450);
  const mid = await positions(page, '#s01');
  expect(mid[0]).toBeGreaterThan(mid[mid.length - 1] ?? 0);

  // Walk the rest of the section into view so every paragraph gets its turn —
  // parking at the top only triggers the ones above the fold.
  for (const offset of [-200, -600, -1000]) {
    await parkCopy(page, '#s01', offset);
    await page.waitForTimeout(500);
  }
  await expect.poll(async () => (await positions(page, '#s01')).every((v) => v >= 100), {
    timeout: 8_000,
  }).toBe(true);

  // Once only. Leaving and re-entering must not replay it.
  await parkCopy(page, '#s01', 1400);
  await page.waitForTimeout(600);
  await parkCopy(page, '#s01', -600);
  await page.waitForTimeout(600);
  for (const value of await positions(page, '#s01')) expect(value).toBeGreaterThanOrEqual(100);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('leaves every paragraph uncovered', async ({ page }) => {
    await page.goto('/');
    await park(page, '#s01', 1400);
    await page.waitForTimeout(400);
    for (const value of await positions(page, '#s01')) expect(value).toBeGreaterThanOrEqual(100);
  });
});
