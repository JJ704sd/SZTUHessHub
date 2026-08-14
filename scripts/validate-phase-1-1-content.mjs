import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const site = readJson('content/site-data.json');
const claims = readJson('content/claims.json');
const manifests = [readJson('content/resources/signal-feature-notebook.json')];
const errors = [];
const ids = new Set([...site.majors, ...site.capabilities, ...site.scenarios, ...site.projects, ...site.sources].map((item) => item.id));
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function error(message) { errors.push(message); }
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function validDate(value) { return nonEmpty(value) && datePattern.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()); }
function validUrl(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/')) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

for (const claim of claims) {
  for (const field of ['id', 'claimType', 'sourceId', 'ownerId', 'reviewStatus', 'reviewDueAt']) if (!nonEmpty(claim[field])) error(`claim ${claim.id ?? '(unknown)'} 缺少 ${field}`);
  if (!['official', 'translated', 'example'].includes(claim.claimType)) error(`claim ${claim.id} claimType 无效`);
  if (!['draft', 'reviewed', 'expired'].includes(claim.reviewStatus)) error(`claim ${claim.id} reviewStatus 无效`);
  if (!ids.has(claim.sourceId)) error(`claim ${claim.id} sourceId 不存在：${claim.sourceId}`);
  if (!validDate(claim.reviewDueAt)) error(`claim ${claim.id} reviewDueAt 必须是日期`);
  if (claim.reviewStatus === 'reviewed' && (!validDate(claim.reviewedAt) || !nonEmpty(claim.reviewedBy))) error(`claim ${claim.id} 已 reviewed 但缺少 reviewedAt/reviewedBy`);
}

for (const project of site.projects) {
  if (project.primaryResourceId && (!project.launch || project.launch.primaryResourceId !== project.primaryResourceId || project.launch.maxStartSeconds !== 120 || !nonEmpty(project.launch.tenMinuteOutput))) error(`project ${project.id} 的 primaryResourceId/launch 合同不完整`);
}

for (const manifest of manifests) {
  if (!nonEmpty(manifest.projectId) || !site.projects.some((project) => project.id === manifest.projectId)) error(`resource manifest projectId 不存在：${manifest.projectId}`);
  const resourceIds = new Set(manifest.resources.map((resource) => resource.id));
  if (!resourceIds.has(manifest.primaryResourceId)) error(`resource manifest primaryResourceId 不存在：${manifest.primaryResourceId}`);
  for (const resource of manifest.resources) {
    for (const field of ['id', 'title', 'url', 'kind', 'version', 'license', 'ownerId', 'availability', 'reviewStatus']) if (!nonEmpty(resource[field])) error(`resource ${resource.id ?? '(unknown)'} 缺少 ${field}`);
    if (!validUrl(resource.url)) error(`resource ${resource.id} URL 必须是站内路径或 HTTPS`);
    if (!['starter', 'data', 'tool', 'guide', 'reference'].includes(resource.kind)) error(`resource ${resource.id} kind 无效`);
    if (!['unknown', 'reachable', 'unreachable'].includes(resource.availability)) error(`resource ${resource.id} availability 无效`);
    if (!['pending', 'verified', 'stale'].includes(resource.reviewStatus)) error(`resource ${resource.id} reviewStatus 无效`);
    if (resource.availability === 'reachable' && (!validDate(resource.lastAutomatedCheckAt) || !validDate(resource.lastSuccessfulAt) || !Number.isInteger(resource.automatedStatusCode) || !nonEmpty(resource.finalUrl))) error(`resource ${resource.id} reachable 必须登记自动检查时间、成功时间、状态码和 finalUrl`);
    if (resource.availability === 'unreachable' && !nonEmpty(resource.failureReason)) error(`resource ${resource.id} unreachable 必须登记 failureReason`);
    for (const field of ['lastAutomatedCheckAt', 'lastSuccessfulAt', 'lastHumanWalkthroughAt']) if (resource[field] && !validDate(resource[field])) error(`resource ${resource.id} ${field} 必须是日期`);
    if (resource.replacementResourceId && !resourceIds.has(resource.replacementResourceId)) error(`resource ${resource.id} replacementResourceId 不存在`);
    if (resource.availability === 'unreachable' && !resource.replacementResourceId && !resource.internalFallbackPath) error(`resource ${resource.id} 不可达时必须有替代入口`);
    if (resource.internalFallbackPath && !resource.internalFallbackPath.startsWith('/')) error(`resource ${resource.id} internalFallbackPath 必须是站内路径`);
    if (resource.url.startsWith('/')) {
      const routePath = resource.url === '/projects/signal-feature-notebook/starter' ? 'app/projects/[projectSlug]/starter/page.tsx' : null;
      if (routePath && !existsSync(resolve(root, routePath))) error(`resource ${resource.id} 站内路径没有对应路由：${resource.url}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Phase 1.1 content contract failed.');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Phase 1.1 content contract passed (${claims.length} claims, ${manifests.length} resource manifest).`);
