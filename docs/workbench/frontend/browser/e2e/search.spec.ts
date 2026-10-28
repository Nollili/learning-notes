// e2e/search.spec.ts
import { test, expect } from '@playwright/test';
test.describe('HTML baseline', () => {
  test.use({ javaScriptEnabled: false });
  test('keyboard GET form works without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Search notes' }).fill('cancellation');
    await page.getByRole('textbox', { name: 'Search notes' }).press('Enter');
    await expect(page).toHaveURL(/\/search\?q=cancellation$/);
    await expect(page.getByRole('link', { name: 'Request cancellation' })).toBeVisible();
  });
});
test('enhanced keyboard result and narrow layout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Search notes' }).fill('layers');
  await page.getByRole('textbox', { name: 'Search notes' }).press('Enter');
  await expect(page.getByRole('status')).toHaveText('1 result');
  await expect(page.getByRole('link', { name: 'CSS layers' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('JSON failure retains input and offers regular HTML', async ({ page }) => {
  await page.route('**/api/search?*', route => route.abort());
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Search notes' });
  await input.fill('layers'); await input.press('Enter');
  await expect(input).toHaveValue('layers');
  const fallback = page.getByRole('link', { name: 'Open regular results' });
  await expect(fallback).toBeVisible(); await fallback.click();
  await expect(page).toHaveURL(/\/search\?q=layers$/);
  await expect(page.getByRole('link', { name: 'CSS layers' })).toBeVisible();
});
test('reviewed visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page).toHaveScreenshot('search-320.png', { fullPage: true });
});
