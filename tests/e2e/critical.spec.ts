import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage offers three task paths and theme switch', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.home-task-entry')).toHaveCount(3);

  await page.locator('.home-task-entry').nth(0).click();
  await expect(page).toHaveURL(/\/majors\/compare$/);
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
    return { card: cardBox, badge: rect(badge), kicker: rect(kicker), footer: rect(footer), footerChildren: Array.from(footer.children).map(rect) };
  });

  expect(geometry.badge.width).toBeGreaterThanOrEqual(48);
  expect(geometry.badge.height).toBeLessThanOrEqual(32);
  expect(geometry.kicker.right).toBeLessThanOrEqual(geometry.card.right + 1);
  expect(geometry.footerChildren.every((child) => child.right <= geometry.footer.right + 1)).toBe(true);
});

test('comparison route remains directly readable with query and anchor aliases', async ({ page, request }) => {
  const redirect = await request.get('/majors/compare?view=dual', { maxRedirects: 0 });
  expect(redirect.status()).toBe(200);
  await page.goto('/majors/compare?view=dual#dual-lens');
  await expect(page).toHaveURL(/\/majors\/compare\?view=dual#dual-lens$/);
  await expect(page.locator('#dual-lens')).toBeVisible();
});

test('capability intent path reaches a related project or scenario', async ({ page }) => {
  await page.goto('/capabilities');
  const capabilityLink = page.locator('.capability-card h3 a').first();
  await expect(capabilityLink).toHaveAttribute('href', /\/capabilities\//);
  await capabilityLink.click();
  await expect(page).toHaveURL(/\/capabilities\/[^/]+$/);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.locator('a[href^="/projects/"], a[href^="/scenarios/"]').count()).toBeGreaterThan(0);
});

test('legacy project URLs remain readable without P0 filter controls', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('select')).toHaveCount(0);

  await page.goto('/projects?major=missing-major');
  await expect(page.locator('.project-list-card')).toHaveCount(3);
  await expect(page.locator('.invalid-condition-message')).toBeVisible();

  await page.goto('/projects?major=major-ime&duration=invalid-duration');
  await expect(page.locator('.condition-pill')).toHaveCount(1);
  await expect(page.locator('.invalid-condition-message')).toBeVisible();

  await page.goto('/projects?major=major-bme&duration=10%20%E5%88%86%E9%92%9F');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.locator('.empty-state a').click();
  await expect(page).toHaveURL(/\/projects#project-list$/);
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

test('dual cards stay inside the viewport across the responsive matrix', async ({ page }) => {
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/majors');
    const result = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.dual-card')).filter((card) => card.getBoundingClientRect().width > 0);
      const overflowAncestors: string[] = [];
      for (const card of cards) for (let node: HTMLElement | null = card; node; node = node.parentElement) {
        const overflowX = getComputedStyle(node).overflowX;
        if (overflowX === 'hidden' || overflowX === 'clip') overflowAncestors.push(`${node.tagName}.${node.className}`);
      }
      const horizontalScrollers = Array.from(document.querySelectorAll<HTMLElement>('*')).filter((node) => node.scrollWidth > node.clientWidth + 1 && ['auto', 'scroll'].includes(getComputedStyle(node).overflowX)).map((node) => node.className || node.tagName);
      return { viewport, documentWidth: document.documentElement.scrollWidth, cards: cards.map((card) => { const rect = card.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width }; }), overflowAncestors, horizontalScrollers };
    });
    expect(result.documentWidth, `document overflows at ${width}px`).toBeLessThanOrEqual(result.viewport + 1);
    expect(result.cards.length).toBe(2);
    for (const card of result.cards) {
      expect(card.width, `card has no width at ${width}px`).toBeGreaterThan(0);
      expect(card.left, `card starts outside viewport at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(card.right, `card ends outside viewport at ${width}px`).toBeLessThanOrEqual(result.viewport + 1);
    }
    expect(result.overflowAncestors, `dual-card ancestor clips at ${width}px`).toEqual([]);
    expect(result.horizontalScrollers.every((selector) => selector === 'comparison-table-wrap'), `unexpected horizontal scroller at ${width}px`).toBe(true);
  }
});

test('forced colors and reduced motion preserve the primary task surface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.home-task-entry')).toHaveCount(3);
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport);
});

test('keyboard focus, 200% zoom and reduced motion remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  const result = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
  expect(result.scrollWidth).toBeLessThanOrEqual(result.width + 1);
  expect(result.scrollBehavior).toBe('auto');
});

test('homepage stays within a bounded reading height', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844, multiplier: 12 }, { width: 768, height: 1024, multiplier: 10 }, { width: 1440, height: 900, multiplier: 8 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const pageHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    expect(pageHeight, `${viewport.width}px homepage height`).toBeLessThanOrEqual(viewport.height * viewport.multiplier);
  }
});

test('FAQ, starter, resources and 404 remain usable', async ({ page }) => {
  await page.goto('/majors/faq');
  await expect(page.locator('.faq-item')).toHaveCount(6);
  await page.locator('.faq-item').nth(1).locator('summary').click();
  await expect(page.locator('.faq-item').nth(1)).toHaveAttribute('open', '');
  await page.goto('/majors/faq#shared-foundation');
  await expect(page.locator('#shared-foundation')).toBeVisible();
  await page.goto('/projects/signal-feature-notebook/starter');
  await expect(page.locator('textarea')).toHaveCount(3);
  await page.goto('/projects/signal-feature-notebook/resources');
  await expect(page.locator('text=primaryResourceId')).toBeVisible();
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('critical and serious axe violations are absent on key pages', async ({ page }) => {
  for (const path of ['/', '/projects', '/majors', '/capabilities', '/scenarios', '/sources']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const blockers = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
    expect(blockers, `${path}: ${JSON.stringify(blockers)}`).toEqual([]);
  }
});
