import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const environment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const site = readJson('content/site-data.json');
const claims = readJson('content/claims.json');
const manifest = readJson('content/resources/signal-feature-notebook.json');
const failures = [];

function fail(message) { failures.push(message); }
function date(value) { const parsed = value ? new Date(`${value}T00:00:00Z`) : null; return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null; }
function fresh(value, maxAgeDays) { const parsed = date(value); return Boolean(parsed && Date.now() - parsed.getTime() >= 0 && Date.now() - parsed.getTime() <= maxAgeDays * 24 * 60 * 60 * 1000); }

if (environment !== 'production') fail(`production release gate 必须显式使用 HSEEHUB_ENV=production（当前：${environment}）`);
if (!process.env.HSEEHUB_RELEASE_ID) fail('缺少不可变 HSEEHUB_RELEASE_ID');

for (const claim of claims) {
  if (claim.reviewStatus !== 'reviewed' || !date(claim.reviewedAt) || !claim.reviewedBy || claim.ownerId.includes('pending')) {
    fail(`claim ${claim.id} 尚未完成 owner/reviewedAt/reviewedBy 复核`);
  }
}

const project = site.projects.find((item) => item.id === manifest.projectId);
const primary = manifest.resources.find((resource) => resource.id === manifest.primaryResourceId);
if (!project || project.primaryResourceId !== manifest.primaryResourceId) fail('项目 primaryResourceId 与资源 manifest 不一致');
if (!primary) fail('primaryResourceId 找不到对应资源');
else {
  if (primary.kind !== 'starter') fail('primary resource 必须是 starter');
  if (primary.availability !== 'reachable' || !primary.lastAutomatedCheckAt || !primary.lastSuccessfulAt) fail('primary starter 未通过机器可达性与最近成功检查');
  if (primary.reviewStatus !== 'verified' || !primary.lastHumanWalkthroughAt || !fresh(primary.lastHumanWalkthroughAt, 30) || !primary.reviewedBy || !primary.walkthroughEvidence) fail('primary starter 未完成 30 天内人工走通记录');
  if (primary.ownerId.includes('pending')) fail('primary starter owner 尚未确认');
  if (!primary.license || primary.license.includes('NOASSERTION')) fail('primary starter license 尚未确认');
  if (!primary.licenseEvidenceUrl) fail('primary starter 缺少 license evidence URL');
}

if (failures.length > 0) {
  console.error('Production release gate blocked.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Production release gate passed (${process.env.HSEEHUB_RELEASE_ID}).`);
