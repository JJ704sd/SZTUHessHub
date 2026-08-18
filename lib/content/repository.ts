import rawPathwayData from '../../content/pathways.json';
import { siteData, type Capability, type Project, type Scenario, type Source } from '../content';
import { evidenceData, getClaim, getClaimStatus, getLinkStatus, hashClaimContent, type FactStatus, type LinkStatus } from './evidence';
import { parsePathwayData, type EvidenceTransformation, type Pathway, type PathwayData } from './schema';

function ids<T extends { id: string }>(items: T[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

function requireReference(referenceSet: Set<string>, value: string, label: string) {
  if (!referenceSet.has(value)) throw new Error(`${label} 引用了不存在的 ID：${value}`);
}

function validatePathwayReferences(data: PathwayData) {
  const capabilityIds = ids(siteData.capabilities);
  const projectIds = ids(siteData.projects);
  const scenarioIds = ids(siteData.scenarios);
  const sourceIds = ids(siteData.sources);
  const artifactIds = ids(data.artifacts);
  const pathwayIds = ids(data.pathways);
  const claims = new Map(evidenceData.claims.map((claim) => [claim.key, claim]));
  const evidenceRefs = new Map(evidenceData.evidenceRefs.map((ref) => [ref.id, ref]));
  const endpoints = new Map(evidenceData.endpoints.map((endpoint) => [endpoint.id, endpoint]));
  const linkAvailability = new Map(evidenceData.linkAvailability.map((item) => [item.endpointId, item]));
  const kinds = new Set(data.pathways.map((pathway) => pathway.kind));

  if (data.pathways.length !== 5 || kinds.size !== 5) throw new Error('Pathway 必须恰好包含五类不重复 kind');

  for (const pathway of data.pathways) {
    pathway.capabilityIds.forEach((id) => requireReference(capabilityIds, id, `${pathway.id}.capabilityIds`));
    pathway.projectIds.forEach((id) => requireReference(projectIds, id, `${pathway.id}.projectIds`));
    pathway.scenarioIds.forEach((id) => requireReference(scenarioIds, id, `${pathway.id}.scenarioIds`));
    pathway.artifactIds.forEach((id) => requireReference(artifactIds, id, `${pathway.id}.artifactIds`));
    pathway.sourceIds.forEach((id) => {
      requireReference(sourceIds, id, `${pathway.id}.sourceIds`);
      const source = siteData.sources.find((item) => item.id === id);
      if (!source?.authorityTier) throw new Error(`${pathway.id}.sourceIds.${id} 必须显式声明 authorityTier`);
    });
    pathway.endpointIds.forEach((id) => {
      const endpoint = endpoints.get(id);
      if (!endpoint) throw new Error(`${pathway.id}.endpointIds 引用了不存在的 endpoint：${id}`);
      if (endpoint.ownerType !== 'pathway' || endpoint.ownerId !== pathway.id) throw new Error(`endpoint ${id} 的 owner 与路径 ${pathway.id} 不一致`);
      if (!linkAvailability.has(id)) throw new Error(`endpoint ${id} 缺少 linkAvailability`);
    });

    const eligibilityClaim = pathway.claimKeys.map((key) => claims.get(key)).find((claim) => claim?.field === 'eligibilityBoundary');
    if (!eligibilityClaim) throw new Error(`${pathway.id} 的 eligibilityBoundary 必须有对应 claim`);
    pathway.claimKeys.forEach((key) => {
      const claim = claims.get(key);
      if (!claim) throw new Error(`${pathway.id}.claimKeys 缺少 claim：${key}`);
      if (claim.subjectType !== 'pathway' || claim.subjectId !== pathway.id) throw new Error(`claim ${key} 的 subject 不是 ${pathway.id}`);
      if (claim.field === 'eligibilityBoundary' && hashClaimContent(pathway.eligibilityBoundary) !== claim.normalizedContentHash) {
        throw new Error(`${key} 的 normalizedContentHash 与 eligibilityBoundary 不一致`);
      }
      claim.evidenceRefIds.forEach((refId) => {
        const ref = evidenceRefs.get(refId);
        if (!ref) throw new Error(`claim ${key} 缺少 evidenceRef：${refId}`);
        requireReference(new Set(pathway.sourceIds), ref.sourceId, `${key}.evidenceRef.sourceId`);
        if (ref.endpointId) requireReference(new Set(pathway.endpointIds), ref.endpointId, `${key}.evidenceRef.endpointId`);
      });
    });
  }

  const transformationsByPathway = new Map<string, EvidenceTransformation[]>();
  for (const transformation of data.evidenceTransformations) {
    requireReference(pathwayIds, transformation.pathwayId, 'evidenceTransformations.pathwayId');
    requireReference(artifactIds, transformation.sourceArtifactId, 'evidenceTransformations.sourceArtifactId');
    const pathway = data.pathways.find((item) => item.id === transformation.pathwayId)!;
    requireReference(new Set(pathway.artifactIds), transformation.sourceArtifactId, `${pathway.id}.evidenceTransformations.sourceArtifactId`);
    const list = transformationsByPathway.get(transformation.pathwayId) ?? [];
    list.push(transformation);
    transformationsByPathway.set(transformation.pathwayId, list);
  }
  data.pathways.forEach((pathway) => {
    if ((transformationsByPathway.get(pathway.id) ?? []).length < 1) throw new Error(`${pathway.id} 必须至少有一项 evidence transformation`);
  });

  const launch = data.homePlan.pathwayLaunch;
  if (new Set(launch.pathwayIds).size !== 5 || new Set(launch.pathwayIds).size !== pathwayIds.size || launch.pathwayIds.some((id) => !pathwayIds.has(id))) {
    throw new Error('homePlan.pathwayLaunch.pathwayIds 必须恰好覆盖五条路径');
  }
  requireReference(artifactIds, launch.featuredArtifactId, 'homePlan.pathwayLaunch.featuredArtifactId');
}

let parsedPathwayData: PathwayData | undefined;

export function getPathwayData(): PathwayData {
  if (!parsedPathwayData) {
    const parsed = parsePathwayData(rawPathwayData);
    validatePathwayReferences(parsed);
    parsedPathwayData = parsed;
  }
  return parsedPathwayData;
}

export function getPathways(): Pathway[] {
  return getPathwayData().pathways;
}

export function getPathwayBySlug(slug: string): Pathway | undefined {
  return getPathways().find((pathway) => pathway.slug === slug);
}

export function getPathwayById(id: string): Pathway | undefined {
  return getPathways().find((pathway) => pathway.id === id);
}

export function getPathwayArtifact(id: string) {
  return getPathwayData().artifacts.find((artifact) => artifact.id === id);
}

export function getPathwayTransformation(pathwayId: string): EvidenceTransformation | undefined {
  return getPathwayData().evidenceTransformations.find((item) => item.pathwayId === pathwayId);
}

export type PathwayEvidenceView = {
  claimStatus: FactStatus;
  linkStatuses: Array<{ endpointId: string; status: LinkStatus; url: string }>;
  sources: Array<Pick<Source, 'id' | 'title' | 'url' | 'version' | 'scope' | 'lastVerified' | 'authorityTier'>>;
};

export function getPathwayEvidence(pathway: Pathway): PathwayEvidenceView {
  const claim = getClaim('pathway', pathway.id, 'eligibilityBoundary');
  const evidenceEndpoints = evidenceData.endpoints.filter((endpoint) => pathway.endpointIds.includes(endpoint.id));
  return {
    claimStatus: claim ? getClaimStatus(claim) : 'unverified',
    linkStatuses: evidenceEndpoints.map((endpoint) => ({ endpointId: endpoint.id, status: getLinkStatus(endpoint.id), url: endpoint.url })),
    sources: pathway.sourceIds.map((id) => {
      const source = siteData.sources.find((item) => item.id === id);
      if (!source) throw new Error(`路径来源缺失：${id}`);
      return { id: source.id, title: source.title, url: source.url, version: source.version, scope: source.scope, lastVerified: source.lastVerified, authorityTier: source.authorityTier };
    }),
  };
}

export function getRelatedCapabilities(pathway: Pathway): Capability[] {
  return pathway.capabilityIds.map((id) => siteData.capabilities.find((item) => item.id === id)).filter((item): item is Capability => Boolean(item));
}

export function getRelatedProjects(pathway: Pathway): Project[] {
  return pathway.projectIds.map((id) => siteData.projects.find((item) => item.id === id)).filter((item): item is Project => Boolean(item));
}

export function getRelatedScenarios(pathway: Pathway): Scenario[] {
  return pathway.scenarioIds.map((id) => siteData.scenarios.find((item) => item.id === id)).filter((item): item is Scenario => Boolean(item));
}
