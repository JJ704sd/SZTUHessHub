import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../content/site-data.json', import.meta.url), 'utf8'));
const pathwayData = JSON.parse(readFileSync(new URL('../content/pathways.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(readFileSync(new URL('../content/evidence.json', import.meta.url), 'utf8'));
const errors = [];
const sourceIds = new Set(data.sources.map((source) => source.id));
const refIds = new Set(evidence.evidenceRefs.map((ref) => ref.id));
const endpointIds = new Set(evidence.endpoints.map((endpoint) => endpoint.id));
const claimKeys = new Set();
const p0Keys = [
  'major:major-ime:totalCredits', 'major:major-bme:totalCredits', 'major_comparison:major-comparison:sharedFoundation',
  'major:major-ime:focusTask', 'major:major-bme:focusTask',
  'major:major-ime:representativeCourseGroup', 'major:major-bme:representativeCourseGroup',
  'dual_lens_case:case-wearable-vital-signs:sharedGoal', 'dual_lens_case:case-wearable-vital-signs:sharedArtifact',
  ...data.projects.flatMap((project) => [`project:${project.id}:dataBoundary`, `project:${project.id}:safetyBoundary`]),
];

function normalize(value) { return JSON.stringify(value).replace(/\s+/g, ' ').trim(); }
function hash(value) { return `sha256:${createHash('sha256').update(normalize(value)).digest('hex')}`; }
function findValue(claim) {
  if (claim.key === 'major_comparison:major-comparison:sharedFoundation') return data.siteMeta.home.sharedFoundation;
  const subject = claim.subjectType === 'major' ? data.majors.find((item) => item.id === claim.subjectId)
    : claim.subjectType === 'dual_lens_case' ? data.dualLensCases.find((item) => item.id === claim.subjectId)
      : claim.subjectType === 'project' ? data.projects.find((item) => item.id === claim.subjectId)
        : claim.subjectType === 'pathway' ? pathwayData.pathways.find((item) => item.id === claim.subjectId) : undefined;
  if (!subject) return undefined;
  if (claim.field === 'totalCredits') return subject.credits;
  if (claim.field === 'focusTask') return subject.primaryFocus;
  if (claim.field === 'representativeCourseGroup') return subject.representativeCourses;
  return subject[claim.field];
}

for (const key of p0Keys) if (!evidence.claims.some((claim) => claim.key === key)) errors.push(`缺少 P0 claim：${key}`);
for (const ref of evidence.evidenceRefs) {
  if (!sourceIds.has(ref.sourceId)) errors.push(`EvidenceRef ${ref.id} 的来源不存在：${ref.sourceId}`);
  if (ref.reviewedAt > ref.reviewDueAt) errors.push(`EvidenceRef ${ref.id} 的复核日期晚于到期日`);
}
for (const claim of evidence.claims) {
  if (claimKeys.has(claim.key)) errors.push(`claim key 重复：${claim.key}`);
  claimKeys.add(claim.key);
  if (claim.key !== `${claim.subjectType}:${claim.subjectId}:${claim.field}`) errors.push(`claim key 与实体字段不一致：${claim.key}`);
  const value = findValue(claim);
  if (value === undefined) errors.push(`claim 绑定的实体或字段不存在：${claim.key}`);
  else if (hash(value) !== claim.normalizedContentHash) errors.push(`claim hash 不匹配：${claim.key}（文案变化后旧核验必须失效）`);
  for (const refId of claim.evidenceRefIds) if (!refIds.has(refId)) errors.push(`claim ${claim.key} 缺少 EvidenceRef：${refId}`);
}
if (claimKeys.size !== evidence.claims.length) errors.push('claim key 必须唯一');
if (endpointIds.size !== evidence.endpoints.length) errors.push('endpoint ID 必须唯一');
if (refIds.size !== evidence.evidenceRefs.length) errors.push('EvidenceRef ID 必须唯一');
for (const endpoint of evidence.endpoints) {
  if (endpoint.ownerType === 'project' && !data.projects.some((project) => project.id === endpoint.ownerId)) errors.push(`endpoint 所属项目不存在：${endpoint.id}`);
  if (endpoint.ownerType === 'pathway' && !pathwayData.pathways.some((pathway) => pathway.id === endpoint.ownerId)) errors.push(`endpoint 所属路径不存在：${endpoint.id}`);
}
for (const link of evidence.linkAvailability) {
  if (!endpointIds.has(link.endpointId)) errors.push(`LinkAvailability 引用了不存在的 endpoint：${link.endpointId}`);
  if (link.replacementEndpointId && (!endpointIds.has(link.replacementEndpointId) || evidence.endpoints.find((endpoint) => endpoint.id === link.replacementEndpointId)?.role !== 'replacement')) errors.push(`LinkAvailability 的替代入口未登记为 replacement：${link.endpointId}`);
}
if (new Set(evidence.linkAvailability.map((link) => link.endpointId)).size !== evidence.linkAvailability.length) errors.push('LinkAvailability 必须每个 endpoint 只有一条当前记录');
for (const project of data.projects) {
  const endpoints = evidence.endpoints.filter((endpoint) => endpoint.ownerType === 'project' && endpoint.ownerId === project.id);
  if (!endpoints.some((endpoint) => endpoint.role === 'source' && endpoint.url === project.sourceUrl)) errors.push(`项目 source URL 未注册为独立 source endpoint：${project.id}`);
  for (const tool of project.tools) if (!endpoints.some((endpoint) => endpoint.role === 'tool' && endpoint.url === tool.officialUrl)) errors.push(`项目工具 URL 未注册为独立 tool endpoint：${project.id} ${tool.name}`);
}
for (const source of data.sources) if (source.accessType === 'public_url' && !source.url) errors.push(`公开来源缺少 URL：${source.id}`);

if (errors.length) {
  console.error('Evidence check failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Evidence check passed (${evidence.claims.length} claims, ${evidence.evidenceRefs.length} refs, ${evidence.endpoints.length} endpoints).`);
