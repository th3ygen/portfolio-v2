import { expect, test } from '@playwright/test';

/** Tab past the boot overlay and the rail nav to reach the skip link. */
async function bootHandsOff(page: import('@playwright/test').Page) {
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
}

test('the skip link is the first tab stop and moves focus into main', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'SKIP TO CONTENT' });
  await expect(skip).toBeFocused();
  // Off-screen until focused, on-screen once focused — not display:none, which
  // would drop it from the tab order entirely.
  await expect(skip).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('spotlight cards respond to hover', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  const card = page.locator('[data-spotlight]').first();
  await card.scrollIntoViewIfNeeded();
  const image = card.locator('img').first();

  const before = await image.evaluate((el) => getComputedStyle(el).transform);
  await card.hover();
  await expect
    .poll(async () => image.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
});

test('parallax layers only hold a compositor buffer while moving', async ({ page }) => {
  await page.goto('/');
  await bootHandsOff(page);

  const layer = page.locator('[data-px]').first();
  await page.mouse.move(200, 200);
  await page.mouse.move(900, 600);
  await expect
    .poll(async () => layer.evaluate((el) => getComputedStyle(el).willChange))
    .toBe('transform');

  // ...and releases it once the chase settles.
  await expect
    .poll(async () => layer.evaluate((el) => getComputedStyle(el).willChange), {
      timeout: 5_000,
    })
    .toBe('auto');
});
