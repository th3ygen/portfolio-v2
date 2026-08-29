import { expect, test, type Page } from '@playwright/test';

async function sectionTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const section = document.querySelector('#s01');
    if (!section) throw new Error('#s01 missing');
    return section.getBoundingClientRect().top + window.scrollY;
  });
}

async function stage(page: Page) {
  return page.evaluate(() => {
    const lockup = document.querySelector('[data-title-lockup]');
    const number = document.querySelector('[data-title-suffix]');
    const active = document.querySelector('[data-role-active="true"]');
    if (!lockup || !number) throw new Error('lockup missing');
    const box = lockup.getBoundingClientRect();
    const numberBox = number.getBoundingClientRect();
    const activeBox = active?.getBoundingClientRect();
    return {
      top: Math.round(box.top),
      left: Math.round(box.left),
      right: Math.round(box.right),
      active: active?.textContent ?? 'NONE',
      opacity: Number(getComputedStyle(lockup).opacity),
      numberBottom: Math.round(numberBox.bottom),
      activeBottom: activeBox ? Math.round(activeBox.bottom) : null,
    };
  });
}

test('the title lockup holds its place while the beats scroll past', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(700);
  const start = await stage(page);

  // position: sticky was inert inside this section — measured, the stage
  // tracked the section's top exactly instead of holding at zero. This is the
  // guard on the ScrollTrigger pin that replaced it.
  await page.evaluate((y) => window.scrollTo(0, y), top + 1.6 * 720);
  await page.waitForTimeout(900);
  const held = await stage(page);

  expect(Math.abs(held.top - start.top)).toBeLessThan(4);
});

test('the column rides through every title and lands on the last', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(700);
  expect((await stage(page)).active).toBe('FRONTEND');

  const seen = new Set<string>();
  for (let step = 0; step <= 16; step += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), top + (step / 16) * 3.4 * 720);
    await page.waitForTimeout(220);
    seen.add((await stage(page)).active);
  }

  // Exactly one title is solid at any moment, and every title gets its turn.
  expect(seen).toContain('BACKEND');
  expect(seen).toContain('INFRA');
  expect(seen).toContain('FULL-STACK');

  await page.evaluate((y) => window.scrollTo(0, y), top + 3.4 * 720);
  await page.waitForTimeout(1000);
  const done = await stage(page);
  expect(done.active).toBe('FULL-STACK');
  // Receded to a backdrop for the rest of the section, not still at full weight.
  expect(done.opacity).toBeLessThan(0.2);
});

test('only one title is solid at a time', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);
  await page.evaluate((y) => window.scrollTo(0, y), top + 1.4 * 720);
  await page.waitForTimeout(900);
  await expect(page.locator('[data-role-active="true"]')).toHaveCount(1);
  await expect(page.locator('[data-role-item]')).toHaveCount(5);
});

test('the dev suffix stays locked to the active title, not the column centre', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  // Centring the lockup aligned `dev` to the column's midpoint, which sits
  // rows away from whichever title is solid.
  for (const mark of [1.2, 2.0, 2.6]) {
    await page.evaluate((y) => window.scrollTo(0, y), top + mark * 720);
    await page.waitForTimeout(800);
    const s = await stage(page);
    expect(Math.abs(s.numberBottom - (s.activeBottom ?? 0)), `at ${mark}`).toBeLessThan(24);
  }
});

test('the lockup fits the viewport at its widest title', async ({ page }) => {
  for (const width of [1440, 1280, 375]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
    const top = await sectionTop(page);
    await page.evaluate((y) => window.scrollTo(0, y), top + 2.4 * 720);
    await page.waitForTimeout(900);

    const box = await stage(page);
    expect(box.left, `left at ${width}`).toBeGreaterThanOrEqual(0);
    expect(box.right, `right at ${width}`).toBeLessThanOrEqual(width);

    // Every title is on screen at once, so the column's width is set by the
    // longest of them, and `dev` sits beside the whole block.
    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWidth, `no h-scroll at ${width}`).toBe(width);
  }
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('collapses the scroll runway when the beats do not play', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(900);

    const reach = await page.evaluate(() => {
      const section = document.querySelector('#s01');
      const header = document.querySelector('#s01 header');
      if (!section || !header) throw new Error('#s01 header missing');
      return Math.round(
        header.getBoundingClientRect().top - section.getBoundingClientRect().top,
      );
    });

    // The runway exists only to give the pin something to scroll through. With
    // the pin skipped it was 3001px of blank page — more than four viewports —
    // between the section's top and its first content.
    expect(reach).toBeLessThan(900);
  });

  test('shows the title as a readable card, not at backdrop opacity', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(900);
    const opacity = await page.evaluate(() =>
      Number(getComputedStyle(document.querySelector('[data-title-lockup]') as Element).opacity),
    );
    expect(opacity).toBeGreaterThan(0.9);
    await expect(page.locator('[data-role-active="true"]')).toHaveText('FULL-STACK');
  });
});
