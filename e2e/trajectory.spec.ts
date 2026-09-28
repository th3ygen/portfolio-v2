import { expect, test } from '@playwright/test';

/** Scroll so a post's middle sits on the middle of the viewport. */
async function readPost(page: import('@playwright/test').Page, post: string) {
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-post="${id}"]`);
    if (!el) throw new Error(`${id} missing`);
    const box = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + box.top + box.height / 2 - window.innerHeight / 2);
  }, post);
  await page.waitForTimeout(600);
}

test('the sticky year follows the post being read', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const odometer = page.locator('[data-traj-year] [data-odometer]');

  for (const [post, year] of [
    ['POST.01', '2020'],
    ['POST.03', '2022'],
    ['POST.04', '2023'],
    ['POST.05', '2025'],
    ['POST.02', '2020'],
  ] as const) {
    await readPost(page, post);
    await expect(odometer).toHaveAttribute('aria-label', year);
    await expect(page.locator(`[data-post="${post}"]`)).toHaveAttribute('data-active', 'true');
  }
});

test('the sticky year stays level with the middle of the screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const middle = async () =>
    page.evaluate(() => {
      const box = document.querySelector('[data-traj-year]')!.getBoundingClientRect();
      return box.top + box.height / 2 - window.innerHeight / 2;
    });

  await readPost(page, 'POST.03');
  const at3 = await middle();
  await readPost(page, 'POST.04');
  const at4 = await middle();
  // Stuck: it has not moved with the page between the two posts.
  expect(Math.abs(at3 - at4)).toBeLessThan(2);
  expect(Math.abs(at3)).toBeLessThan(40);
});
