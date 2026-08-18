import rawEvidence from '../../content/evidence.json';
import type { Project } from '../content';

export type ProjectLinkStatus = 'available' | 'degraded' | 'unavailable' | 'unverified';
export type ProjectResourceStateKey = 'ready' | 'alternative' | 'unavailable' | 'unknown';
export type ProjectResourceState = {
  key: ProjectResourceStateKey;
  label: string;
  description: string;
  primaryStatus: ProjectLinkStatus;
  alternativeStatus: ProjectLinkStatus;
};

const evidence = rawEvidence as { endpoints: Array<{ id: string; ownerType: string; ownerId: string; role: string }>; linkAvailability: Array<{ endpointId: string; status: ProjectLinkStatus }> };

export function getProjectResourceState(project: Pick<Project, 'endpointIds'>): ProjectResourceState {
  const endpoints = evidence.endpoints.filter((endpoint) => project.endpointIds.includes(endpoint.id));
  const statusFor = (endpointId: string): ProjectLinkStatus => evidence.linkAvailability.find((item) => item.endpointId === endpointId)?.status ?? 'unverified';
  const collectStatus = (role: string): ProjectLinkStatus => {
    const statuses = endpoints.filter((endpoint) => endpoint.role === role).map((endpoint) => statusFor(endpoint.id));
    return statuses.includes('available') ? 'available' : statuses.includes('degraded') ? 'degraded' : statuses.includes('unverified') ? 'unverified' : 'unavailable';
  };
  const primaryStatus = collectStatus('source');
  const alternativeStatus = collectStatus('replacement');
  if (primaryStatus === 'available') return { key: 'ready', label: '可开始', description: '主要入口最近一次检查可访问。', primaryStatus, alternativeStatus };
  if (alternativeStatus === 'available') return { key: 'alternative', label: '有替代入口', description: '主要入口暂不可用，已登记的替代入口可访问。', primaryStatus, alternativeStatus };
  if (primaryStatus === 'unverified' || alternativeStatus === 'unverified') return { key: 'unknown', label: '需要复核', description: '入口状态未知，先查看资源说明再决定是否开始。', primaryStatus, alternativeStatus };
  return { key: 'unavailable', label: '暂不可开始', description: '主要入口和替代入口都不可用。', primaryStatus, alternativeStatus };
}
