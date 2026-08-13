import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage offers three task paths and theme switch', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.task-card')).toHaveCount(3);

  await page.locator('.task-card').nth(0).click();
  await expect(page).toHaveURL(/\/majors\/compare$/);
  await page.goBack();

  await page.locator('.theme-switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('comparison exposes navigable professional relations', async ({ page }) => {
  await page.goto('/majors/compare');
  await expect(page.locator('a[href="/majors/intelligent-medical-engineering"]')).toHaveCount(2);
  await expect(page.locator('a[href="/majors/biomedical-engineering"]')).toHaveCount(2);
});

test('project filters preserve URL state and recover from no results', async ({ page }) => {
  await page.goto('/projects');
  const duration = await page.locator('#filter-duration option:not([value="all"])').first().getAttribute('value');
  expect(duration).toBeTruthy();
  await page.locator('#filter-duration').selectOption(duration as string);
  await expect(page).toHaveURL(/duration=/);

  await page.goto('/projects?major=missing-major');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.locator('.empty-state button').click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('.project-list-card')).toHaveCount(3);
});

test('mobile navigation supports focus entry and Escape return', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.locator('.menu-button');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-navigation a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
});

test('FAQ and 404 remain usable', async ({ page }) => {
  await page.goto('/majors/faq');
  await expect(page.locator('.faq-item')).toHaveCount(6);
  await page.locator('.faq-item').nth(1).locator('summary').click();
  await expect(page.locator('.faq-item').nth(1)).toHaveAttribute('open', '');

  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('critical and serious axe violations are absent on key pages', async ({ page }) => {
  for (const path of ['/', '/projects', '/majors/compare', '/capabilities', '/scenarios']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const blockers = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
    expect(blockers, `${path}: ${JSON.stringify(blockers)}`).toEqual([]);
  }
});
