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

test('the overlay is in the served HTML, not added by an effect', async ({ request }) => {
  // Withholding it until hydration let the page paint first and dropped the
  // overlay in a frame later — visible, and the whole point of a cold boot is
  // that nothing shows before it.
  const html = await (await request.get('/')).text();
  expect(html).toContain('COLD BOOT');
});

test('a returning visitor never paints a frame of the overlay', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 10_000 });

  // Second load in the same session: the overlay is still in the HTML, so the
  // pre-paint script is the only thing standing between it and a flash.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-boot-skip', '1');
  await expect(page.locator('[data-boot]')).toHaveCount(0);
});
