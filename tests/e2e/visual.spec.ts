import { test, expect } from '@playwright/test';

test('首页首屏视觉基线', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-viewport.png', { fullPage: false });
});

test('项目详情视觉基线', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook');
  await expect(page).toHaveScreenshot('project-signal-viewport.png', { fullPage: false });
});

test('路径总览视觉基线', async ({ page }) => {
  await page.goto('/pathways');
  await expect(page).toHaveScreenshot('pathways-viewport.png', { fullPage: false });
});
