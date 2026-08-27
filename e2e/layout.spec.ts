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

test('the hero ticker loops horizontally', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-boot]').waitFor({ state: 'detached', timeout: 15_000 });

  const rail = page.locator('[data-ticker]');
  // Deliberately no scrollIntoViewIfNeeded: it waits for the element to stop
  // moving, and this one never does. The rail sits in the hero, already in
  // view on load.
  //
  // The animation is the only thing that moves this element, so a changing
  // transform is proof the keyframes actually resolved.
  const first = await rail.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(async () => rail.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(first);

  await expect(rail).toHaveCSS('animation-iteration-count', 'infinite');
});
