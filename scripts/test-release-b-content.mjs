import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const data = JSON.parse(readFileSync(resolve(root, 'content/site-data.json'), 'utf8'));
const viewModelSource = readFileSync(resolve(root, 'lib/content/view-models.ts'), 'utf8');
const failures = [];

function requireAtLeastThreeFaqs(items) {
  if (!Array.isArray(items) || items.length < 3) throw new Error('首页 FAQ 当前内容少于 3 项');
}

try {
  requireAtLeastThreeFaqs(data.faqs);
} catch (error) {
  failures.push(`实际 FAQ 内容不满足 Release B：${error.message}`);
}

try {
  requireAtLeastThreeFaqs(data.faqs.slice(0, 2));
  failures.push('FAQ 少于 3 条时没有触发负向门禁');
} catch (error) {
  if (error.message !== '首页 FAQ 当前内容少于 3 项') failures.push(`FAQ 负向门禁错误不稳定：${error.message}`);
}

if (!/currentFaqs\s*=\s*siteData\.faqs\.filter\(isEditoriallyCurrent\)\.slice\(0,\s*3\)/.test(viewModelSource)) failures.push('getHomePageModel() 必须固定只取 3 条当前 FAQ');
if (!/currentFaqs\.length\s*<\s*3/.test(viewModelSource)) failures.push('getHomePageModel() 必须在当前 FAQ 少于 3 条时失败');

if (failures.length > 0) {
  console.error('Release B content regression failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release B content regression passed (${data.faqs.length} source FAQs, 3-item home contract, negative fixture rejected).`);
