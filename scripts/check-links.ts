import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseSiteData } from '../lib/content/schema';

const data = parseSiteData(JSON.parse(readFileSync(resolve(process.cwd(), 'content/site-data.json'), 'utf8')));
const failures: string[] = [];
function checkUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') failures.push(`${label} 必须使用 https：${value}`);
  } catch {
    failures.push(`${label} 不是有效 HTTPS URL：${value}`);
  }
}
for (const source of data.sources) if (source.accessType === 'public_url' && source.url) checkUrl(source.url, `sources.${source.id}.url`);
for (const project of data.projects) {
  checkUrl(project.sourceUrl, `projects.${project.id}.sourceUrl`);
  for (const tool of project.tools) checkUrl(tool.officialUrl, `projects.${project.id}.tools.${tool.name}`);
  if (project.resourceHealth.replacementUrl) checkUrl(project.resourceHealth.replacementUrl, `projects.${project.id}.resourceHealth.replacementUrl`);
}
if (failures.length > 0) {
  console.error('Link check failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Link check passed (${data.sources.length} sources, ${data.projects.length} projects).`);
