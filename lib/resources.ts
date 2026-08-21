import type { Project } from '@/lib/content/schema';
import signalManifest from '@/content/resources/signal-feature-notebook.json';

export const RESOURCE_FRESHNESS_DAYS = 30;
export type ResourceLink = {
  id: string;
  title: string;
  url: string;
  kind: 'starter' | 'data' | 'tool' | 'guide' | 'reference';
  version: string;
  license: string;
  licenseEvidenceUrl?: string;
  ownerId: string;
  availability: 'unknown' | 'reachable' | 'unreachable';
  reviewStatus: 'pending' | 'verified' | 'stale';
  lastAutomatedCheckAt?: string;
  lastSuccessfulAt?: string;
  automatedStatusCode?: number;
  finalUrl?: string;
  lastHumanWalkthroughAt?: string;
  reviewedBy?: string;
  walkthroughEvidence?: string;
  failureReason?: string;
  replacementResourceId?: string;
  internalFallbackPath?: string;
};
export type ResourceManifest = { projectId: string; primaryResourceId: string; resources: ResourceLink[] };
export type DerivedResourceStatus = 'verified' | 'pending' | 'stale' | 'unavailable' | 'unknown';
export type PrimaryResourceConditions = { machineReachable: boolean; humanVerified: boolean; fresh: boolean };
export const resourceManifests: ResourceManifest[] = [signalManifest as ResourceManifest];

export function getResourceById(resourceId: string) {
  return resourceManifests.flatMap((manifest) => manifest.resources).find((resource) => resource.id === resourceId);
}

export function hasHumanApprovalEvidence(resource: ResourceLink) {
  return resource.reviewStatus === 'verified'
    && resource.ownerId !== 'owner-pending-confirmation'
    && !/noassertion/i.test(resource.license)
    && Boolean(resource.reviewedBy && resource.lastHumanWalkthroughAt && resource.walkthroughEvidence);
}

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isFresh(resource: ResourceLink, now = new Date(), maxAgeDays = RESOURCE_FRESHNESS_DAYS) {
  const date = parseDate(resource.lastHumanWalkthroughAt);
  return Boolean(date && now.getTime() >= date.getTime() && now.getTime() - date.getTime() <= maxAgeDays * 24 * 60 * 60 * 1000);
}

export function deriveResourceStatus(resource: ResourceLink, now = new Date()): DerivedResourceStatus {
  if (resource.availability === 'unreachable') return 'unavailable';
  if (resource.reviewStatus === 'pending') return 'pending';
  if (resource.reviewStatus === 'stale') return 'stale';
  if (!hasHumanApprovalEvidence(resource)) return 'pending';
  if (!isFresh(resource, now)) return 'stale';
  if (resource.availability === 'unknown') return 'unknown';
  return 'verified';
}

export function canBePrimary(resource: ResourceLink, now = new Date()) {
  const conditions = primaryResourceConditions(resource, now);
  return resource.kind === 'starter' && conditions.machineReachable && conditions.humanVerified && conditions.fresh;
}

export function primaryResourceConditions(resource: ResourceLink, now = new Date()): PrimaryResourceConditions {
  return { machineReachable: resource.availability === 'reachable', humanVerified: hasHumanApprovalEvidence(resource), fresh: isFresh(resource, now) };
}

export function validateResourceManifest(manifest: ResourceManifest) {
  const errors: string[] = [];
  const byId = new Map(manifest.resources.map((resource) => [resource.id, resource]));
  const primary = byId.get(manifest.primaryResourceId);
  if (!primary) errors.push(`primaryResourceId 不存在：${manifest.primaryResourceId}`);
  else if (primary.kind !== 'starter') errors.push(`primaryResourceId 必须指向 starter：${manifest.primaryResourceId}`);

  for (const resource of manifest.resources) {
    if (resource.replacementResourceId === resource.id) errors.push(`${resource.id} 的 replacementResourceId 不能自环`);
    if (resource.replacementResourceId && !byId.has(resource.replacementResourceId)) errors.push(`${resource.id} 的替代资源不存在：${resource.replacementResourceId}`);
    if (resource.availability === 'unreachable' && !resource.replacementResourceId && !resource.internalFallbackPath) errors.push(`${resource.id} 不可达时必须有替代资源或站内 fallback`);
  }

  for (const resource of manifest.resources) {
    const seen = new Set<string>();
    let current = resource;
    while (current.replacementResourceId) {
      if (seen.has(current.id)) { errors.push(`${resource.id} 的替代资源形成循环`); break; }
      seen.add(current.id);
      const next = byId.get(current.replacementResourceId);
      if (!next) break;
      current = next;
    }
  }
  return errors;
}

export function makeLegacyResourceManifest(project: Project): ResourceManifest {
  return {
    projectId: project.id,
    primaryResourceId: '',
    resources: project.tools.map((tool, index) => ({
      id: `${project.id}-tool-${index + 1}`,
      title: tool.name,
      url: tool.officialUrl,
      kind: 'tool',
      version: 'current（需人工核对）',
      license: project.license,
      ownerId: 'owner-pending-confirmation',
      availability: 'unknown',
      reviewStatus: 'pending',
      internalFallbackPath: `/projects/${project.slug}`,
      failureReason: '当前项目尚未登记独立 starter 或人工走通记录。',
    })),
  } as ResourceManifest;
}

export function resourceStatusLabel(status: DerivedResourceStatus) {
  return { verified: '已验证', pending: '待人工核验', stale: '复核已过期', unavailable: '不可用', unknown: '待自动检查' }[status];
}
