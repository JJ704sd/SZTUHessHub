import { expect, test } from '@playwright/test';

const routeCases = [
  { id: 'home', path: '/', projects: /^(desktop|tablet|mobile|narrow)-/ },
  { id: 'projects', path: '/projects?intent=sensor', projects: /^(desktop|tablet|mobile|narrow)-/ },
  { id: 'project-signal', path: '/projects/signal-feature-notebook', projects: /^(desktop|tablet|mobile|narrow)-/ },
  { id: 'majors-compare', path: '/majors/compare', projects: /^(desktop|mobile)-/ },
  { id: 'pathways', path: '/pathways', projects: /^(desktop|mobile)-/ },
];

for (const route of routeCases) {
  test(`visual ${route.id}`, async ({ page }, testInfo) => {
    test.skip(!route.projects.test(testInfo.project.name), `该路由不属于 ${testInfo.project.name} 的视觉矩阵`);
    await page.goto(route.path);
    await expect(page).toHaveScreenshot(`${route.id}-viewport.png`, { fullPage: false });
    const lightFullPage = testInfo.project.name === 'desktop-light' || testInfo.project.name === 'mobile-light';
    if (route.id === 'home' && lightFullPage) await expect(page).toHaveScreenshot(`${route.id}-full-page.png`, { fullPage: true });
  });
}

test('visual state home mobile menu open', async ({ page }, testInfo) => {
  test.skip(!/^mobile-(light|dark)$/.test(testInfo.project.name), '菜单状态只在 390px 亮暗主题运行');
  await page.goto('/');
  await page.getByRole('button', { name: /菜单/ }).click();
  await expect(page.getByRole('navigation', { name: '移动端主导航' })).toBeVisible();
  await expect(page).toHaveScreenshot('home-menu-open-viewport.png', { fullPage: false });
});
