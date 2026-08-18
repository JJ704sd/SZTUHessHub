import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const site = readJson('content/site-data.json');
const pathwayData = readJson('content/pathways.json');
const evidence = readJson('content/evidence.json');
const errors = [];
const addError = (message) => errors.push(message);
const ids = (items) => new Set(items.map((item) => item.id));
const expectedKinds = new Set(['employment', 'domestic-postgraduate', 'public-service', 'overseas-study', 'independent-work']);
const horizons = new Set(['15-minutes', '7-days', '30-days', 'semester']);

function hashClaim(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value).replace(/\s+/g, ' ').trim()).digest('hex')}`;
}

function requireRelation(value, available, label) {
  if (typeof value !== 'string' || !available.has(value)) addError(`${label} 引用了不存在的 ID：${value}`);
}

function validateEditorialMetadata(item, label) {
  if (typeof item.owner !== 'string' || !item.owner.trim()) addError(`${label}.owner 不能为空`);
  for (const field of ['updatedAt', 'reviewDueAt']) {
    if (typeof item[field] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item[field])) addError(`${label}.${field} 必须是 YYYY-MM-DD`);
  }
  if (item.updatedAt && item.reviewDueAt && item.reviewDueAt < item.updatedAt) addError(`${label}.reviewDueAt 不能早于 updatedAt`);
}

if (!Array.isArray(pathwayData.pathways) || pathwayData.pathways.length !== 5) addError('pathways 必须恰好包含五条路径');
const pathwayIds = ids(pathwayData.pathways ?? []);
const sourceIds = ids(site.sources ?? []);
const capabilityIds = ids(site.capabilities ?? []);
const projectIds = ids(site.projects ?? []);
const scenarioIds = ids(site.scenarios ?? []);
const artifactIds = ids(pathwayData.artifacts ?? []);
const endpointMap = new Map((evidence.endpoints ?? []).map((item) => [item.id, item]));
const availabilityIds = new Set((evidence.linkAvailability ?? []).map((item) => item.endpointId));
const claims = new Map((evidence.claims ?? []).map((item) => [item.key, item]));
const evidenceRefs = new Map((evidence.evidenceRefs ?? []).map((item) => [item.id, item]));
const projectEndpointMap = new Map((evidence.endpoints ?? []).filter((item) => item.ownerType === 'project').map((item) => [item.id, item]));
const projectAvailabilityMap = new Map((evidence.linkAvailability ?? []).map((item) => [item.endpointId, item]));

for (const [index, pathway] of (pathwayData.pathways ?? []).entries()) {
  const label = `pathways[${index}]`;
  validateEditorialMetadata(pathway, label);
  if (!expectedKinds.has(pathway.kind)) addError(`${label}.kind 不是五类 Pathway kind：${pathway.kind}`);
  if (!Array.isArray(pathway.capabilityIds) || pathway.capabilityIds.length < 2) addError(`${label}.capabilityIds 至少需要 2 项`);
  for (const id of pathway.capabilityIds ?? []) requireRelation(id, capabilityIds, `${label}.capabilityIds`);
  if (!Array.isArray(pathway.projectIds) || pathway.projectIds.length < 1) addError(`${label}.projectIds 至少需要 1 项`);
  for (const id of pathway.projectIds ?? []) requireRelation(id, projectIds, `${label}.projectIds`);
  for (const id of pathway.scenarioIds ?? []) requireRelation(id, scenarioIds, `${label}.scenarioIds`);
  for (const id of pathway.artifactIds ?? []) requireRelation(id, artifactIds, `${label}.artifactIds`);
  if (!Array.isArray(pathway.sourceIds) || pathway.sourceIds.length < 2) addError(`${label}.sourceIds 至少需要 2 项`);
  const pathSources = (pathway.sourceIds ?? []).map((id) => site.sources.find((source) => source.id === id));
  for (const [sourceIndex, source] of pathSources.entries()) {
    if (!source) addError(`${label}.sourceIds[${sourceIndex}] 来源不存在`);
    else if (!source.authorityTier) addError(`${label}.sourceIds[${sourceIndex}] 来源缺少 authorityTier`);
  }
  if (!pathSources.some((source) => source?.authorityTier === 'A')) addError(`${label} 至少需要一个 A 级来源`);
  const pathHorizons = new Set((pathway.actions ?? []).map((action) => action.horizon));
  if (!Array.isArray(pathway.actions) || pathway.actions.length !== 4 || pathHorizons.size !== 4 || [...horizons].some((horizon) => !pathHorizons.has(horizon))) {
    addError(`${label}.actions 必须完整包含四档且不得重复`);
  }
  for (const [actionIndex, action] of (pathway.actions ?? []).entries()) {
    for (const field of ['output', 'stopCondition', 'cannotProve', 'nextStep']) {
      if (typeof action[field] !== 'string' || !action[field].trim()) addError(`${label}.actions[${actionIndex}].${field} 不能为空`);
    }
  }
  for (const endpointId of pathway.endpointIds ?? []) {
    const endpoint = endpointMap.get(endpointId);
    if (!endpoint) addError(`${label}.endpointIds 引用了不存在的 endpoint：${endpointId}`);
    else if (endpoint.ownerType !== 'pathway' || endpoint.ownerId !== pathway.id) addError(`${endpointId} owner 与 ${pathway.id} 不一致`);
    if (!availabilityIds.has(endpointId)) addError(`${endpointId} 缺少 linkAvailability`);
  }
  if (!pathway.eligibilityBoundary?.trim()) addError(`${label}.eligibilityBoundary 不能为空`);
  for (const claimKey of pathway.claimKeys ?? []) {
    const claim = claims.get(claimKey);
    if (!claim) {
      addError(`${label}.claimKeys 缺少 claim：${claimKey}`);
      continue;
    }
    if (claim.subjectType !== 'pathway' || claim.subjectId !== pathway.id || claim.field !== 'eligibilityBoundary') addError(`${claimKey} 必须指向 ${pathway.id}.eligibilityBoundary`);
    if (claim.normalizedContentHash !== hashClaim(pathway.eligibilityBoundary)) addError(`${claimKey} 内容哈希不匹配`);
    for (const refId of claim.evidenceRefIds ?? []) {
      const ref = evidenceRefs.get(refId);
      if (!ref) addError(`${claimKey} 缺少 evidenceRef：${refId}`);
      else {
        if (!pathway.sourceIds.includes(ref.sourceId)) addError(`${claimKey} 的 sourceId 不在路径来源中：${ref.sourceId}`);
        if (ref.endpointId && !pathway.endpointIds.includes(ref.endpointId)) addError(`${claimKey} 的 endpointId 不在路径 endpoint 中：${ref.endpointId}`);
      }
    }
  }
}

for (const [index, transformation] of (pathwayData.evidenceTransformations ?? []).entries()) {
  validateEditorialMetadata(transformation, `evidenceTransformations[${index}]`);
  requireRelation(transformation.pathwayId, pathwayIds, `evidenceTransformations[${index}].pathwayId`);
  requireRelation(transformation.sourceArtifactId, artifactIds, `evidenceTransformations[${index}].sourceArtifactId`);
  const pathway = pathwayData.pathways.find((item) => item.id === transformation.pathwayId);
  if (pathway && !pathway.artifactIds.includes(transformation.sourceArtifactId)) addError(`evidenceTransformations[${index}] 的 artifact 未被路径声明`);
}
for (const pathway of pathwayData.pathways ?? []) {
  if (!(pathwayData.evidenceTransformations ?? []).some((item) => item.pathwayId === pathway.id)) addError(`${pathway.id} 缺少 evidence transformation`);
}

const transformationsByArtifact = new Map();
for (const transformation of pathwayData.evidenceTransformations ?? []) {
  const list = transformationsByArtifact.get(transformation.sourceArtifactId) ?? [];
  list.push(transformation);
  transformationsByArtifact.set(transformation.sourceArtifactId, list);
}
const requiredArtifactTransformationCounts = new Map([
  ['artifact-signal-analysis', 5],
  ['artifact-sensor-test-record', 2],
  ['artifact-material-matrix', 2],
]);
for (const artifact of pathwayData.artifacts ?? []) {
  validateEditorialMetadata(artifact, `artifacts.${artifact.id}`);
  const project = site.projects.find((item) => item.id === artifact.projectId);
  if (!project) addError(`${artifact.id} 缺少对应项目：${artifact.projectId}`);
  else if (project.artifactId !== artifact.id) addError(`${project.id}.artifactId 必须与 ${artifact.id} 对齐`);
  const count = (transformationsByArtifact.get(artifact.id) ?? []).length;
  const minimum = requiredArtifactTransformationCounts.get(artifact.id) ?? 2;
  if (count < minimum) addError(`${artifact.id} 至少需要 ${minimum} 条路径证据改写，当前 ${count} 条`);
}

for (const project of site.projects ?? []) {
  const endpoints = (project.endpointIds ?? []).map((id) => projectEndpointMap.get(id));
  if (endpoints.length < 2 || endpoints.some((endpoint) => !endpoint)) addError(`${project.id} 必须登记至少两个 project endpoint`);
  if (!endpoints.some((endpoint) => endpoint?.role === 'source' && endpoint.ownerId === project.id)) addError(`${project.id} 缺少主入口 endpoint`);
  if (!endpoints.some((endpoint) => endpoint?.role === 'replacement' && endpoint.ownerId === project.id)) addError(`${project.id} 缺少替代入口 endpoint`);
  for (const endpoint of endpoints) {
    if (endpoint && !projectAvailabilityMap.has(endpoint.id)) addError(`${endpoint.id} 缺少 linkAvailability`);
  }
}

const launch = pathwayData.homePlan?.pathwayLaunch;
if (!launch || launch.startModeOrder?.length !== 3 || new Set(launch.startModeOrder).size !== 3) addError('homePlan.pathwayLaunch 必须包含三种不重复开始方式');
if (!launch || launch.pathwayIds?.length !== 5 || new Set(launch.pathwayIds).size !== 5 || launch.pathwayIds.some((id) => !pathwayIds.has(id))) addError('homePlan.pathwayLaunch 必须恰好覆盖五条路径');
if (!launch || !artifactIds.has(launch.featuredArtifactId)) addError('homePlan.pathwayLaunch.featuredArtifactId 不存在');

if (errors.length > 0) {
  console.error('Pathway validation failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Pathway validation passed (5 pathways, ${pathwayData.evidenceTransformations.length} transformations, ${pathwayData.artifacts.length} artifacts).`);
