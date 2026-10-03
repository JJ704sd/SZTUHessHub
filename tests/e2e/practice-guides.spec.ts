import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';
import siteData from '../../content/site-data.json';

// In this Chromium version, a no-JS navigation can leave locator.click's RAF
// check pending if it starts during a smooth anchor scroll. Observe the actual
// position from the test process before using an ordinary, unforced click.
async function clickAfterAnchorScroll(link: Locator) {
  await expect(link).toBeVisible();
  let previousPosition: string | undefined;
  await expect.poll(async () => {
    const box = await link.boundingBox();
    if (!box) return false;
    const position = JSON.stringify(box);
    const stable = previousPosition === position;
    previousPosition = position;
    return stable;
  }).toBe(true);
  await link.click();
}

test('every capability offers a readable short practice and a concrete next project', async ({ page }) => {
  for (const capability of siteData.capabilities) {
    await page.goto(`/capabilities/${capability.slug}`);
    await page.getByRole('link', { name: '先试一份短练习' }).click();
    const practice = page.locator('#capability-practice');
    await expect(practice.getByRole('heading', { level: 2 })).toBeInViewport();
    await expect(practice.getByRole('heading', { name: '从这些材料开始' })).toBeVisible();
    await expect(practice.getByRole('heading', { name: '写完以后，自己核对' })).toBeVisible();
    await expect(practice.getByRole('link', { name: '看看这份记录怎样继续整理' })).toHaveAttribute('href', /^\/projects\/[^/]+#project-evidence-example$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('connects a software role to a short practice, a project, and its resume example', async ({ page }) => {
  await page.goto('/pathways/employment#career-role-software');
  await page.locator('#career-role-software').getByRole('link', { name: '打开三步练习' }).click();
  await expect(page).toHaveURL(/\/capabilities\/software-and-information-systems#capability-practice$/);
  await page.getByRole('link', { name: '看看这份记录怎样继续整理' }).click();
  await expect(page).toHaveURL(/\/projects\/sensor-alarm-prototype#project-evidence-example$/);
  await page.getByRole('link', { name: '把这份记录讲给面试官听' }).click();
  await expect(page).toHaveURL(/#career-story-sensor-alarm-prototype$/);
  const story = page.locator('#career-story-sensor-alarm-prototype');
  await story.locator('summary').click();
  await expect(story.getByRole('heading', { name: '实际完成后，可以怎样表达' })).toBeVisible();
  await expect(story.getByRole('heading', { name: '请同学继续追问' })).toBeVisible();
  await story.getByRole('link', { name: '回到项目整理作品' }).click();
  await expect(page.locator('#project-evidence-example')).toBeVisible();
});

test('all three projects provide downloadable worked examples and editable record templates', async ({ page }) => {
  for (const project of siteData.projects) {
    await page.goto(`/projects/${project.slug}#project-evidence-example`);
    const exampleReady = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载填写示例', exact: true }).click();
    const example = await exampleReady;
    expect(await example.failure()).toBeNull();
    expect(example.suggestedFilename()).toMatch(/-evidence-example\.md$/);
    const exampleContent = await readFile((await example.path())!, 'utf8');
    expect(exampleContent).toContain('示例');
    expect(exampleContent).toContain('合成');
    expect(exampleContent.length).toBeGreaterThan(1000);
    const templateReady = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载空白记录模板' }).click();
    const template = await templateReady;
    expect(await template.failure()).toBeNull();
    expect(template.suggestedFilename()).toBe(project.artifactTemplate.href.split('/').pop());
    expect(await readFile((await template.path())!, 'utf8')).toContain('v1.0');
    await expect(page.getByText(project.validation, { exact: true })).toBeVisible();
    await expect(page.getByText(project.stopCondition, { exact: true })).toBeVisible();
  }
});

test('every scenario has a practice entry even without a registered representative project', async ({ page }) => {
  for (const scenario of siteData.scenarios) {
    await page.goto(`/scenarios/${scenario.slug}`);
    const practice = page.getByRole('region', { name: '先选一份小记录，看看方法怎样用。' });
    await expect(practice.getByRole('link')).toHaveCount(2);
    await practice.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/capabilities\/[^/]+#capability-practice$/);
    await expect(page.locator('#capability-practice h2')).toBeInViewport();
  }
});

test('home and resource bookmarks both lead to the complete career guide', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '从作品开始准备求职' }).click();
  await expect(page).toHaveURL(/\/pathways\/employment#career-journey$/);
  await page.goto('/pathways/employment#career-resources');
  await page.getByRole('navigation', { name: '求职准备导航' }).getByRole('link', { name: /看填写示例/ }).click();
  await expect(page.locator('#career-worked-examples h2')).toBeInViewport();
});

test('the new practice-to-application journey supports keyboard navigation without JavaScript', async ({ browser, baseURL, viewport }) => {
  const context = await browser.newContext({ baseURL, viewport, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/scenarios/software-systems');
  await page.locator('#scenario-practice').getByRole('link').first().press('Enter');
  await expect(page.locator('#capability-practice')).toBeVisible();
  await page.getByRole('link', { name: '看看这份记录怎样继续整理' }).press('Enter');
  await expect(page.getByRole('link', { name: '下载填写示例', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '把这份记录讲给面试官听' }).press('Enter');
  const story = page.locator('#career-story-sensor-alarm-prototype');
  await story.locator('summary').press('Enter');
  await expect(story.getByRole('heading', { name: '实际完成后，可以怎样表达' })).toBeVisible();
  await context.close();
});

test('the new practice-to-application journey supports pointer navigation without JavaScript', async ({ browser, baseURL, viewport }) => {
  const context = await browser.newContext({ baseURL, viewport, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/scenarios/software-systems');
  await clickAfterAnchorScroll(page.locator('#scenario-practice').getByRole('link').first());
  await clickAfterAnchorScroll(page.getByRole('link', { name: '看看这份记录怎样继续整理' }));
  await expect(page.getByRole('link', { name: '下载填写示例', exact: true })).toBeVisible();
  await clickAfterAnchorScroll(page.getByRole('link', { name: '把这份记录讲给面试官听' }));
  const story = page.locator('#career-story-sensor-alarm-prototype');
  await clickAfterAnchorScroll(story.locator('summary'));
  await expect(story.getByRole('heading', { name: '实际完成后，可以怎样表达' })).toBeVisible();
  await context.close();
});
