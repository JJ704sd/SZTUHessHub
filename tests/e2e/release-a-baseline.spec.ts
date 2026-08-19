import { expect, test } from '@playwright/test';

test('未定方向入口从首页到达双路径实验', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('navigation', { name: '开始探索' }).getByRole('link', { name: /我还没想好/ }).click();

  await expect(page).toHaveURL(/\/pathways\/explore$/);
  await expect(page.getByRole('heading', { level: 1, name: '还没想好，也可以先走一小步。' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '不做单选题，先挑两条愿意观察的路' })).toBeVisible();
});

test('双路径实验提供可下载的空白复盘单', async ({ page }) => {
  await page.goto('/pathways/explore');
  const templateLink = page.getByRole('link', { name: '下载空白复盘单' });
  await expect(templateLink).toHaveAttribute('href', '/pathway-review-template.txt');
  await expect(templateLink).toHaveAttribute('download', '');

  const downloadPromise = page.waitForEvent('download');
  await templateLink.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('pathway-review-template.txt');
  expect(await download.failure()).toBeNull();
});

test('sitemap 遵守当前部署环境的发布契约', async ({ request }) => {
  const response = await request.get('/sitemap.xml');

  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  if (process.env.HSEEHUB_ENV === 'production') {
    expect(body).toContain('/pathways/explore</loc>');
    expect(body).toContain('/projects/signal-feature-notebook/starter</loc>');
  } else {
    expect(body).not.toContain('<url>');
  }
});
