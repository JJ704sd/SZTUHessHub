import { readFileSync } from 'node:fs';
const origin = (process.env.HSEEHUB_CHECK_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '');
const site = JSON.parse(readFileSync('content/site-data.json', 'utf8'));
const failures = [];
const count = (html, pattern) => (html.match(pattern) ?? []).length;
const page = async (path) => { const response = await fetch(`${origin}${path}`); const html = await response.text(); if (!response.ok) failures.push(`${path} HTTP ${response.status}`); return html; };
const home = await page('/');
if (count(home, /data-home-module=/g) !== 4 || count(home, /class="task-card/g) !== 3) failures.push('首页必须 SSR 输出四模块和三任务');
const compare = await page('/majors/compare');
if (!compare.includes('01 / 共同底座') || !compare.includes('04 / 下一步') || !compare.includes('dual-case-disclosure')) failures.push('对照页缺少固定顺序或 disclosure');
const projects = await page('/projects');
if (count(projects, /class="project-list-card/g) !== site.projects.length || /<select\b/i.test(projects)) failures.push('项目页默认必须全量且无筛选控件');
const first = site.projects[0];
const valid = [['major', first.majorIds[0]], ['capability', first.capabilityIds[0]], ['scenario', first.scenarioIds[0]], ['viewpoint', first.viewpoint], ['duration', first.durationBands[0]]];
for (const [key, value] of valid) { const html = await page(`/projects?${key}=${encodeURIComponent(value)}`); if (!html.includes('已应用的条件') || !html.includes('清除全部')) failures.push(`旧参数 ${key} 缺少可见摘要`); }
const invalid = await page('/projects?major=invalid-runtime-major');
if (count(invalid, /class="project-list-card/g) !== site.projects.length || !invalid.includes('已忽略无效旧链接条件')) failures.push('无效旧参数必须非阻断');
const mixed = await page(`/projects?major=${encodeURIComponent(first.majorIds[0])}&duration=invalid-runtime-duration`);
if (!mixed.includes('已应用的条件') || !mixed.includes('已忽略无效旧链接条件')) failures.push('混合旧参数必须保留有效条件并提示无效项');
const starter = await page('/projects/signal-feature-notebook/starter');
if (!starter.includes('新浏览器、无账号、零安装') || count(starter, /<textarea\b/g) !== 3) failures.push('starter SSR 合同不完整');
const resources = await page('/projects/signal-feature-notebook/resources');
if (!resources.includes('primaryResourceId') || !resources.includes('未登记走通时间')) failures.push('资源页缺少 primary/人工双状态');
const sources = await page('/sources');
if (count(sources, /class="claim-row/g) !== 5) failures.push('来源页缺少五条 claim 登记');
if (failures.length) { console.error(`Runtime acceptance failed (${origin}).`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Runtime acceptance passed (${origin}; home/compare/projects/starter/resources/sources).`);
