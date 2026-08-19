import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../content/site-data.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(readFileSync(new URL('../content/evidence.json', import.meta.url), 'utf8'));
const snapshotPath = new URL('../content/resource-health.json', import.meta.url);
const timeoutMs = Number(process.env.RESOURCE_HEALTH_TIMEOUT_MS ?? 8000);

function projectEndpoints(projectId) {
  return evidence.endpoints.filter((endpoint) => endpoint.ownerType === 'project' && endpoint.ownerId === projectId);
}

function aggregate(projectId, links) {
  const endpoints = projectEndpoints(projectId);
  const byId = new Map(links.map((link) => [link.endpointId, link]));
  const endpointById = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint]));
  if (!endpoints.length || endpoints.some((endpoint) => !byId.has(endpoint.id))) return { status: 'unverified' };
  const required = endpoints.filter((endpoint) => endpoint.required);
  const replacementAvailable = (link) => link?.replacementEndpointId && endpointById.get(link.replacementEndpointId)?.role === 'replacement' && byId.get(link.replacementEndpointId)?.status === 'available';
  const approvedReplacement = endpoints.find((endpoint) => endpoint.role === 'replacement' && links.some((link) => link.replacementEndpointId === endpoint.id) && byId.get(endpoint.id)?.status === 'available');
  const replacementProjection = approvedReplacement ? { replacementUrl: approvedReplacement.url } : {};
  if (required.some((endpoint) => byId.get(endpoint.id)?.status === 'unavailable' && !replacementAvailable(byId.get(endpoint.id)))) return { status: 'unavailable' };
  if (required.some((endpoint) => byId.get(endpoint.id)?.status === 'unavailable' && replacementAvailable(byId.get(endpoint.id)))) return { status: 'degraded', ...replacementProjection };
  if (required.some((endpoint) => ['unverified', 'degraded'].includes(byId.get(endpoint.id)?.status)) || endpoints.some((endpoint) => !endpoint.required && byId.get(endpoint.id)?.status !== 'available')) return { status: 'degraded', ...replacementProjection };
  return { status: 'available' };
}

function checkedAt(links) {
  return links.map((link) => link.checkedAt).sort().at(-1) ?? new Date().toISOString().slice(0, 10);
}

async function probe(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const checkedAt = new Date().toISOString();
  try {
    let response = await fetch(endpoint.url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'HseeHub-resource-health/1.6' } });
    if ([403, 405, 501].includes(response.status)) response = await fetch(endpoint.url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { range: 'bytes=0-0', 'user-agent': 'HseeHub-resource-health/1.6' } });
    return { endpointId: endpoint.id, requestedUrl: endpoint.url, status: response.status, ok: response.ok, finalUrl: response.url, checkedAt };
  } catch (error) {
    return { endpointId: endpoint.id, requestedUrl: endpoint.url, status: 0, ok: false, finalUrl: endpoint.url, checkedAt, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

if (process.argv.includes('--probe')) {
  const results = await Promise.all(evidence.endpoints.map(probe));
  mkdirSync(new URL('../artifacts/', import.meta.url), { recursive: true });
  const report = { generatedAt: new Date().toISOString(), endpoints: results };
  writeFileSync(new URL('../artifacts/resource-probe.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
  results.forEach((result) => console.log(`[resource-probe] ${result.ok ? 'OK' : 'WARN'} ${result.status || 'ERR'} ${result.endpointId} ${result.finalUrl}`));
  const failures = results.filter((result) => !result.ok);
  console.log(`Resource probe completed (${results.length - failures.length}/${results.length} reachable; artifacts/resource-probe.json written; content was not modified).`);
  if (failures.length > 0 && process.argv.includes('--strict')) process.exitCode = 1;
} else {
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  const failures = [];
  for (const project of data.projects) {
    const links = evidence.linkAvailability.filter((link) => projectEndpoints(project.id).some((endpoint) => endpoint.id === link.endpointId));
    const expected = aggregate(project.id, links);
    const actual = snapshot.projects[project.id] ?? {};
    if (actual.status !== expected.status || (actual.replacementUrl ?? undefined) !== (expected.replacementUrl ?? undefined) || actual.checkedAt !== project.resourceHealth.checkedAt) failures.push(`${project.id}: snapshot/content projection drifted`);
  }
  if (failures.length) {
    console.error('Resource health snapshot failed.');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`Resource health snapshot passed (${data.projects.length} projects, ${snapshot.checkedAt}).`);
}
