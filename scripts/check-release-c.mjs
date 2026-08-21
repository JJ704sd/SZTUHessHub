import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const errors = [];
const requireText = (path, text) => { if (!read(path).includes(text)) errors.push(`${path} 缺少：${text}`); };
const forbidText = (path, text) => { if (read(path).includes(text)) errors.push(`${path} 不应包含：${text}`); };

for (const path of ['app/community', 'app/field', 'app/contribute', 'content/field-notes.json']) {
  if (existsSync(join(root, path))) errors.push(`Release C 禁止新增 ${path}`);
}
const pkg = JSON.parse(read('package.json'));
if (pkg.scripts?.lighthouse !== pkg.scripts?.['perf:ci']) errors.push('lighthouse 与 perf:ci 必须使用同一门禁实现');
if (!pkg.scripts?.['check:release-c']?.includes('npm run perf:ci')) errors.push('check:release-c 必须包含 perf:ci');
for (const dependency of ['@mui/material', 'chart.js', 'recharts', 'prisma', 'mongoose']) {
  if (pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]) errors.push(`禁止依赖：${dependency}`);
}
requireText('content/site-data.json', '"composition"');
requireText('lib/content/view-models.ts', 'homeActions');
requireText('components/content/home-sections.tsx', 'model.homeActions');
requireText('components/content/home-sections.tsx', 'project.primaryAction.href');
forbidText('components/content/home-sections.tsx', '/projects/signal-feature-notebook/starter');
requireText('components/starter-worksheet.tsx', '下载 Markdown 记录');
requireText('components/starter-worksheet.tsx', '不上传、不写入 localStorage');
requireText('app/projects/[projectSlug]/page.tsx', 'Starter 待人工复核');
requireText('tests/e2e/visual.spec.ts', "id: 'starter'");
requireText('tests/e2e/visual.spec.ts', 'home-release-c-');
requireText('.github/workflows/quality.yml', 'timeout-minutes: 5');
requireText('.github/workflows/quality.yml', 'npm run test:e2e');
requireText('.github/workflows/quality.yml', 'npm run test:a11y');
requireText('.github/workflows/quality.yml', 'npm run perf:ci');
requireText('.github/workflows/quality.yml', "LIGHTHOUSE_REQUIRE_SEO: 'true'");
requireText('scripts/lighthouse-mobile.mjs', 'artifacts/perf-ci.json');
forbidText('.github/workflows/quality.yml', 'npm run e2e:playwright');
for (const path of ['docs/release-c-validation/owner-signoff.md', 'docs/release-c-validation/student-test-record.md', 'docs/release-c-validation/accessibility-walkthrough.md', 'docs/release-c-validation/release-rollback.md', 'docs/release-c-validation/acceptance-status.md']) {
  if (!existsSync(join(root, path))) errors.push(`缺少外部验收模板：${path}`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Release C engineering contract passed (scope, Starter, homepage, visual and blocked-evidence templates).');
