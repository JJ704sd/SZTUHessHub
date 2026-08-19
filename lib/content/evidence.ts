import 'server-only';

import { createHash } from 'node:crypto';
import rawEvidence from '../../content/evidence.json';
import { evidenceDataSchema, type ClaimField, type ClaimRegistryEntry, type EvidenceData, type LinkAvailability, type Project, type SiteData } from './schema';
export { getProjectResourceState, type ProjectResourceState, type ProjectResourceStateKey } from './project-resource-state';

export const evidenceData: EvidenceData = evidenceDataSchema.parse(rawEvidence);

export type FactStatus = 'verified' | 'review_due' | 'disputed' | 'unverified';
export type LinkStatus = LinkAvailability['status'];
export function normalizeClaimContent(value: unknown): string {
  return JSON.stringify(value).replace(/\s+/g, ' ').trim();
}

export function hashClaimContent(value: unknown): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(normalizeClaimContent(value)).digest('hex')}`;
}

export function getClaimValue(data: SiteData, claim: Pick<ClaimRegistryEntry, 'subjectType' | 'subjectId' | 'field'>): unknown {
  if (claim.subjectType === 'major_comparison' && claim.subjectId === 'major-comparison' && claim.field === 'sharedFoundation') return data.siteMeta.home.sharedFoundation;
  if (claim.subjectType === 'major') {
    const subject = data.majors.find((item) => item.id === claim.subjectId);
    if (!subject) return undefined;
    if (claim.field === 'totalCredits') return subject.credits;
    if (claim.field === 'focusTask') return subject.primaryFocus;
    if (claim.field === 'representativeCourseGroup') return subject.representativeCourses;
  }
  if (claim.subjectType === 'dual_lens_case') {
    const subject = data.dualLensCases.find((item) => item.id === claim.subjectId);
    if (!subject) return undefined;
    if (claim.field === 'sharedGoal') return subject.sharedGoal;
    if (claim.field === 'sharedArtifact') return subject.sharedArtifact;
  }
  if (claim.subjectType === 'project') {
    const subject = data.projects.find((item) => item.id === claim.subjectId);
    if (!subject) return undefined;
    if (claim.field === 'dataBoundary') return subject.dataBoundary;
    if (claim.field === 'safetyBoundary') return subject.safetyBoundary;
  }
  return undefined;
}

export function getClaimKey(subjectType: ClaimRegistryEntry['subjectType'], subjectId: string, field: ClaimField): string {
  return `${subjectType}:${subjectId}:${field}`;
}

export function getEvidenceBuildDate(): string {
  const configured = process.env.EVIDENCE_BUILD_DATE ?? process.env.BUILD_DATE;
  if (configured) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(configured)) throw new Error(`EVIDENCE_BUILD_DATE 必须是 YYYY-MM-DD：${configured}`);
    return configured;
  }
  return new Date().toISOString().slice(0, 10);
}

export function getClaimStatus(claim: ClaimRegistryEntry, asOf = new Date(`${getEvidenceBuildDate()}T00:00:00Z`), referenceRecords = evidenceData.evidenceRefs): 'verified' | 'review_due' | 'disputed' | 'unverified' {
  const refs = claim.evidenceRefIds.map((id) => referenceRecords.find((item) => item.id === id)).filter(Boolean);
  if (refs.length !== claim.evidenceRefIds.length) return 'unverified';
  if (refs.some((ref) => ref?.reviewDecision === 'disputed')) return 'disputed';
  if (refs.some((ref) => ref?.owner.includes('待人工复核'))) return 'unverified';
  if (refs.some((ref) => ref && asOf >= new Date(`${ref.reviewDueAt}T00:00:00Z`))) return 'review_due';
  return 'verified';
}

export function getLinkStatus(endpointId: string, data: EvidenceData = evidenceData): LinkStatus {
  return data.linkAvailability.find((item) => item.endpointId === endpointId)?.status ?? 'unverified';
}

export function getClaim(data: SiteData, subjectType: ClaimRegistryEntry['subjectType'], subjectId: string, field: ClaimField): (ClaimRegistryEntry & { status: ReturnType<typeof getClaimStatus> }) | undefined {
  const claim = evidenceData.claims.find((item) => item.key === getClaimKey(subjectType, subjectId, field));
  return claim ? { ...claim, status: getClaimStatus(claim) } : undefined;
}

export function getProjectEndpoints(projectId: string) {
  return evidenceData.endpoints.filter((endpoint) => endpoint.ownerType === 'project' && endpoint.ownerId === projectId);
}

export function getProjectLinkAvailability(projectId: string): LinkAvailability[] {
  const endpointIds = new Set(getProjectEndpoints(projectId).map((endpoint) => endpoint.id));
  return evidenceData.linkAvailability.filter((item) => endpointIds.has(item.endpointId));
}

export function aggregateProjectResourceHealth(projectId: string, links = getProjectLinkAvailability(projectId), endpointList = getProjectEndpoints(projectId)): Project['resourceHealth'] {
  const endpoints = endpointList;
  const endpointById = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint]));
  const linkById = new Map(links.map((link) => [link.endpointId, link]));
  const approvedReplacementUrl = getApprovedReplacementUrl(projectId, links, endpoints);
  const required = endpoints.filter((endpoint) => endpoint.required);
  const optional = endpoints.filter((endpoint) => !endpoint.required);
  const replacementIsAvailable = (link: LinkAvailability) => {
    if (!link.replacementEndpointId) return false;
    const replacement = endpointById.get(link.replacementEndpointId);
    const replacementStatus = linkById.get(link.replacementEndpointId)?.status;
    return replacement?.role === 'replacement' && replacementStatus === 'available';
  };
  if (links.length === 0 || endpoints.some((endpoint) => !linkById.has(endpoint.id))) return { status: 'unverified', checkedAt: '2026-08-17' };
  const requiredUnavailable = required.some((endpoint) => {
    const link = linkById.get(endpoint.id);
    return link?.status === 'unavailable' && !replacementIsAvailable(link);
  });
  if (requiredUnavailable) return { status: 'unavailable', checkedAt: latestCheckDate(links), note: '必要入口不可用，且没有已批准并可用的替代入口。' };
  if (required.some((endpoint) => {
    const link = linkById.get(endpoint.id);
    return link?.status === 'unavailable' && replacementIsAvailable(link);
  })) return { status: 'degraded', checkedAt: latestCheckDate(links), ...(approvedReplacementUrl ? { replacementUrl: approvedReplacementUrl } : {}), note: '必要入口不可用，但已有已批准并可用的替代入口。' };
  if (required.some((endpoint) => ['unverified', 'degraded'].includes(linkById.get(endpoint.id)?.status ?? 'unverified'))) return { status: 'degraded', checkedAt: latestCheckDate(links), note: '必要入口有降级状态或使用了已批准的替代入口。' };
  if (optional.some((endpoint) => linkById.get(endpoint.id)?.status !== 'available')) return { status: 'degraded', checkedAt: latestCheckDate(links), note: '必要来源可用，但部分可选工具入口不可用。' };
  return { status: 'available', checkedAt: latestCheckDate(links) };
}

function latestCheckDate(links: LinkAvailability[]) {
  return links.map((item) => item.checkedAt).sort().at(-1) ?? '2026-08-17';
}

export function getApprovedReplacementUrl(projectId: string, links = getProjectLinkAvailability(projectId), endpoints = getProjectEndpoints(projectId)) {
  const linkById = new Map(links.map((link) => [link.endpointId, link]));
  const approvedReplacementIds = new Set(links.map((link) => link.replacementEndpointId).filter((id): id is string => Boolean(id)));
  const replacement = endpoints.find((endpoint) => endpoint.role === 'replacement' && approvedReplacementIds.has(endpoint.id) && linkById.get(endpoint.id)?.status === 'available');
  return replacement ? replacement.url : undefined;
}
