import { expect, test } from '@playwright/test';

const pages = [
  { id: 'home', path: '/' },
  { id: 'majors', path: '/majors' },
  { id: 'capabilities', path: '/capabilities' },
  { id: 'projects', path: '/projects?intent=sensor' },
  { id: 'project-signal', path: '/projects/signal-feature-notebook' },
  { id: 'starter', path: '/projects/signal-feature-notebook/starter' },
  { id: 'majors-compare', path: '/majors/compare' },
  { id: 'pathways', path: '/pathways' },
] as const;

const viewports = [
  { id: '390x844', width: 390, height: 844 },
  { id: '768x1024', width: 768, height: 1024 },
  { id: '1440x900', width: 1440, height: 900 },
] as const;

for (const pageCase of pages) {
  for (const viewport of viewports) {
    for (const theme of ['light', 'dark'] as const) {
      test(`visual ${pageCase.id} ${viewport.id} ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.addInitScript((selectedTheme) => window.localStorage.setItem('hseehub-theme', selectedTheme), theme);
        await page.goto(pageCase.path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page).toHaveScreenshot(`${pageCase.id}-${viewport.id}-${theme}.png`, { fullPage: true });
      });
    }
  }
}

test('visual state home mobile menu open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.localStorage.setItem('hseehub-theme', 'light'));
  await page.goto('/');
  await page.getByRole('button', { name: /菜单/ }).click();
  await expect(page.getByRole('navigation', { name: '移动端主导航' })).toBeVisible();
  await expect(page).toHaveScreenshot('home-390x844-light-menu-open.png', { fullPage: true });
});

test('project state keeps valid legacy conditions visible', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/projects?major=major-ime');
  await expect(page.getByRole('status')).toContainText('正在使用旧筛选链接');
  await expect(page.locator('.project-list-card')).toHaveCount(2);
});

test('project state recovers invalid legacy conditions to the full catalog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.localStorage.setItem('hseehub-theme', 'dark'));
  await page.goto('/projects?major=missing-major');
  await expect(page.getByRole('status')).toContainText('筛选或意图值已经无法识别');
  await expect(page.locator('.project-list-card')).toHaveCount(3);
});
