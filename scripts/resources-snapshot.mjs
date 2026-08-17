import { existsSync, readFileSync, writeFileSync } from 'node:fs';

if (!process.argv.includes('--approved') && process.env.RESOURCES_SNAPSHOT_APPROVED !== 'true') {
  console.error('Refusing to write content/resource-health.json without --approved or RESOURCES_SNAPSHOT_APPROVED=true.');
  process.exit(1);
}
const reportPath = new URL('../artifacts/resource-probe.json', import.meta.url);
if (!existsSync(reportPath)) {
  console.error('Missing artifacts/resource-probe.json; run resources:probe first.');
  process.exit(1);
}
const data = JSON.parse(readFileSync(new URL('../content/site-data.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(readFileSync(new URL('../content/evidence.json', import.meta.url), 'utf8'));
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const configuredLinks = new Map(evidence.linkAvailability.map((link) => [link.endpointId, link]));
const availability = report.endpoints.map((result) => ({ endpointId: result.endpointId, checkedAt: result.checkedAt.slice(0, 10), status: result.ok ? 'available' : 'unavailable', ...(configuredLinks.get(result.endpointId)?.replacementEndpointId ? { replacementEndpointId: configuredLinks.get(result.endpointId).replacementEndpointId } : {}), ...(result.finalUrl && result.finalUrl !== result.requestedUrl ? { note: `最终 URL：${result.finalUrl}` } : {}) }));
const endpointFor = (projectId) => evidence.endpoints.filter((endpoint) => endpoint.ownerType === 'project' && endpoint.ownerId === projectId);
const aggregate = (projectId) => {
  const endpoints = endpointFor(projectId);
  const byId = new Map(availability.map((link) => [link.endpointId, link]));
  const endpointById = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint]));
  const required = endpoints.filter((endpoint) => endpoint.required);
  const replacement = endpoints.find((endpoint) => endpoint.role === 'replacement' && endpoints.some((candidate) => byId.get(candidate.id)?.replacementEndpointId === endpoint.id) && byId.get(endpoint.id)?.status === 'available');
  const replacementFor = (endpoint) => byId.get(endpoint.id)?.replacementEndpointId && endpointById.get(byId.get(endpoint.id).replacementEndpointId)?.role === 'replacement' && byId.get(byId.get(endpoint.id).replacementEndpointId)?.status === 'available';
  if (required.some((endpoint) => byId.get(endpoint.id)?.status === 'unavailable' && !replacementFor(endpoint))) return { status: 'unavailable' };
  if (required.some((endpoint) => byId.get(endpoint.id)?.status === 'unavailable' && replacementFor(endpoint))) return { status: 'degraded', ...(replacement ? { replacementUrl: replacement.url } : {}) };
  if (endpoints.some((endpoint) => byId.get(endpoint.id)?.status !== 'available')) return { status: 'degraded', ...(replacement ? { replacementUrl: replacement.url } : {}) };
  return { status: 'available' };
};
const projectHealth = Object.fromEntries(data.projects.map((project) => {
  const projectLinks = availability.filter((link) => endpointFor(project.id).some((endpoint) => endpoint.id === link.endpointId));
  return [project.id, { ...aggregate(project.id), checkedAt: projectLinks.map((link) => link.checkedAt).sort().at(-1) ?? report.generatedAt.slice(0, 10) }];
}));
writeFileSync(new URL('../content/resource-health.json', import.meta.url), `${JSON.stringify({ checkedAt: report.generatedAt.slice(0, 10), source: 'artifacts/resource-probe.json (approved)', projects: projectHealth }, null, 2)}\n`);
console.log(`Approved resource snapshot written for ${Object.keys(projectHealth).length} projects.`);
