import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const snapshot = JSON.parse(await readFile(new URL('../content/resource-health.json', import.meta.url), 'utf8'));
const data = JSON.parse(await readFile(new URL('../content/site-data.json', import.meta.url), 'utf8'));
const projects = Object.fromEntries(data.projects.map((project) => [project.id, project.resourceHealth]));

assert.deepEqual(Object.keys(snapshot.projects).sort(), Object.keys(projects).sort(), 'resource snapshot project IDs match content');
for (const [id, health] of Object.entries(projects)) {
  assert.equal(snapshot.projects[id].status, health.status, `${id} status drifted from snapshot`);
  assert.equal(snapshot.projects[id].checkedAt, health.checkedAt, `${id} checkedAt drifted from snapshot`);
}

console.log(`Resource health snapshot passed (${Object.keys(projects).length} projects, ${snapshot.checkedAt}).`);

if (process.argv.includes('--probe')) {
  const urls = Array.from(new Set(data.projects.flatMap((project) => [
    project.sourceUrl,
    ...project.tools.map((tool) => tool.officialUrl),
    project.resourceHealth.replacementUrl,
  ].filter(Boolean))));
  const timeoutMs = Number(process.env.RESOURCE_HEALTH_TIMEOUT_MS ?? 8000);

  async function probe(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'HseeHub-resource-health/1.0' } });
      if ([403, 405, 501].includes(response.status)) {
        response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { range: 'bytes=0-0', 'user-agent': 'HseeHub-resource-health/1.0' } });
      }
      return { url, status: response.status, ok: response.ok, finalUrl: response.url };
    } catch (error) {
      return { url, status: 0, ok: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      clearTimeout(timeout);
    }
  }

  const results = await Promise.all(urls.map(probe));
  results.forEach((result) => console.log(`[resource-probe] ${result.ok ? 'OK' : 'WARN'} ${result.status || 'ERR'} ${result.url}${result.finalUrl && result.finalUrl !== result.url ? ` -> ${result.finalUrl}` : ''}${result.error ? ` (${result.error})` : ''}`));
  const failures = results.filter((result) => !result.ok);
  console.log(`Resource probe completed (${results.length - failures.length}/${results.length} reachable; snapshot was not modified).`);
  if (failures.length > 0 && process.argv.includes('--strict')) process.exitCode = 1;
}
