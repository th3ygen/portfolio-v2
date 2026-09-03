import { test, expect } from '@playwright/test';

/** The x scale out of `matrix(a, b, c, d, tx, ty)`. */
function scaleOf(transform: string): number {
  if (transform === 'none') return 1;
  const [a] = transform.replace(/matrix\(|\)/g, '').split(',').map(Number);
  return a ?? 1;
}

/**
 * The card hover used gsap.quickTo on `scale`, which cannot be re-aimed:
 * CSSPlugin expands it to scaleX/scaleY and quickTo's resetTo found no
 * PropTween by that name, so it animated the image by nothing while warning
 * `scale not eligible for reset` on every pointer crossing. It looked like a
 * console nuisance and was a dead interaction.
 *
 * Asserting the settled value rather than "it moved" is the point: the broken
 * version did move — by zero.
 */
test('the spotlight card image scales up under the pointer and releases', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (m) => {
    if (m.text().includes('not eligible for reset')) warnings.push(m.text());
  });

  await page.goto('/');

  const card = page.locator('#s03 [class*="card"]').first();
  await card.scrollIntoViewIfNeeded();
  const image = card.locator('img').first();
  await expect(image).toBeVisible();

  const rest = scaleOf(await image.evaluate((el) => getComputedStyle(el).transform));
  expect(rest).toBeCloseTo(1, 2);

  await card.hover();
  await page.waitForTimeout(900);
  const hovered = scaleOf(await image.evaluate((el) => getComputedStyle(el).transform));
  expect(hovered).toBeGreaterThan(1.01);

  // Away from the list entirely, so the pointer cannot land on a sibling card.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(900);
  const released = scaleOf(await image.evaluate((el) => getComputedStyle(el).transform));
  expect(released).toBeCloseTo(1, 2);

  // The warning is the symptom; a silent pass with warnings means the property
  // lookup is failing again even if something else happens to move.
  expect(warnings).toEqual([]);
});
