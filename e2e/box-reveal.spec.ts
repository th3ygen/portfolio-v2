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
 * Parking against the section top is not enough: a section's top and its copy
 * can be a long way apart, and parking at the top leaves every paragraph
 * untouched below the fold. It was written for s01, whose title runway put
 * thousands of pixels between the two; s03 has the same shape for a different
 * reason, four project cards between its intro and its last blurb.
 */
async function parkCopy(
  page: Page,
  section: string,
  offset: number,
  which: 'first' | 'last' = 'first',
) {
  await page.evaluate(
    ([sel, off, pick]) => {
      const all = [...document.querySelectorAll(`${sel as string} [data-box-reveal]`)];
      const el = pick === 'last' ? all[all.length - 1] : all[0];
      if (!el) throw new Error(`${sel} has no [data-box-reveal]`);
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (off as number));
    },
    [section, offset, which] as const,
  );
}

test('the block covers the paragraph at rest, before anything moves', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  // s03, not s01. s01's lead and body copy went with the gear rework, so it has
  // nothing left to reveal; s03 is the section that now carries a spread of
  // revealable paragraphs — an intro plus one blurb per project card.
  //
  // Below the trigger line: the blocks must be sitting there covered, not
  // waiting off-frame. Starting off-frame was a flash, not a reveal.
  await park(page, '#s03', 1400);
  await page.waitForTimeout(600);

  const resting = await positions(page, '#s03');
  expect(resting.length).toBeGreaterThan(0);
  for (const value of resting) expect(value).toBe(0);
});

test('the block clears the paragraph on entry, staggered, and never returns', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  await parkCopy(page, '#s03', 1400);
  await page.waitForTimeout(400);
  await parkCopy(page, '#s03', 180);

  // Mid-flight the first paragraph must be ahead of the last, or the stagger
  // is not doing anything.
  await page.waitForTimeout(450);
  const mid = await positions(page, '#s03');
  expect(mid[0]).toBeGreaterThan(mid[mid.length - 1] ?? 0);

  // Bring the LAST paragraph to the trigger line, which necessarily carries
  // every paragraph above it past their own. Stepping fixed offsets down from
  // the first one does not: s03 spreads its blurbs over four project cards, and
  // -1000px was still short of the last of them.
  await parkCopy(page, '#s03', 180, 'last');
  await page.waitForTimeout(700);
  await expect.poll(async () => (await positions(page, '#s03')).every((v) => v >= 100), {
    timeout: 8_000,
  }).toBe(true);

  // Once only. Leaving and re-entering must not replay it.
  await parkCopy(page, '#s03', 1400);
  await page.waitForTimeout(600);
  await parkCopy(page, '#s03', -600);
  await page.waitForTimeout(600);
  for (const value of await positions(page, '#s03')) expect(value).toBeGreaterThanOrEqual(100);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('leaves every paragraph uncovered', async ({ page }) => {
    await page.goto('/');
    await park(page, '#s03', 1400);
    await page.waitForTimeout(400);
    for (const value of await positions(page, '#s03')) expect(value).toBeGreaterThanOrEqual(100);
  });
});
