import { createHash } from 'node:crypto';
import rawEvidence from '../../content/evidence.json';
import type { Project } from '../content';
import { evidenceDataSchema, type ClaimField, type ClaimRegistryEntry, type EvidenceData, type LinkAvailability } from './schema';

export const evidenceData: EvidenceData = evidenceDataSchema.parse(rawEvidence);

export type FactStatus = 'verified' | 'review_due' | 'disputed' | 'unverified';
export type LinkStatus = LinkAvailability['status'];
export type ProjectResourceStateKey = 'ready' | 'alternative' | 'unavailable' | 'unknown';
export type ProjectResourceState = {
  key: ProjectResourceStateKey;
  label: string;
  description: string;
  primaryStatus: LinkStatus;
  alternativeStatus: LinkStatus;
};

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

export function getProjectResourceState(project: Pick<Project, 'endpointIds'>, data: EvidenceData = evidenceData): ProjectResourceState {
  const endpoints = data.endpoints.filter((endpoint) => project.endpointIds.includes(endpoint.id));
  const primary = endpoints.filter((endpoint) => endpoint.role === 'source').map((endpoint) => getLinkStatus(endpoint.id, data));
  const alternatives = endpoints.filter((endpoint) => endpoint.role === 'replacement').map((endpoint) => getLinkStatus(endpoint.id, data));
  const primaryStatus = primary.includes('available') ? 'available' : primary.includes('degraded') ? 'degraded' : primary.includes('unverified') ? 'unverified' : 'unavailable';
  const alternativeStatus = alternatives.includes('available') ? 'available' : alternatives.includes('degraded') ? 'degraded' : alternatives.includes('unverified') ? 'unverified' : 'unavailable';

  if (primaryStatus === 'available') {
    return { key: 'ready', label: '可开始', description: '主要入口最近一次检查可访问。', primaryStatus, alternativeStatus };
  }
  if (alternativeStatus === 'available') {
    return { key: 'alternative', label: '有替代入口', description: '主要入口暂不可用，已登记的替代入口可访问。', primaryStatus, alternativeStatus };
  }
  if (primaryStatus === 'unverified' || alternativeStatus === 'unverified') {
    return { key: 'unknown', label: '需要复核', description: '入口状态未知，先查看资源说明再决定是否开始。', primaryStatus, alternativeStatus };
  }
  return { key: 'unavailable', label: '暂不可开始', description: '主要入口和替代入口都不可用。', primaryStatus, alternativeStatus };
}

export function getClaim(subjectType: ClaimRegistryEntry['subjectType'], subjectId: string, field: ClaimField, data: EvidenceData = evidenceData) {
  return data.claims.find((claim) => claim.subjectType === subjectType && claim.subjectId === subjectId && claim.field === field);
}
