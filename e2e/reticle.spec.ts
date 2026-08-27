import { expect, test, type Page } from '@playwright/test';

const DOT = '[data-reticle] > div:nth-child(3)';

async function translation(page: Page): Promise<{ x: number; y: number }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error('reticle dot missing');
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return { x: m.m41, y: m.m42 };
  }, DOT);
}

test('the crosshair eases toward the pointer rather than snapping to it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  await page.mouse.move(200, 200);
  await page.waitForTimeout(700);

  // Painting the raw event position put the crosshair here instantly, and read
  // as steppy on a fast flick. Immediately after a jump it must still be short
  // of the target.
  await page.mouse.move(1100, 700);
  await page.waitForTimeout(60);
  const inFlight = await translation(page);
  expect(inFlight.x).toBeGreaterThan(200);
  expect(inFlight.x).toBeLessThan(1050);

  await expect.poll(async () => Math.round((await translation(page)).x), { timeout: 5_000 }).toBe(1100);
  expect(Math.round((await translation(page)).y)).toBe(700);
});

test('the readout tracks the pointer, not the eased position', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  await page.mouse.move(200, 200);
  await page.waitForTimeout(700);
  await page.mouse.move(880, 440);
  await page.waitForTimeout(60);

  // The crosshair is allowed to lag. The coordinates are not.
  const label = await page.locator('[data-reticle] > div:nth-child(4)').textContent();
  expect(label).toBe('0880 · 0440');
});

test('the crosshair stays faint enough to sit under the content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(600);

  const alpha = await page.evaluate(() => {
    const read = (sel: string, prop: string) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`${sel} missing`);
      const value = getComputedStyle(el)[prop as 'color'] as string;
      return Number.parseFloat(/rgba?\([^)]*?,\s*([\d.]+)\)/.exec(value)?.[1] ?? '1');
    };
    return {
      dot: read('[data-reticle] > div:nth-child(3)', 'borderTopColor'),
      label: read('[data-reticle] > div:nth-child(4)', 'color'),
    };
  });

  expect(alpha.dot).toBeLessThanOrEqual(0.25);
  expect(alpha.label).toBeLessThanOrEqual(0.3);
});
