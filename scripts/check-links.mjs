import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const content = readFileSync(resolve(root, 'content/site-data.json'), 'utf8');
const data = JSON.parse(content);
const pathwayData = JSON.parse(readFileSync(resolve(root, 'content/pathways.json'), 'utf8'));
const evidenceData = JSON.parse(readFileSync(resolve(root, 'content/evidence.json'), 'utf8'));
const failures = [];

function checkUrl(value, label) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') failures.push(`${label} 必须使用 https：${value}`);
  } catch {
    failures.push(`${label} 不是有效 URL：${value}`);
  }
}

for (const source of data.sources ?? []) checkUrl(source.url, `sources.${source.id}.url`);
for (const source of data.sources ?? []) {
  if (!['A', 'B', 'C', 'D'].includes(source.authorityTier)) failures.push(`sources.${source.id}.authorityTier 必须显式声明 A/B/C/D`);
}
for (const project of data.projects ?? []) {
  checkUrl(project.sourceUrl, `projects.${project.id}.sourceUrl`);
  for (const tool of project.tools ?? []) checkUrl(tool.officialUrl, `projects.${project.id}.tools.${tool.name}`);
  const endpoints = (project.endpointIds ?? []).map((id) => evidenceData.endpoints.find((endpoint) => endpoint.id === id));
  if (endpoints.length < 2 || endpoints.some((endpoint) => !endpoint)) failures.push(`projects.${project.id} 必须登记可验证的主入口和替代入口`);
  if (!endpoints.some((endpoint) => endpoint?.ownerType === 'project' && endpoint.ownerId === project.id && endpoint.role === 'source')) failures.push(`projects.${project.id} 缺少 owner 正确的主入口 endpoint`);
  if (!endpoints.some((endpoint) => endpoint?.ownerType === 'project' && endpoint.ownerId === project.id && endpoint.role === 'replacement')) failures.push(`projects.${project.id} 缺少 owner 正确的替代入口 endpoint`);
  for (const endpoint of endpoints) {
    if (endpoint && !evidenceData.linkAvailability.some((item) => item.endpointId === endpoint.id)) failures.push(`${endpoint.id} 缺少 linkAvailability`);
  }
}
for (const pathway of pathwayData.pathways ?? []) {
  for (const sourceId of pathway.sourceIds ?? []) {
    const source = data.sources.find((item) => item.id === sourceId);
    if (!source) failures.push(`pathways.${pathway.id}.sourceIds 缺少来源：${sourceId}`);
  }
}
for (const endpoint of evidenceData.endpoints ?? []) checkUrl(endpoint.url, `evidence.endpoints.${endpoint.id}.url`);

const routeSources = [
  readFileSync(resolve(root, 'app/page.tsx'), 'utf8'),
  readFileSync(resolve(root, 'components/global-header.tsx'), 'utf8'),
  readFileSync(resolve(root, 'components/site.tsx'), 'utf8'),
];
for (const source of routeSources) {
  if (/href=["'](?:javascript|vbscript|file):/i.test(source)) failures.push('页面源码包含危险协议');
}

if (failures.length > 0) {
  console.error('Link check failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Link check passed (${data.sources.length} sources, ${data.projects.length} projects, ${pathwayData.pathways.length} pathways).`);
