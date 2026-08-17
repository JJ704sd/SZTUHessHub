import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage offers three task paths and theme switch', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.task-card')).toHaveCount(3);

  await page.locator('.task-card').nth(0).click();
  await expect(page).toHaveURL(/\/majors$/);
  await page.goBack();

  await page.locator('.theme-switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('comparison exposes navigable professional relations', async ({ page }) => {
  await page.goto('/majors');
  await expect(page.locator('a[href="/majors/intelligent-medical-engineering"]')).toHaveCount(3);
  await expect(page.locator('a[href="/majors/biomedical-engineering"]')).toHaveCount(3);
});

test('comparison cards keep labels and footer actions within the card', async ({ page }) => {
  await page.setViewportSize({ width: 1342, height: 900 });
  await page.goto('/majors');
  const geometry = await page.locator('.dual-card').first().evaluate((card) => {
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height, right: box.right };
    };
    const cardBox = rect(card);
    const badge = card.querySelector('.card-topline .badge');
    const kicker = card.querySelector('.card-kicker');
    const footer = card.querySelector('.dual-footer');
    if (!badge || !kicker || !footer) throw new Error('comparison card layout nodes are missing');
    return {
      card: cardBox,
      badge: rect(badge),
      kicker: rect(kicker),
      footer: rect(footer),
      footerChildren: Array.from(footer.children).map(rect),
    };
  });

  expect(geometry.badge.width).toBeGreaterThanOrEqual(48);
  expect(geometry.badge.height).toBeLessThanOrEqual(32);
  expect(geometry.kicker.right).toBeLessThanOrEqual(geometry.card.right + 1);
  expect(geometry.footerChildren.every((child) => child.right <= geometry.footer.right + 1)).toBe(true);
});

test('legacy comparison route redirects canonically and preserves query plus anchor aliases', async ({ page, request }) => {
  const redirect = await request.get('/majors/compare?view=dual', { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe('/majors?view=dual');
  await page.goto('/majors/compare?view=dual#dual-lens');
  await expect(page).toHaveURL(/\/majors\?view=dual#dual-lens$/);
  await expect(page.locator('#dual-lens')).toBeVisible();
});

test('project filters preserve URL state and recover from no results', async ({ page }) => {
  await page.goto('/projects');
  const duration = await page.locator('#filter-duration option:not([value="all"])').first().getAttribute('value');
  expect(duration).toBeTruthy();
  await page.locator('#filter-duration').selectOption(duration as string);
  await expect(page).toHaveURL(/duration=/);
  await page.locator('#filter-duration').selectOption('all');
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await expect(page.locator('#filter-duration')).toHaveValue(duration as string);
  await page.goForward();
  await expect(page.locator('#filter-duration')).toHaveValue('all');

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

test('forced colors and reduced motion preserve the primary task surface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.task-card')).toHaveCount(3);
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport);
});

test('homepage stays within the Phase 1.6 height budget', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844, multiplier: 6 }, { width: 768, height: 1024, multiplier: 6 }, { width: 1440, height: 900, multiplier: 4 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const pageHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    expect(pageHeight, `${viewport.width}px homepage height`).toBeLessThanOrEqual(viewport.height * viewport.multiplier);
  }
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
  for (const path of ['/', '/projects', '/majors', '/capabilities', '/scenarios']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const blockers = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
    expect(blockers, `${path}: ${JSON.stringify(blockers)}`).toEqual([]);
  }
});
