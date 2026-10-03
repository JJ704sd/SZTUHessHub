import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('finds career resources from pathways and follows category anchors', async ({ page }) => {
  await page.goto('/pathways');
  await page.getByRole('link', { name: '找就业与实习资源' }).click();
  await expect(page).toHaveURL(/\/pathways\/employment#career-resources$/);
  const resources = page.getByRole('region', { name: '就业与实习，从这里接着走。' });
  await expect(resources).toBeVisible();
  await page.getByRole('navigation', { name: '就业实习资源分类' }).getByRole('link', { name: /医工方向/ }).click();
  await expect(page).toHaveURL(/#career-medical$/);
  const medical = page.getByRole('region', { name: '医工方向', exact: true });
  await expect(medical.getByRole('heading', { name: '联影校园招聘' })).toBeVisible();
  const officialLink = medical.getByRole('link', { name: '打开资源：联影校园招聘（新窗口）' });
  await expect(officialLink).toHaveAttribute('href', 'https://united-imaging.zhiye.com/campus');
  await expect(officialLink).toHaveAttribute('target', '_blank');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('downloads a usable application worksheet from the career resources', async ({ page }) => {
  await page.goto('/pathways/employment#career-resources');
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载求职准备单' }).click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toBe('career-application-kit.txt');
  expect(await download.failure()).toBeNull();
  const content = await readFile((await download.path())!, 'utf8');
  expect(content).toContain('官方岗位链接');
  expect(content).toContain('团队分工及我实际完成的部分');
  expect(content).toContain('投递与面试记录');
  expect(content).toContain('下一次可验证的改进动作');
});

test('connects role preparation to a real project and back to the same role', async ({ page }) => {
  await page.goto('/pathways/employment');
  const role = page.locator('#career-role-data-ai');
  await role.locator('summary').click();
  await expect(role.getByRole('heading', { name: '试着用自己的作品回答' })).toBeVisible();
  await expect(role.getByRole('heading', { name: '官方岗位样例' })).toBeVisible();
  await role.getByRole('link', { name: '从合成信号做出可解释的分类表', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/signal-feature-notebook$/);
  const connections = page.getByRole('region', { name: '这份作品，可以从哪些工作任务继续了解？' });
  await connections.getByRole('link', { name: /^数据与 AI 算法/ }).click();
  await expect(page).toHaveURL(/\/pathways\/employment#career-role-data-ai$/);
  await expect(role.getByRole('heading', { name: '数据与 AI 算法' })).toBeInViewport();
  await role.locator('a[href^="/capabilities/"]').first().click();
  await expect(page).toHaveURL(/\/capabilities\/[^/]+$/);
  await page.getByRole('region', { name: '这项能力，可以用在哪些工作任务里？' }).getByRole('link', { name: /^数据与 AI 算法/ }).click();
  await expect(page).toHaveURL(/#career-role-data-ai$/);
});

test('follows the five-stage journey and retains the original pathway actions', async ({ page }) => {
  await page.goto('/pathways/employment');
  const journey = page.locator('#career-journey');
  for (const target of ['career-roles', 'career-evidence', 'career-resources', 'career-application', 'career-review']) {
    await journey.locator(`a[href="#${target}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${target}$`));
    await expect(page.locator(`#${target} h2`).first()).toBeInViewport();
  }
  await expect(page.getByRole('heading', { name: '把项目写进简历' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '把实习安排问清楚' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '为一次面试做准备' })).toBeVisible();
  await page.locator('#pathway-actions > summary').click();
  await expect(page.locator('#pathway-actions')).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('keeps the core career guide usable without JavaScript', async ({ browser, baseURL, viewport }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport });
  const page = await context.newPage();
  await page.goto('/pathways/employment');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('就业实习，按自己的节奏来。');
  await expect(page.locator('[id^="career-role-"]')).toHaveCount(4);
  const software = page.locator('#career-role-software');
  await software.locator('summary').click();
  await expect(software.getByRole('heading', { name: '官方岗位样例' })).toBeVisible();
  await expect(software.locator('a[href^="https://careers.sap.com/"]')).toBeVisible();
  await expect(page.getByRole('link', { name: '下载求职准备单' })).toHaveAttribute('href', '/career-application-kit.txt');
  await context.close();
});
