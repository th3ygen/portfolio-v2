import { expect, test } from '@playwright/test';

/**
 * The hero's ticker carries margin-top:auto, so it eats every pixel of slack
 * in the flex column and the grid sits hard against the top padding —
 * justify-content:center never gets a say. With the prototype's bare 38px the
 * first row landed 2px under the fixed masthead.
 */
test('the hero clears the masthead at every viewport height', async ({ page }) => {
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1440, height: 720 },
    { width: 1280, height: 620 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.locator('[data-boot]').waitFor({ state: 'detached', timeout: 15_000 });

    const gap = await page.evaluate(() => {
      const grid = document.querySelector('#s00 [data-px="-4"]')?.parentElement;
      const masthead = document.querySelector('header');
      if (!grid || !masthead) throw new Error('hero grid or masthead missing');
      return grid.getBoundingClientRect().top - masthead.getBoundingClientRect().bottom;
    });

    expect(gap, `${size.width}x${size.height}`).toBeGreaterThanOrEqual(24);
  }
});
