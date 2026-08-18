import { test, expect } from '@playwright/test';

const navigation = ['专业与课程', '做个项目', '能力地图', '选下一步'];

test('首页从任务启动台进入一个具体项目', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('今天想先弄明白什么？');
  await expect(page.getByRole('navigation', { name: '开始探索' })).toContainText('看懂两个专业');
  await expect(page.getByRole('navigation', { name: '开始探索' })).toContainText('挑一个小项目');
  await expect(page.getByRole('navigation', { name: '开始探索' })).toContainText('我还没想好');
  await expect(page.getByLabel('今天想先弄明白什么？').getByRole('heading', { name: '从合成信号做出可解释的分类表' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '挑一个小项目，先看能留下什么' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '同一份小成果，可以换三种说法' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '先回答会影响下一步的问题' })).toBeVisible();
});

test('一级导航只有四项且旧入口仍可到达', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.desktop-nav .nav-link');
  await expect(links).toHaveCount(4);
  for (const label of navigation) await expect(links.filter({ hasText: label })).toHaveCount(1);

  await page.goto('/pathways');
  await expect(page.getByRole('heading', { name: '你可能在想的几条路' })).toBeVisible();
  await expect(page.getByText('平常在做什么')).toHaveCount(5);
});

test('项目详情保留最小闭环字段', async ({ page }) => {
  await page.goto('/projects/signal-feature-notebook');
  await expect(page.getByRole('heading', { name: '从合成信号做出可解释的分类表' })).toBeVisible();
  for (const label of [/开始条件/, /步骤/, /停止条件/, /产物模板/, /数据许可/, /风险边界/]) {
    await expect(page.getByText(label).first()).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: /下一步：/ })).toBeVisible();
  await expect(page.getByText('主入口', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('替代入口', { exact: true }).first()).toBeVisible();
});

test('移动菜单支持打开、Escape 和焦点返回', async ({ page }) => {
  test.skip((await page.viewportSize())?.width !== 390, '只在 390px 项目中运行');
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: /菜单/ });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  const mobileNav = page.getByRole('navigation', { name: '移动端主导航' });
  await expect(mobileNav).toBeVisible();
  const links = mobileNav.getByRole('link');
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(links.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton).toBeFocused();
});

test('窄屏没有横向溢出，核心内容不依赖脚本', async ({ page, browser }) => {
  test.skip((await page.viewportSize())?.width !== 320, '只在 320px 项目中运行');
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  const noScriptContext = await browser.newContext({ baseURL: 'http://127.0.0.1:3000', javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('/');
  await expect(noScriptPage.locator('h1')).toHaveText('今天想先弄明白什么？');
  await expect(noScriptPage.getByLabel('今天想先弄明白什么？').getByRole('heading', { name: '从合成信号做出可解释的分类表' })).toBeVisible();
  await noScriptContext.close();
});

test('等效 200% 缩放时主要内容仍可读', async ({ page }) => {
  test.skip((await page.viewportSize())?.width !== 320, '只在 320px 项目中运行');
  await page.setViewportSize({ width: 160, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('今天想先弄明白什么？');
  await expect(page.getByRole('heading', { name: '从合成信号做出可解释的分类表' }).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
