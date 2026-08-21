import { expect, test } from '@playwright/test';
import rawEvidence from '../../content/evidence.json';
import { getProjectResourceState } from '../../lib/content/project-resource-state';
import type { EvidenceData, LinkAvailability } from '../../lib/content/schema';

const evidenceData = rawEvidence as EvidenceData;
type LinkStatus = LinkAvailability['status'];

const projectHeadings = '.project-list-card h2';
const coreRoutes = [
  { path: '/', heading: '今天先碰一个小问题。' },
  { path: '/projects', heading: '你今天想先碰哪一种任务？' },
  { path: '/projects/signal-feature-notebook', heading: '从合成信号做出可解释的分类表' },
];

test('首页只有三个动作，项目完整展示不重复', async ({ page }) => {
  await page.goto('/');
  const actions = page.getByRole('navigation', { name: '开始探索' }).getByRole('link');
  await expect(actions).toHaveCount(3);
  await expect(actions).toHaveText([/看两个专业怎么分工/, /Starter 待人工复核/, /我还没想好/]);
  await expect(page.locator('.home-project-teaser, .home-feature-project, .home-compact-project')).toHaveCount(0);
  await expect(page.locator('section').filter({ has: page.getByRole('heading', { name: '三个任务，只保留影响开始的事实' }) }).locator('article')).toHaveCount(3);
});

test('意图只改变顺序，不隐藏三个项目', async ({ page }) => {
  await page.goto('/projects?intent=sensor');
  const headings = page.locator(projectHeadings);
  await expect(headings).toHaveCount(3);
  await expect(headings.first()).toHaveText('传感—采样—告警最小系统');
  await expect(page.getByRole('link', { name: '我想动手接传感器' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.intent-feedback')).toContainText('完整实践约 2 小时');
});

test('旧合法筛选继续工作，未知值不静默清空', async ({ page }) => {
  await page.goto('/projects?major=major-bme');
  await expect(page.getByRole('status')).toContainText('正在使用旧筛选链接');
  await expect(page.locator(projectHeadings)).toHaveCount(2);
  await page.goto('/projects?major=unknown-major');
  await expect(page.getByRole('status')).toContainText('筛选或意图值已经无法识别');
  await expect(page.locator(projectHeadings)).toHaveCount(3);
  await page.goto('/projects?intent=unknown-intent');
  await expect(page.getByRole('status')).toContainText('筛选或意图值已经无法识别');
  await expect(page.locator(projectHeadings)).toHaveCount(3);
});

test('资源状态聚合覆盖主入口、替代入口、待核验和不可用', () => {
  const stateFor = (primary: LinkStatus, alternative: LinkStatus) => getProjectResourceState(
    { endpointIds: ['fixture-primary', 'fixture-alternative'] },
    {
      ...evidenceData,
      endpoints: [
        { id: 'fixture-primary', ownerType: 'project', ownerId: 'fixture-project', role: 'source', required: true, url: 'https://example.com/primary' },
        { id: 'fixture-alternative', ownerType: 'project', ownerId: 'fixture-project', role: 'replacement', required: false, url: 'https://example.com/alternative' },
      ],
      linkAvailability: [
        { endpointId: 'fixture-primary', checkedAt: '2026-08-19', status: primary },
        { endpointId: 'fixture-alternative', checkedAt: '2026-08-19', status: alternative },
      ],
    },
  ).key;

  expect(stateFor('available', 'unavailable')).toBe('ready');
  expect(stateFor('unavailable', 'available')).toBe('alternative');
  expect(stateFor('unverified', 'unavailable')).toBe('unknown');
  expect(stateFor('unavailable', 'unavailable')).toBe('unavailable');
});

test('代表项目以内部 Starter 为主动作并诚实显示待复核', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook');
  const startAction = page.locator('.project-hero-action').getByRole('link').first();
  await expect(startAction).toHaveAttribute('href', '/projects/signal-feature-notebook/starter');
  await expect(page.locator('.project-hero-action')).toContainText('人工待复核');
  await expect(page.locator('.project-hero-action')).toContainText('不标记“可直接开始”');
});

test('skip link 是首个焦点，当前导航使用 aria-current', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  await expect(page.locator('.desktop-nav .nav-link[href="/projects"]')).toHaveAttribute('aria-current', 'page');
});

test('移动菜单为非模态展开区，并支持 Escape 与焦点返回', async ({ page }) => {
  test.skip((await page.viewportSize())?.width !== 390, '只在 390px 项目中运行');
  await page.goto('/projects');
  const menuButton = page.getByRole('button', { name: /菜单/ });
  await menuButton.click();
  const mobileNav = page.locator('#mobile-navigation');
  await expect(mobileNav).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(mobileNav).not.toHaveAttribute('aria-modal', 'true');
  await expect(mobileNav.getByRole('link', { name: '小项目' })).toHaveAttribute('aria-current', 'page');
  await expect(mobileNav.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton).toBeFocused();
});

test('禁用 JavaScript 时三个核心页面仍有正文与链接', async ({ browser, page }) => {
  test.skip((await page.viewportSize())?.width !== 320, '只在 320px 项目中运行');
  const context = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000', javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const noScriptPage = await context.newPage();
  for (const route of coreRoutes) {
    await noScriptPage.goto(route.path);
    await expect(noScriptPage.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(noScriptPage.locator('main a[href]').first()).toBeVisible();
  }
  await context.close();
});

test('320px 三个核心页面没有横向滚动', async ({ page }) => {
  test.skip((await page.viewportSize())?.width !== 320, '只在 320px 项目中运行');
  for (const route of coreRoutes) {
    await page.goto(route.path);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), { message: `${route.path} 不应横向溢出` }).toBe(true);
  }
});
