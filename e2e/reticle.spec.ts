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

test('the crosshair acquires a lockable target and names it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const brackets = page.locator('[data-lock-bracket]');
  await expect(brackets).toHaveCount(4);

  await page.mouse.move(400, 400);
  await page.waitForTimeout(400);
  // At rest the brackets are not on screen at all.
  expect(await brackets.first().evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

  const row = page.locator('#s04 tbody tr[data-lock]').first();
  await row.scrollIntoViewIfNeeded();
  const name = await row.getAttribute('data-lock');
  await row.hover();
  await page.waitForTimeout(500);

  // Acquired: brackets visible, and sitting on the row's own corners.
  expect(Number(await brackets.first().evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
  const box = await row.boundingBox();
  const corner = await brackets.first().evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return { x: m.m41, y: m.m42 };
  });
  expect(Math.abs(corner.x - (box?.x ?? 0))).toBeLessThan(14);

  // The readout stops reporting where it is and reports what it has.
  const label = await page.locator('[data-reticle] > div:nth-child(4)').textContent();
  expect(label).toBe(`▸ ${name}`);
});

test('the crosshair releases the target when the pointer leaves it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const row = page.locator('#s04 tbody tr[data-lock]').first();
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await page.waitForTimeout(400);

  await page.locator('#s04 h2').hover();
  await page.waitForTimeout(400);

  const brackets = page.locator('[data-lock-bracket]');
  expect(Number(await brackets.first().evaluate((el) => getComputedStyle(el).opacity))).toBe(0);
  const label = await page.locator('[data-reticle] > div:nth-child(4)').textContent();
  expect(label).not.toContain('▸');
});

test('the crosshair glides onto a locked target rather than jumping to it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const item = page.locator('#s01 [data-lock]').last();
  await item.scrollIntoViewIfNeeded();
  const box = await item.boundingBox();
  if (!box) throw new Error('lockable item has no box');

  // Approach from well away, so a chase would still be visibly in flight.
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4);
  await page.waitForTimeout(500);

  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // Settles on the target's centre rather than sitting under the pointer.
  await expect
    .poll(async () => Math.abs((await translation(page)).x - centre.x), { timeout: 4_000 })
    .toBeLessThan(6);
  expect(Math.abs((await translation(page)).y - centre.y)).toBeLessThan(6);
});

test('the crosshair travels to a locked target instead of teleporting', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });

  const item = page.locator('#s01 [data-lock]').last();
  await item.scrollIntoViewIfNeeded();
  const box = await item.boundingBox();
  if (!box) throw new Error('lockable item has no box');

  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // Settle somewhere neutral FIRST. On the very first pointer sighting the move
  // handler assigns the crosshair straight to the cursor, which lands after the
  // acquire and masks whatever acquire did — an earlier version of this test
  // entered cold and passed even with a hard teleport in place.
  await page.mouse.move(6, 6);
  await page.waitForTimeout(500);

  // Enter at the far corner, the furthest the crosshair can be from the centre
  // while still inside the target.
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3);
  await page.waitForTimeout(50);

  // Assigning the centre directly on acquire put it here in one frame, which
  // read as a jump. Immediately after entering it must still be short.
  const inFlight = await translation(page);
  const travelled = Math.hypot(inFlight.x - centre.x, inFlight.y - centre.y);
  expect(travelled).toBeGreaterThan(4);
});
