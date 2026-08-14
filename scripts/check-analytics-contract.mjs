import { readFileSync } from 'node:fs';
const source = readFileSync('lib/analytics.ts', 'utf8');
const failures = [];
for (const event of ['task_area_viewed', 'home_task_select', 'dual_lens_open', 'capability_open', 'next_step_select', 'project_open', 'starter_begin', 'external_resource_open']) if (!source.includes(`name: '${event}'`)) failures.push(`事件合同缺少 ${event}`);
for (const token of ['window.location', 'document.body', 'URLSearchParams', 'localStorage', 'navigator.userAgent']) if (source.includes(token)) failures.push(`事件实现不应读取 ${token}`);
if (!source.includes("analyticsEnvironment() === 'production'")) failures.push('生产环境必须 no-op');
if (!source.includes('[hseehub:event] ${event.name}')) failures.push('development/preview 必须输出事件类型');
if (failures.length) { console.error('Analytics contract failed.'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log('Analytics contract passed (event whitelist, privacy guard, production no-op).');
