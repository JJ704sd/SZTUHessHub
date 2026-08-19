import { createHash } from 'node:crypto';
import rawEvidence from '../../content/evidence.json';
import { evidenceDataSchema, type ClaimField, type ClaimRegistryEntry, type EvidenceData, type LinkAvailability } from './schema';
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

export function getClaimStatus(claim: ClaimRegistryEntry, asOf = new Date(), data: EvidenceData = evidenceData): FactStatus {
  const refs = claim.evidenceRefIds.map((id) => data.evidenceRefs.find((ref) => ref.id === id));
  if (refs.some((ref) => !ref)) return 'unverified';
  if (refs.some((ref) => ref?.reviewDecision === 'disputed')) return 'disputed';
  if (refs.some((ref) => ref && asOf >= new Date(`${ref.reviewDueAt}T00:00:00Z`))) return 'review_due';
  return 'verified';
}

export function getLinkStatus(endpointId: string, data: EvidenceData = evidenceData): LinkStatus {
  return data.linkAvailability.find((item) => item.endpointId === endpointId)?.status ?? 'unverified';
}

export function getClaim(subjectType: ClaimRegistryEntry['subjectType'], subjectId: string, field: ClaimField, data: EvidenceData = evidenceData) {
  return data.claims.find((claim) => claim.subjectType === subjectType && claim.subjectId === subjectId && claim.field === field);
}
