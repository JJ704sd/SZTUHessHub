import { expect, test } from '@playwright/test';

test('首页主动作遵守 Starter 状态并回退到项目说明', async ({ page }) => {
  await page.goto('/');
  const launch = page.getByRole('navigation', { name: '开始探索' });
  await expect(launch.getByRole('link')).toHaveCount(3);
  const primary = launch.getByRole('link', { name: /Starter 待人工复核/ });
  await expect(primary).toHaveAttribute('href', '/projects/signal-feature-notebook');
  await expect(primary).toHaveAttribute('data-home-action-status', 'pending');
  await expect(primary).toHaveAttribute('data-home-action-direct-start', 'false');
  await expect(primary).toHaveAttribute('data-home-action-fallback', '/projects/signal-feature-notebook');
  await expect(primary).toBeInViewport();
  const representativeProject = page.locator('[data-home-project-entry]').first();
  await expect(representativeProject.getByRole('link')).toHaveAttribute('href', '/projects/signal-feature-notebook');
  await expect(representativeProject.getByRole('link')).toContainText('先看 Starter 状态');
});

test('项目详情以内置 Starter 为首要动作并分开显示三维状态', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook');
  const actions = page.locator('.project-hero-action');
  await expect(actions.getByRole('link').first()).toHaveAttribute('href', '/projects/signal-feature-notebook/starter');
  await expect(actions).toContainText('机器可达');
  await expect(actions).toContainText('人工待复核');
  await expect(actions).toContainText(/新鲜度/);
  await expect(actions.getByRole('link', { name: /PhysioNet/ })).toHaveAttribute('target', '_blank');
});

test('Starter 三行填写后可下载 Markdown 且刷新不会持久化自由文本', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook/starter');
  const textareas = page.locator('textarea');
  await textareas.nth(0).fill('看到周期起伏');
  await textareas.nth(1).fill('中段幅度变大');
  await textareas.nth(2).fill('不能外推为医学结论');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 Markdown 记录' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^signal-feature-starter-\d{4}-\d{2}-\d{2}\.md$/);
  expect(await download.failure()).toBeNull();
  await expect(page.getByRole('status')).toContainText('记录已下载到本机');

  await page.reload();
  await expect(textareas.nth(0)).toHaveValue('');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes('starter')))).toEqual([]);
});

test('非代表项目不显示 Starter 入口', async ({ page }) => {
  await page.goto('/projects/sensor-alarm-prototype');
  await expect(page.getByRole('link', { name: /Starter/ })).toHaveCount(0);
});

test('首页满足移动与桌面高度预算且 320px 无横向溢出', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844, maxHeight: 4400 }, { width: 1440, height: 900, maxHeight: 3000 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const size = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(size.height, `${viewport.width}px height`).toBeLessThanOrEqual(viewport.maxHeight);
    expect(size.width, `${viewport.width}px overflow`).toBeLessThanOrEqual(size.viewport + 1);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
});
