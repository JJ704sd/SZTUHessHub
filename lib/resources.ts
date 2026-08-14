import type { Project, ResourceLink, ResourceManifest } from '@/lib/content';

export const RESOURCE_FRESHNESS_DAYS = 30;
export type DerivedResourceStatus = 'verified' | 'pending' | 'stale' | 'unavailable' | 'unknown';

export type PrimaryResourceConditions = {
  machineReachable: boolean;
  humanVerified: boolean;
  fresh: boolean;
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFresh(resource: ResourceLink, now = new Date(), maxAgeDays = RESOURCE_FRESHNESS_DAYS) {
  const walkedAt = parseDate(resource.lastHumanWalkthroughAt);
  if (!walkedAt) return false;
  const ageMs = now.getTime() - walkedAt.getTime();
  return ageMs >= 0 && ageMs <= maxAgeDays * 24 * 60 * 60 * 1000;
}

export function deriveResourceStatus(resource: ResourceLink, now = new Date()): DerivedResourceStatus {
  if (resource.availability === 'unreachable') return 'unavailable';
  if (resource.reviewStatus === 'pending') return 'pending';
  if (resource.reviewStatus === 'stale' || !isFresh(resource, now)) return 'stale';
  if (resource.availability === 'unknown') return 'unknown';
  return 'verified';
}

export function primaryResourceConditions(resource: ResourceLink, now = new Date()): PrimaryResourceConditions {
  return {
    machineReachable: resource.availability === 'reachable',
    humanVerified: resource.reviewStatus === 'verified',
    fresh: isFresh(resource, now),
  };
}

export function canBePrimary(resource: ResourceLink, now = new Date()) {
  const conditions = primaryResourceConditions(resource, now);
  return resource.kind === 'starter' && conditions.machineReachable && conditions.humanVerified && conditions.fresh;
}

export function validateResourceManifest(manifest: ResourceManifest) {
  const errors: string[] = [];
  const byId = new Map(manifest.resources.map((resource) => [resource.id, resource]));
  if (manifest.primaryResourceId && !byId.has(manifest.primaryResourceId)) errors.push(`primaryResourceId 不存在：${manifest.primaryResourceId}`);

  for (const resource of manifest.resources) {
    if (resource.replacementResourceId === resource.id) errors.push(`${resource.id} 的 replacementResourceId 不能自环`);
    if (resource.replacementResourceId && !byId.has(resource.replacementResourceId)) errors.push(`${resource.id} 的替代资源不存在：${resource.replacementResourceId}`);
    if (resource.availability === 'unreachable' && !resource.replacementResourceId && !resource.internalFallbackPath) errors.push(`${resource.id} 不可达时必须有替代资源或站内 fallback`);
  }

  for (const resource of manifest.resources) {
    const seen = new Set<string>();
    let current = resource;
    while (current.replacementResourceId) {
      if (seen.has(current.id)) {
        errors.push(`${resource.id} 的替代资源形成循环`);
        break;
      }
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
      failureReason: '当前项目尚未登记独立 starter 或人工走通记录。',
      internalFallbackPath: `/projects/${project.slug}`,
    })),
  };
}

export function resourceStatusLabel(status: DerivedResourceStatus) {
  return { verified: '已验证', pending: '待人工核验', stale: '复核已过期', unavailable: '不可用', unknown: '待自动检查' }[status];
}
