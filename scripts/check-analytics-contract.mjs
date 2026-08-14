import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'lib/analytics.ts');
const source = readFileSync(sourcePath, 'utf8');
const failures = [];
const requiredEvents = ['task_area_viewed', 'home_task_select', 'dual_lens_open', 'capability_open', 'next_step_select', 'project_open', 'starter_begin', 'external_resource_open'];

for (const eventName of requiredEvents) {
  if (!source.includes(`name: '${eventName}'`)) failures.push(`事件合同缺少 ${eventName}`);
}
for (const forbiddenToken of ['window.location', 'document.body', 'URLSearchParams', 'localStorage', 'navigator.userAgent']) {
  if (source.includes(forbiddenToken)) failures.push(`事件实现不应读取 ${forbiddenToken}`);
}
if (!source.includes("analyticsEnvironment() === 'production'")) failures.push('生产环境必须显式 no-op');
if (!source.includes('[hseehub:event] ${event.name}')) failures.push('development/preview debug 必须显式输出事件类型');

const moduleUrl = pathToFileURL(sourcePath).href;
const runtimeCode = `
  import { isPrivacySafeEvent, trackEvent } from ${JSON.stringify(moduleUrl)};
  const safe = { name: 'project_open', projectId: 'signal-feature-notebook', source: 'projects' };
  const unsafe = { name: 'project_open', projectId: 'signal-feature-notebook', source: 'projects', url: 'https://example.invalid' };
  if (!isPrivacySafeEvent(safe)) throw new Error('safe event rejected');
  if (isPrivacySafeEvent(unsafe)) throw new Error('unsafe event accepted');
  delete process.env.NEXT_PUBLIC_HSEEHUB_ENV;
  process.env.HSEEHUB_ENV = 'production';
  let scheduled = false;
  globalThis.window = { setTimeout() { scheduled = true; } };
  trackEvent(safe);
  if (scheduled) throw new Error('production event was scheduled');
`;
const runtime = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', runtimeCode], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, NEXT_PUBLIC_HSEEHUB_ENV: 'production' },
});
if (runtime.status !== 0) failures.push(`事件运行时白名单测试失败：${runtime.stderr || runtime.stdout}`.trim());

if (failures.length > 0) {
  console.error('Analytics contract failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Analytics contract passed (event whitelist, privacy guard, production no-op).');
