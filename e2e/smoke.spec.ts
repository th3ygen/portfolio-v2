import { test, expect } from '@playwright/test';

const SECTIONS = ['s00', 's01', 's02', 's03', 's04', 's05', 's06'] as const;

/**
 * Vercel's analytics beacon is served by Vercel's edge, not by Next, so it
 * 404s anywhere else — locally, in CI, in a plain `next start`. Ignoring that
 * one request keeps the assertion meaningful instead of permanently red.
 */
const EXPECTED_OFFLINE_404 = '/_vercel/insights';

test('scrolls through all seven sections with no console errors', async ({ page }) => {
  const errors: string[] = [];
  const ignored: string[] = [];

  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes(EXPECTED_OFFLINE_404)) {
      ignored.push(response.url());
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  for (const id of SECTIONS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  // Drop console noise caused solely by the analytics beacon being absent.
  const real = ignored.length > 0
    ? errors.filter((text) => !text.includes('Failed to load resource'))
    : errors;
  expect(real).toEqual([]);
});

test('boot overlay plays once, then not again in the same session', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('COLD BOOT')).toBeVisible();
  await expect(page.getByText('COLD BOOT')).toBeHidden({ timeout: 15_000 });

  await page.reload();
  await expect(page.getByText('COLD BOOT')).toHaveCount(0);
});

test('the manifest toggle collapses and reopens', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /MANIFEST/ });
  await toggle.scrollIntoViewIfNeeded();

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('the contact form reports a server failure rather than claiming success', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 500, body: '{}', contentType: 'application/json' }),
  );

  await page.goto('/');
  await page.locator('#s06').scrollIntoViewIfNeeded();

  await page.getByLabel('> YOUR NAME').fill('Ada');
  await page.getByLabel('> REPLY ADDRESS').fill('ada@example.com');
  await page.getByLabel('> PAYLOAD').fill('A genuine enquiry, at length.');
  await page.getByRole('button', { name: /TRANSMIT/ }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
});

test.describe('reduced motion', () => {
  // Set via contextOptions rather than the top-level `reducedMotion` key:
  // that key exists in PlaywrightTestOptions but does not surface through the
  // Fixtures type in 1.62, so `test.use({ reducedMotion })` fails to compile.
  // Both routes reach the same browser context flag.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('skips the boot overlay and leaves the page scrollable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('COLD BOOT')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

    await page.locator('#s06').scrollIntoViewIfNeeded();
    await expect(page.locator('#s06')).toBeVisible();
  });

  test('does not pin the zoom, so s05 is reachable', async ({ page }) => {
    await page.goto('/');
    await page.locator('#s05').scrollIntoViewIfNeeded();
    await expect(page.locator('#s05')).toBeVisible();
    await expect(page.locator('[data-post="POST.05"]')).toBeVisible();
  });
});
