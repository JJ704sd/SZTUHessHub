import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const origin = (process.env.HSEEHUB_CHECK_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '');
const site = JSON.parse(readFileSync(resolve(root, 'content/site-data.json'), 'utf8'));
const failures = [];

function fail(message) {
  failures.push(message);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function count(html, className) {
  return [...html.matchAll(/class="([^"]*)"/g)].filter(([, classes]) => classes.split(/\s+/).includes(className)).length;
}

async function page(path) {
  try {
    const response = await fetch(`${origin}${path}`);
    const html = await response.text();
    if (!response.ok) fail(`${path} 返回 HTTP ${response.status}`);
    return html;
  } catch (error) {
    fail(`${path} 请求失败：${error instanceof Error ? error.message : String(error)}`);
    return '';
  }
}

const home = await page('/');
expect(count(home, 'home-module') === 4, '首页 SSR 必须输出四个模块');
expect(count(home, 'task-entry') === 3, '首页 SSR 必须输出三个任务入口');
expect(count(home, 'task-entry-primary') === 1, '首页 SSR 必须只有一个 primary 任务入口');

const compare = await page('/majors/compare');
expect(compare.includes('5 分钟后你能回答'), '对照页 SSR 缺少目标清单');
expect(compare.includes('id="dual-lens"'), '对照页 SSR 缺少同题双解锚点');
expect(count(compare, 'dual-card') === 2, '对照页 SSR 必须保留两个同题双解案例');
const compareOrder = ['01 / 共同底座', '02 / 侧重对照', '03 / 同题双解', '04 / 下一步'].map((text) => compare.indexOf(text));
expect(compareOrder.every((index) => index >= 0) && compareOrder.every((index, position) => position === 0 || index > compareOrder[position - 1]), '对照页顺序必须是共同底座→侧重→同题双解→下一步');

const projects = await page('/projects');
expect(count(projects, 'project-list-card') === site.projects.length, '项目页默认 SSR 必须展示全部三个项目');
expect(!/<select\b/i.test(projects) && !/class="[^"]*filter-panel/.test(projects), 'P0 项目页不得输出筛选控件');

const firstMajorId = site.projects.find((project) => project.majorIds.length > 0)?.majorIds[0];
const firstProject = site.projects[0];
const validLegacyCases = [
  ['major', firstProject?.majorIds[0]],
  ['capability', firstProject?.capabilityIds[0]],
  ['scenario', firstProject?.scenarioIds[0]],
  ['viewpoint', firstProject?.viewpoint],
  ['duration', firstProject?.durationBands[0]],
].filter(([, value]) => value);
for (const [key, value] of validLegacyCases) {
  const legacy = await page(`/projects?${key}=${encodeURIComponent(value)}`);
  expect(count(legacy, 'project-list-card') > 0 && legacy.includes('符合已应用条件') && legacy.includes('清除全部'), `旧项目参数 ${key} 必须保留结果、摘要和清除入口`);
}
expect(validLegacyCases.length === 5, 'runtime acceptance 必须覆盖五类旧项目参数');
if (firstMajorId) {
  const valid = await page(`/projects?major=${encodeURIComponent(firstMajorId)}`);
  expect(count(valid, 'project-list-card') > 0 && valid.includes('符合已应用条件') && valid.includes('清除全部') && valid.includes('移除旧链接条件'), '有效旧项目参数必须保留可用结果、条件摘要和清除入口');
  const mixed = await page(`/projects?major=${encodeURIComponent(firstMajorId)}&duration=${encodeURIComponent('invalid-runtime-duration')}`);
  expect(mixed.includes('已忽略无效旧链接条件') && mixed.includes('已应用的条件'), '混合旧项目参数必须同时显示有效摘要和无效提示');
}

const invalid = await page('/projects?major=invalid-runtime-major');
expect(count(invalid, 'project-list-card') === site.projects.length && invalid.includes('已忽略无效旧链接条件') && invalid.includes('清除全部'), '无效旧项目参数不得改变默认结果，且必须可见提示和清除入口');

const viewpoints = [...new Set(site.projects.map((project) => project.viewpoint))];
let zeroQuery;
for (const major of site.majors) {
  for (const viewpoint of viewpoints) {
    const hasMatch = site.projects.some((project) => project.majorIds.includes(major.id) && project.viewpoint === viewpoint);
    if (!hasMatch) {
      zeroQuery = `/projects?major=${encodeURIComponent(major.id)}&viewpoint=${encodeURIComponent(viewpoint)}`;
      break;
    }
  }
  if (zeroQuery) break;
}
if (zeroQuery) {
  const zero = await page(zeroQuery);
  expect(zero.includes('当前条件没有匹配的体验卡'), '有效但零结果的旧项目参数必须输出零状态');
}

const capabilities = await page('/capabilities');
const capabilityMatch = capabilities.match(/href="(\/capabilities\/[a-z0-9-]+)"/i);
expect(Boolean(capabilityMatch), '能力列表 SSR 必须提供能力详情链接');
if (capabilityMatch) {
  const capabilityDetail = await page(capabilityMatch[1]);
  expect(capabilityDetail.includes('下一步') && (capabilityDetail.includes('href="/projects"') || /href="\/scenarios\//.test(capabilityDetail)), '能力详情 SSR 必须提供相关项目或场景下一步');
}

const starter = await page('/projects/signal-feature-notebook/starter');
expect(starter.includes('新浏览器、无账号、零安装') && starter.includes('2 分钟') && starter.includes('三行观察'), 'starter 核心承诺必须服务端输出');
expect((starter.match(/<textarea\b/g) ?? []).length === 3, 'starter SSR 必须输出三个观察记录字段');

const resources = await page('/projects/signal-feature-notebook/resources');
expect(resources.includes('primaryResourceId') && resources.includes('机器可达性与人工复核分开显示') && resources.includes('未登记走通时间'), '资源页 SSR 必须输出 primary、双状态和人工走通字段');

const sources = await page('/sources');
expect(count(sources, 'claim-row') === 5 && sources.includes('reviewedAt：待登记'), '来源页 SSR 必须输出最小 claim 登记及未复核状态');

if (failures.length > 0) {
  console.error(`Runtime acceptance failed (${origin}).`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Runtime acceptance passed (${origin}; home/compare/projects/capability/starter/resources/sources).`);
