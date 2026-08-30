import { expect, test, type Page } from '@playwright/test';

async function sectionTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const section = document.querySelector('#s01');
    if (!section) throw new Error('#s01 missing');
    return section.getBoundingClientRect().top + window.scrollY;
  });
}

/** Viewports of scroll the title beats are spread across (RUNWAY_VH / 100). */
const RUNWAY_VIEWPORTS = 3;
const VIEWPORT_H = 720;

/**
 * Scroll to a fraction of the title runway, 0 to 1.
 *
 * Expressed as a fraction rather than in viewports on purpose: the runway's
 * length is a design knob and has already changed twice, and every absolute
 * sample point in this file had to be retuned by hand each time.
 */
async function seek(page: Page, top: number, fraction: number) {
  await page.evaluate(
    (y) => window.scrollTo(0, y),
    top + fraction * RUNWAY_VIEWPORTS * VIEWPORT_H,
  );
}

async function stage(page: Page) {
  return page.evaluate(() => {
    const lockup = document.querySelector('[data-title-lockup]');
    const number = document.querySelector('[data-title-suffix]');
    const active = document.querySelector('[data-role-active="true"]');
    if (!lockup || !number) throw new Error('lockup missing');
    const box = lockup.getBoundingClientRect();
    const numberBox = number.getBoundingClientRect();
    const activeBox = active?.getBoundingClientRect();
    return {
      top: Math.round(box.top),
      left: Math.round(box.left),
      right: Math.round(box.right),
      active: active?.textContent ?? 'NONE',
      opacity: Number(getComputedStyle(lockup).opacity),
      numberBottom: Math.round(numberBox.bottom),
      activeBottom: activeBox ? Math.round(activeBox.bottom) : null,
      readout: document.querySelector('[data-title-readout]')?.textContent ?? '',
    };
  });
}

test('the title lockup holds its place while the beats scroll past', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  await seek(page, top, 0);
  await page.waitForTimeout(700);
  const start = await stage(page);

  // position: sticky was inert inside this section — measured, the stage
  // tracked the section's top exactly instead of holding at zero. This is the
  // guard on the ScrollTrigger pin that replaced it.
  await seek(page, top, 0.32);
  await page.waitForTimeout(900);
  const held = await stage(page);

  expect(Math.abs(held.top - start.top)).toBeLessThan(4);
});

test('the column rides through every title and lands on the last', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  await seek(page, top, 0);
  await page.waitForTimeout(700);
  expect((await stage(page)).active).toBe('hello world!');

  const seen = new Set<string>();
  for (let step = 0; step <= 16; step += 1) {
    await seek(page, top, (step / 16) * 0.9);
    await page.waitForTimeout(220);
    seen.add((await stage(page)).active);
  }

  // Exactly one title is solid at any moment, and every title gets its turn.
  expect(seen).toContain('BACKEND');
  expect(seen).toContain('INFRA');
  expect(seen).toContain('FULL-STACK');

  await seek(page, top, 0.86);
  await page.waitForTimeout(1000);
  const done = await stage(page);
  expect(done.active).toBe('FULL-STACK');
});

test('releases its reading at the end instead of fading out', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  await seek(page, top, 0.99);
  await page.waitForTimeout(1200);

  // The lockup used to dim to 5.5%. It stays at full strength now and the last
  // title simply stops being the active one, falling back to the hollow outline
  // every other title already wears.
  const end = await stage(page);
  expect(end.opacity).toBeGreaterThan(0.9);
  await expect(page.locator('[data-role-active="true"]')).toHaveCount(0);
  // The count holds rather than winding back to 00, which read as a fault.
  expect(end.readout).toBe('07/07');
});

test('only one title is solid at a time', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);
  await seek(page, top, 0.28);
  await page.waitForTimeout(900);
  await expect(page.locator('[data-role-active="true"]')).toHaveCount(1);
  await expect(page.locator('[data-role-item]')).toHaveCount(7);
});

test('the dev suffix stays locked to the active title, not the column centre', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);

  // Centring the lockup aligned `dev` to the column's midpoint, which sits
  // rows away from whichever title is solid.
  for (const mark of [0.24, 0.4, 0.52]) {
    await seek(page, top, mark);
    await page.waitForTimeout(800);
    const s = await stage(page);
    expect(Math.abs(s.numberBottom - (s.activeBottom ?? 0)), `at ${mark}`).toBeLessThan(24);
  }
});

test('the readout counts the cycle and cannot disagree with the highlight', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  // Written by the same call that moves the highlight, so a mismatch here means
  // the two have been decoupled.
  // Slot boundaries land at i * (RECEDE / 7) of a five-viewport runway, so each
  // title owns roughly 0.66 of a viewport. These sample the middle of a slot.
  // Fractions of the runway. Slot boundaries land at i / 7 of the cycle, so
  // these sample the middle of the first, fifth and last slots.
  for (const [mark, expected] of [
    [0.06, '01/07'],
    [0.6, '05/07'],
    [0.86, '07/07'],
  ] as const) {
    await seek(page, top, mark);
    await page.waitForTimeout(900);
    expect((await stage(page)).readout, `at ${mark}`).toBe(expected);
  }
});

test('withholds the suffix until the line needs it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  const read = async () =>
    page.evaluate(() => ({
      active: document.querySelector('[data-role-active="true"]')?.textContent ?? '',
      dev: Number(
        getComputedStyle(document.querySelector('[data-title-suffix]') as Element).opacity,
      ),
    }));

  // "hello world! dev" is not a sentence. The suffix has to stay off screen
  // while the column is on a line that stands alone.
  await seek(page, top, 0.06);
  await page.waitForTimeout(900);
  const opening = await read();
  expect(opening.active).toBe('hello world!');
  expect(opening.dev).toBe(0);

  await seek(page, top, 0.2);
  await page.waitForTimeout(900);
  const phrase = await read();
  expect(phrase.active).toBe('im a');
  expect(phrase.dev).toBe(1);
});

test('the active slot stays put while the column rides through it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  const slotTop = async () =>
    page.evaluate(() => {
      const el = document.querySelector('[data-title-slot]');
      if (!el) throw new Error('slot missing');
      return Math.round(el.getBoundingClientRect().top);
    });

  await seek(page, top, 0.18);
  await page.waitForTimeout(800);
  const first = await slotTop();

  await seek(page, top, 0.46);
  await page.waitForTimeout(900);
  // The reading head is static; nesting it inside the column would have it
  // travel with the list it is meant to be reading.
  expect(Math.abs((await slotTop()) - first)).toBeLessThan(4);
});

test('the instrument arrives only after the lockup has centred', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  const probe = async () =>
    page.evaluate(() => {
      const slot = document.querySelector('[data-title-slot]');
      const readout = document.querySelector('[data-title-readout]');
      if (!slot || !readout) throw new Error('slot or readout missing');
      const style = getComputedStyle(slot);
      return {
        spread: Number(style.getPropertyValue('--slot-spread')),
        alpha: Number(style.getPropertyValue('--slot-alpha')),
        readout: Number(getComputedStyle(readout).opacity),
      };
    });

  // Mid-assembly: the instrument reads the lockup, so it has no business being
  // on screen while the lockup is still putting itself together.
  await seek(page, top, 0.06);
  await page.waitForTimeout(900);
  const early = await probe();
  expect(early.alpha).toBe(0);
  expect(early.readout).toBe(0);
  expect(early.spread).toBeGreaterThan(0);

  // Settled: brackets converged onto the slot, readout lit. Sampled well past
  // the entrance — it is timed off the step that reaches `im a`, not off a
  // fixed position, so it lands later than a fixed beat would.
  await seek(page, top, 0.3);
  await page.waitForTimeout(900);
  const settled = await probe();
  expect(settled.spread).toBe(0);
  expect(settled.alpha).toBeGreaterThan(0.3);
  expect(settled.readout).toBe(1);
});

test('gives every title the same slice of scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  // Walk the whole pin in even increments and count how many samples each title
  // is the active one for. That count IS its share of the scroll.
  const SAMPLES = 70;
  const RUNWAY_PX = RUNWAY_VIEWPORTS * VIEWPORT_H;
  const held = new Map<string, number>();
  for (let i = 0; i <= SAMPLES; i += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), top + (i / SAMPLES) * RUNWAY_PX);
    await page.waitForTimeout(70);
    const active = await page.evaluate(
      () => document.querySelector('[data-role-active="true"]')?.textContent ?? '',
    );
    held.set(active, (held.get(active) ?? 0) + 1);
  }

  // Past RECEDE nothing is active, which is a state rather than a title.
  held.delete('');
  const counts = [...held.values()];
  expect(held.size).toBe(7);

  // The earlier shape gave the opening line roughly four times the scroll of a
  // middle title — a long pause, then a flicker. Nothing should be far off the
  // average now.
  const average = counts.reduce((a, b) => a + b, 0) / counts.length;
  for (const [title, count] of held) {
    expect(Math.abs(count - average), `${title} held ${count} vs avg ${average}`).toBeLessThan(
      average * 0.6,
    );
  }
});

test('holds still horizontally once dev has arrived', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 20_000 });
  const top = await sectionTop(page);

  const positions: number[] = [];
  for (const fraction of [0.3, 0.45, 0.6, 0.75, 0.86]) {
    await seek(page, top, fraction);
    await page.waitForTimeout(900);
    positions.push(
      await page.evaluate(() => {
        const suffix = document.querySelector('[data-title-suffix]');
        if (!suffix) throw new Error('suffix missing');
        return Math.round(suffix.getBoundingClientRect().left);
      }),
    );
  }

  // A per-title centring correction made every reading land dead centre, at the
  // cost of sliding the whole row up to ~130px on each switch — motion layered
  // on the column's own travel. The titles align right instead and the row does
  // not move again after `dev` takes its half of the line.
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(2);
});

test('the lockup fits the viewport at its widest title', async ({ page }) => {
  for (const width of [1440, 1280, 375]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
    const top = await sectionTop(page);
    await seek(page, top, 0.48);
    await page.waitForTimeout(900);

    const box = await stage(page);
    expect(box.left, `left at ${width}`).toBeGreaterThanOrEqual(0);
    expect(box.right, `right at ${width}`).toBeLessThanOrEqual(width);

    // Every title is on screen at once, so the column's width is set by the
    // longest of them, and `dev` sits beside the whole block.
    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWidth, `no h-scroll at ${width}`).toBe(width);
  }
});

test('rebuilds the sequence when the viewport crosses the stacking breakpoint', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('[data-boot]')).toHaveCount(0, { timeout: 15_000 });
  const top = await sectionTop(page);
  await seek(page, top, 0.48);
  await page.waitForTimeout(900);
  expect((await stage(page)).right).toBeLessThanOrEqual(1280);

  // The centring offset is measured from the column's width, and the stacked
  // layout makes it zero. Measured once at build time it survived a resize as a
  // number describing a layout that no longer existed; matchMedia tears the
  // sequence down and rebuilds it per breakpoint.
  await page.setViewportSize({ width: 375, height: 720 });
  await page.waitForTimeout(1200);
  const narrow = await stage(page);
  expect(narrow.left, 'left after shrink').toBeGreaterThanOrEqual(0);
  expect(narrow.right, 'right after shrink').toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1200);
  const wide = await stage(page);
  expect(wide.left, 'left after grow').toBeGreaterThanOrEqual(0);
  expect(wide.right, 'right after grow').toBeLessThanOrEqual(1280);
  await expect(page.locator('[data-role-active="true"]')).toHaveCount(1);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('collapses the scroll runway when the beats do not play', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(900);

    const reach = await page.evaluate(() => {
      const section = document.querySelector('#s01');
      const header = document.querySelector('#s01 header');
      if (!section || !header) throw new Error('#s01 header missing');
      return Math.round(
        header.getBoundingClientRect().top - section.getBoundingClientRect().top,
      );
    });

    // The runway exists only to give the pin something to scroll through. With
    // the pin skipped it was 3001px of blank page — more than four viewports —
    // between the section's top and its first content.
    expect(reach).toBeLessThan(900);
  });

  test('shows the title as a readable card, not at backdrop opacity', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(900);
    const opacity = await page.evaluate(() =>
      Number(getComputedStyle(document.querySelector('[data-title-lockup]') as Element).opacity),
    );
    expect(opacity).toBeGreaterThan(0.9);
    await expect(page.locator('[data-role-active="true"]')).toHaveText('FULL-STACK');
  });
});
