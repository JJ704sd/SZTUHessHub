import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = (path) => readFile(resolve(root, path), 'utf8').then(JSON.parse);
const [site, claims, manifest, pathways] = await Promise.all([readJson('content/site-data.json'), readJson('content/claims.json'), readJson('content/resources/signal-feature-notebook.json'), readJson('content/pathways.json')]);
const errors = [];
const ids = new Set(site.sources.map((source) => source.id));
const date = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const validUrl = (value) => typeof value === 'string' && (value.startsWith('/') || value.startsWith('https://'));

for (const claim of claims) {
  for (const field of ['id', 'claimType', 'sourceId', 'ownerId', 'reviewStatus', 'reviewDueAt']) if (!nonEmpty(claim[field])) errors.push(`claim ${claim.id ?? '(unknown)'} 缺少 ${field}`);
  if (!ids.has(claim.sourceId)) errors.push(`claim ${claim.id} sourceId 不存在：${claim.sourceId}`);
  if (!['official', 'translated', 'example'].includes(claim.claimType)) errors.push(`claim ${claim.id} claimType 无效`);
  if (!['draft', 'reviewed', 'expired'].includes(claim.reviewStatus)) errors.push(`claim ${claim.id} reviewStatus 无效`);
  if (!date(claim.reviewDueAt)) errors.push(`claim ${claim.id} reviewDueAt 必须是日期`);
  if (claim.reviewStatus === 'reviewed' && (!date(claim.reviewedAt) || !nonEmpty(claim.reviewedBy))) errors.push(`claim ${claim.id} 已 reviewed 但缺少 reviewedAt/reviewedBy`);
}

for (const project of site.projects) {
  if (project.primaryResourceId && (!project.launch || project.launch.primaryResourceId !== project.primaryResourceId || project.launch.maxStartSeconds !== 120 || !nonEmpty(project.launch.tenMinuteOutput))) errors.push(`project ${project.id} 的 primaryResourceId/launch 合同不完整`);
}
const project = site.projects.find((item) => item.id === manifest.projectId);
if (!project) errors.push(`resource manifest projectId 不存在：${manifest.projectId}`);
if (!manifest.resources.some((resource) => resource.id === manifest.primaryResourceId)) errors.push(`primaryResourceId 不存在：${manifest.primaryResourceId}`);
if (manifest.resources.find((resource) => resource.id === manifest.primaryResourceId)?.kind !== 'starter') errors.push(`primaryResourceId 必须指向 starter：${manifest.primaryResourceId}`);
if (project?.primaryResourceId !== manifest.primaryResourceId) errors.push(`project ${project.id} 的 primaryResourceId 与 manifest 不一致`);
for (const resource of manifest.resources) {
  for (const field of ['id', 'title', 'url', 'kind', 'version', 'license', 'ownerId', 'availability', 'reviewStatus']) if (!nonEmpty(resource[field])) errors.push(`resource ${resource.id ?? '(unknown)'} 缺少 ${field}`);
  if (!validUrl(resource.url)) errors.push(`resource ${resource.id} URL 必须是站内路径或 HTTPS`);
  if (!['starter', 'data', 'tool', 'guide', 'reference'].includes(resource.kind)) errors.push(`resource ${resource.id} kind 无效`);
  if (!['unknown', 'reachable', 'unreachable'].includes(resource.availability)) errors.push(`resource ${resource.id} availability 无效`);
  if (!['pending', 'verified', 'stale'].includes(resource.reviewStatus)) errors.push(`resource ${resource.id} reviewStatus 无效`);
  if (resource.availability === 'reachable' && (!date(resource.lastAutomatedCheckAt) || !date(resource.lastSuccessfulAt) || !Number.isInteger(resource.automatedStatusCode) || !nonEmpty(resource.finalUrl))) errors.push(`resource ${resource.id} reachable 记录不完整`);
  if (resource.availability === 'unreachable' && !nonEmpty(resource.failureReason) && !resource.replacementResourceId && !resource.internalFallbackPath) errors.push(`resource ${resource.id} 不可达时必须有回退`);
  for (const field of ['lastAutomatedCheckAt', 'lastSuccessfulAt', 'lastHumanWalkthroughAt']) if (resource[field] && !date(resource[field])) errors.push(`resource ${resource.id} ${field} 必须是日期`);
  if (resource.replacementResourceId && !manifest.resources.some((item) => item.id === resource.replacementResourceId)) errors.push(`resource ${resource.id} replacementResourceId 不存在`);
  if (resource.replacementResourceId === resource.id) errors.push(`resource ${resource.id} replacementResourceId 不能自环`);
  if (resource.internalFallbackPath && !resource.internalFallbackPath.startsWith('/')) errors.push(`resource ${resource.id} internalFallbackPath 必须是站内路径`);
}
for (const resource of manifest.resources) {
  const seen = new Set(); let current = resource;
  while (current.replacementResourceId) {
    if (seen.has(current.id)) { errors.push(`resource ${resource.id} 的替代资源形成循环`); break; }
    seen.add(current.id);
    current = manifest.resources.find((item) => item.id === current.replacementResourceId);
    if (!current) break;
  }
}
if (project?.launch?.primaryResourceId !== manifest.primaryResourceId || project?.launch?.maxStartSeconds !== 120) errors.push('项目 primaryResourceId 与 starter launch 合同不一致');

const home = site.siteMeta?.home;
const composition = home?.composition;
const expectedSections = ['launch', 'discover', 'projects', 'trust'];
if (!composition) errors.push('首页缺少 composition');
else {
  if ('primaryJourneyId' in home) errors.push('旧首页 primaryJourneyId 不得与 composition 并存');
  if (composition.sectionOrder?.length !== expectedSections.length || composition.sectionOrder.some((id) => !expectedSections.includes(id)) || new Set(composition.sectionOrder).size !== composition.sectionOrder.length) errors.push('首页 composition.sectionOrder 必须恰好包含四个不重复区块');
  const journeyIds = new Set((composition.journeys ?? []).map((journey) => journey.id));
  if (!journeyIds.has(composition.primaryJourneyId)) errors.push(`首页主 journey 不存在：${composition.primaryJourneyId}`);
  if (new Set(composition.discoveryItemIds ?? []).size !== (composition.discoveryItemIds ?? []).length) errors.push('首页 discoveryItemIds 不得重复');
  const discoverable = new Map([
    ...site.dualLensCases.map((item) => [item.id, item]),
    ...pathways.artifacts.map((item) => [item.id, item]),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  for (const id of composition.discoveryItemIds ?? []) {
    const item = discoverable.get(id);
    if (!item) errors.push(`首页 discovery item 不存在：${id}`);
    else {
      for (const field of ['owner', 'updatedAt', 'reviewDueAt']) if (!nonEmpty(item[field])) errors.push(`首页 discovery item ${id} 缺少 ${field}`);
      if (!date(item.reviewDueAt) || item.reviewDueAt < today) errors.push(`首页 discovery item 已过期：${id}`);
    }
  }
  const featuredCaseId = home.featuredDualLensCaseId;
  if (!composition.discoveryItemIds?.includes(featuredCaseId)) errors.push(`首页 featuredDualLensCaseId 必须属于 discoveryItemIds：${featuredCaseId}`);
  const featuredArtifactId = pathways.homePlan?.pathwayLaunch?.featuredArtifactId;
  if (!composition.discoveryItemIds?.includes(featuredArtifactId)) errors.push(`首页 featuredArtifactId 必须属于 discoveryItemIds：${featuredArtifactId}`);
  for (const journey of composition.journeys ?? []) {
    if (journey.id === 'try') {
      const resource = manifest.resources.find((item) => item.id === journey.resourceId);
      if (!resource) errors.push(`首页 try journey 资源不存在：${journey.resourceId}`);
      else {
        if (resource.kind !== 'starter') errors.push(`首页 try journey 必须指向 starter：${journey.resourceId}`);
        if (manifest.projectId !== journey.projectId) errors.push(`首页 try journey 项目与资源 manifest 不一致：${journey.resourceId}`);
      }
      if (!nonEmpty(journey.fallbackLabel)) errors.push('首页 try journey 缺少 fallbackLabel');
    }
  }
}

if (errors.length) {
  console.error('Phase 1.1 content contract failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Phase 1.1 content contract passed (${claims.length} claims, ${manifest.resources.length} resources).`);
