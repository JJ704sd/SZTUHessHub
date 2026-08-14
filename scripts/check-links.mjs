import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const content = readFileSync(resolve(root, 'content/site-data.json'), 'utf8');
const data = JSON.parse(content);
const resourceManifest = JSON.parse(readFileSync(resolve(root, 'content/resources/signal-feature-notebook.json'), 'utf8'));
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
for (const project of data.projects ?? []) {
  checkUrl(project.sourceUrl, `projects.${project.id}.sourceUrl`);
  for (const tool of project.tools ?? []) checkUrl(tool.officialUrl, `projects.${project.id}.tools.${tool.name}`);
}
for (const resource of resourceManifest.resources ?? []) {
  if (!resource.url.startsWith('/')) checkUrl(resource.url, `resources.${resource.id}.url`);
  if (resource.internalFallbackPath && !resource.internalFallbackPath.startsWith('/')) failures.push(`resources.${resource.id}.internalFallbackPath 必须是站内路径：${resource.internalFallbackPath}`);
}

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

const resourceStatus = (resourceManifest.resources ?? []).map((resource) => `${resource.id}:${resource.availability}/${resource.reviewStatus}`).join(', ');
console.log(`Link check passed (${data.sources.length} sources, ${data.projects.length} projects; resource status ${resourceStatus}).`);
