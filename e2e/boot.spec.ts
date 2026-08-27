import { expect, test } from '@playwright/test';

/**
 * The overlay's wipe uncovers the page 680ms before `bootDone` flips. If the
 * hero is not already hidden by then, it shows at full opacity through the
 * wipe and is snapped to zero to animate in — reads as a flash.
 */
test('the hero never flashes visible behind the boot wipe', async ({ page }) => {
  await page.goto('/');

  const overlay = page.locator('[data-boot]');
  const heading = page.locator('#s00 h1');

  await expect(overlay).toBeVisible();
  await expect(heading).toHaveCSS('opacity', '0');

  await expect(overlay).toHaveCount(0, { timeout: 10_000 });
  await expect(heading).toHaveCSS('opacity', '1');
});
