import { test, expect } from '@playwright/test';

test('pointer parallax moves data-px layers', async ({ page }) => {
  await page.goto('/');
  const layer = page.locator('[data-px="14"]').first();
  await expect(layer).toBeAttached();

  await page.mouse.move(100, 100);
  await page.waitForTimeout(400);
  const left = await layer.evaluate((el) => getComputedStyle(el).transform);

  await page.mouse.move(1200, 800);
  await page.waitForTimeout(400);
  const right = await layer.evaluate((el) => getComputedStyle(el).transform);

  expect(left).not.toBe('none');
  expect(left).not.toBe(right);
});

test('scroll parallax moves data-py layers', async ({ page }) => {
  await page.goto('/');
  const layer = page.locator('[data-py="-46"]').first();
  await expect(layer).toBeAttached();

  await page.locator('#s01').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const a = await layer.evaluate((el) => getComputedStyle(el).transform);

  await page.locator('#s03').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const b = await layer.evaluate((el) => getComputedStyle(el).transform);

  expect(a).not.toBe(b);
});

test('the boot overlay actually appears on a fresh load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('COLD BOOT')).toBeVisible();
  await expect(page.locator('[data-boot-log]')).toHaveCount(7);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('applies no parallax transform at all', async ({ page }) => {
    await page.goto('/');
    const layer = page.locator('[data-px="14"]').first();
    await page.mouse.move(1200, 800);
    await page.waitForTimeout(400);
    expect(await layer.evaluate((el) => el.style.transform)).toBe('');
  });
});
