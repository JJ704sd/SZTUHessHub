import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.env.PERF_BASE_URL ?? process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const runs = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const lighthouseCommand = process.env.LIGHTHOUSE_BIN ?? 'lighthouse';
const failures = [];
const samples = [];

function runLighthouse(url, index) {
  const args = [
    url,
    '--output=json',
    '--output-path=stdout',
    '--quiet',
    '--only-categories=performance,accessibility,seo',
    '--preset=perf',
    '--chrome-flags=--headless --disable-gpu --no-sandbox',
  ];
  const result = spawnSync(lighthouseCommand, args, { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw new Error(`找不到 Lighthouse 命令「${lighthouseCommand}」：${result.error.message}`);
  if (result.status !== 0) throw new Error(`Lighthouse 第 ${index + 1} 次运行失败：${result.stderr || result.stdout}`);
  const start = result.stdout.indexOf('{');
  const end = result.stdout.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(`Lighthouse 第 ${index + 1} 次没有返回 JSON 报告`);
  const report = JSON.parse(result.stdout.slice(start, end + 1));
  const score = (id) => Math.round((report.categories?.[id]?.score ?? 0) * 100);
  return { run: index + 1, url, performance: score('performance'), accessibility: score('accessibility'), seo: score('seo') };
}

try {
  if (!Number.isInteger(runs) || runs < 3) throw new Error('LIGHTHOUSE_RUNS 必须至少为 3，才能计算移动端中位数。');
  for (let index = 0; index < runs; index += 1) samples.push(runLighthouse(new URL('/', baseUrl).href, index));
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const medians = samples.length === runs ? {
  performance: median(samples.map((sample) => sample.performance)),
  accessibility: median(samples.map((sample) => sample.accessibility)),
  seo: median(samples.map((sample) => sample.seo)),
} : null;

if (medians && (medians.performance < 90 || medians.accessibility < 95 || medians.seo < 95)) {
  failures.push(`Lighthouse 移动端中位数未达标：Performance ${medians.performance}、Accessibility ${medians.accessibility}、SEO ${medians.seo}。`);
}

mkdirSync(resolve('artifacts'), { recursive: true });
writeFileSync(resolve('artifacts/perf-ci.json'), JSON.stringify({ baseUrl, runs, samples, medians, failures, checkedAt: new Date().toISOString() }, null, 2));

if (failures.length) {
  console.error('Performance gate failed or is blocked.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Performance gate passed (${runs} Lighthouse runs; median ${JSON.stringify(medians)}).`);
