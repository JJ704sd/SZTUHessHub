import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseSiteData } from '../lib/content/schema';

const dataFile = resolve(process.cwd(), 'content/site-data.json');
const bannedTerms = ['诊断建议', '治疗建议', '就业保证', '排名第一', '保证就业', '包就业', '100%就业', '完全治愈', '治愈', '确诊', '处方', '零风险'];
const errors: string[] = [];

function scanForBannedTerms(value: unknown, path: string[] = []) {
  if (typeof value === 'string') {
    for (const term of bannedTerms) {
      const index = value.indexOf(term);
      if (index < 0) continue;
      const context = value.slice(Math.max(0, index - 10), index);
      if (!/(?:不|非|不能|不得|禁止|无|未)[^。；;:：]{0,14}$/.test(context)) errors.push(`${path.join('.')} 包含禁止词“${term}”`);
    }
    return;
  }
  if (Array.isArray(value)) value.forEach((item, index) => scanForBannedTerms(item, [...path, String(index)]));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => scanForBannedTerms(item, [...path, key]));
}

let data: ReturnType<typeof parseSiteData>;
try {
  data = parseSiteData(JSON.parse(readFileSync(dataFile, 'utf8')));
} catch (error) {
  console.error('Content validation failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const slugs = new Set<string>();
for (const collection of [data.majors, data.dualLensCases, data.capabilities, data.projects, data.scenarios, data.faqs]) {
  for (const item of collection) {
    if (slugs.has(item.slug)) errors.push(`slug 重复：${item.slug}`);
    slugs.add(item.slug);
  }
}
for (const asset of data.mediaAssets) {
  if (!existsSync(resolve(process.cwd(), 'public', asset.src.slice(1)))) errors.push(`媒体文件不存在：${asset.src}`);
}
scanForBannedTerms(data);

console.log('Content validation statistics:');
console.log(`  majors: ${data.majors.length} (minimum 2)`);
console.log(`  dualLensCases: ${data.dualLensCases.length} (minimum 2)`);
console.log(`  capabilities: ${data.capabilities.length} (minimum 8)`);
console.log(`  projects: ${data.projects.length} (minimum 3)`);
console.log(`  scenarios: ${data.scenarios.length} (minimum 6)`);
console.log(`  faqs: ${data.faqs.length} (minimum 4)`);
console.log(`  mediaAssets: ${data.mediaAssets.length} (minimum 3)`);
if (errors.length > 0) {
  console.error('Content validation failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Content validation passed.');
