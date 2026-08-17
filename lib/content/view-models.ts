import { siteConfig } from '../site-config';
import { evidenceData, getClaimStatus, getProjectEndpoints, getProjectLinkAvailability } from './evidence';
import { getSiteData } from './repository';
import type { Capability, ClaimRegistryEntry, HomePlan, LinkAvailability, Major, Project, Scenario, SiteData } from './schema';

export type RelationLink = { id: string; slug: string; label: string; href: string };
export type TaskLink = { id: string; label: string; summary: string; href: string; icon: string; isPrimary: boolean };
export type ClaimView = ClaimRegistryEntry & {
  status: 'verified' | 'review_due' | 'disputed' | 'unverified';
  evidenceHref: string;
  evidence: Array<{ id: string; sourceId: string; title: string; version: string; accessType: string; accessScope: string; url?: string; locator?: string; reviewedAt: string; reviewDueAt: string; owner: string }>;
};
export type ProjectCatalogItem = {
  id: string;
  slug: string;
  title: string;
  navigationLabel: string;
  cardSummary: string;
  majorIds: string[];
  capabilityIds: string[];
  scenarioIds: string[];
  viewpoint: string;
  durationBands: string[];
  durationLabel: string;
  prerequisiteSummary: string;
  outputSummary: string;
  dataStatus: string;
  dataSensitivity: string;
  mode: Project['mode'];
  visualAssetId: string;
  visualAsset: { src: string; width: number; height: number; alt: string };
  primaryAction: Project['primaryAction'];
  resourceHealth: Project['resourceHealth'];
};

export type ProjectDetailView = ProjectCatalogItem & {
  linkAvailability: LinkAvailability[];
  endpoints: ReturnType<typeof getProjectEndpoints>;
  dataBoundary: string;
  safetyBoundary: string;
  quickTry: Project['quickTry'];
  claims: { dataBoundary: ClaimView; safetyBoundary: ClaimView };
};

export type HomePageModel = {
  primaryJourneyId: HomePlan['primaryJourneyId'];
  showExploreSection: boolean;
  explanatoryText: string;
  tasks: TaskLink[];
  modules: Array<{ id: string; title: string }>;
  majors: Array<Pick<Major, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary' | 'primaryFocus' | 'representativeCourses'> & { claims: ClaimView[] }>;
  sharedFoundation: string[];
  collaboration: { title: string; summary: string; caseSlug: string; artifact: string; claims: ClaimView[] };
  capabilities: Array<Pick<Capability, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  projects: ProjectCatalogItem[];
  scenarios: Array<Pick<Scenario, 'id' | 'slug' | 'name' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  faq: { id: string; question: string };
  trust: { cohort: string; sourceLabel: string; boundary: string; evidenceHref: string; claimStatus: ClaimView['status'] };
};

function mapClaim(data: SiteData, claim: ClaimRegistryEntry): ClaimView {
  const refs = claim.evidenceRefIds.map((id) => evidenceData.evidenceRefs.find((item) => item.id === id)).filter(Boolean);
  const evidence = refs.map((ref) => {
    const source = data.sources.find((item) => item.id === ref!.sourceId);
    if (!source) throw new Error(`证据 ${ref!.id} 缺少来源 ${ref!.sourceId}`);
    return { id: ref!.id, sourceId: ref!.sourceId, title: source.title, version: source.version, accessType: source.accessType, accessScope: source.accessScope, ...(source.url ? { url: source.url } : {}), locator: ref!.locator, reviewedAt: ref!.reviewedAt, reviewDueAt: ref!.reviewDueAt, owner: ref!.owner };
  });
  return {
    ...claim,
    status: getClaimStatus(claim),
    evidenceHref: evidence[0] ? `/sources#${evidence[0].sourceId}` : '/sources',
    evidence,
  };
}

function claimFor(data: SiteData, subjectType: ClaimRegistryEntry['subjectType'], subjectId: string, field: ClaimRegistryEntry['field']) {
  const claim = evidenceData.claims.find((item) => item.key === `${subjectType}:${subjectId}:${field}`);
  if (!claim) throw new Error(`P0 claim 缺失：${subjectType}:${subjectId}:${field}`);
  return mapClaim(data, claim);
}

function selectByIds<T extends { id: string }>(collection: T[], ids: string[], label: string): T[] {
  return ids.map((id) => {
    const item = collection.find((entry) => entry.id === id);
    if (!item) throw new Error(`${label} 缺少登记实体 ${id}`);
    return item;
  });
}

function mapProject(project: Project, data = getSiteData()): ProjectCatalogItem {
  const asset = data.mediaAssets.find((item) => item.id === project.visualAssetId);
  if (!asset) throw new Error(`项目 ${project.id} 缺少视觉资产 ${project.visualAssetId}`);
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    navigationLabel: project.navigationLabel,
    cardSummary: project.cardSummary,
    majorIds: project.majorIds,
    capabilityIds: project.capabilityIds,
    scenarioIds: project.scenarioIds,
    viewpoint: project.viewpoint,
    durationBands: project.durationBands,
    durationLabel: project.duration,
    prerequisiteSummary: project.prerequisites[0] ?? '查看体验卡中的开始条件',
    outputSummary: project.outputSummary,
    dataStatus: project.dataAccess,
    dataSensitivity: project.data.sensitivity,
    mode: project.mode,
    visualAssetId: project.visualAssetId,
    visualAsset: { src: asset.src, width: asset.width, height: asset.height, alt: asset.alt },
    primaryAction: project.primaryAction,
    resourceHealth: project.resourceHealth,
  };
}

function mapProjectDetail(project: Project, data = getSiteData()): ProjectDetailView {
  return {
    ...mapProject(project, data),
    linkAvailability: getProjectLinkAvailability(project.id),
    endpoints: getProjectEndpoints(project.id),
    dataBoundary: project.dataBoundary,
    safetyBoundary: project.safetyBoundary,
    quickTry: project.quickTry,
    claims: {
      dataBoundary: claimFor(data, 'project', project.id, 'dataBoundary'),
      safetyBoundary: claimFor(data, 'project', project.id, 'safetyBoundary'),
    },
  };
}

export function getProjectCatalog(): {
  items: ProjectCatalogItem[];
  filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] };
} {
  const data = getSiteData();
  return {
    items: data.projects.map((project) => mapProject(project, data)),
    filters: {
      major: data.majors.map((item) => ({ id: item.id, slug: item.slug, label: item.shortName, href: `/majors/${item.slug}` })),
      capability: data.capabilities.map((item) => ({ id: item.id, slug: item.slug, label: item.shortName, href: `/capabilities/${item.slug}` })),
      scenario: data.scenarios.map((item) => ({ id: item.id, slug: item.slug, label: item.name, href: `/scenarios/${item.slug}` })),
      viewpoint: Array.from(new Set(data.projects.map((item) => item.viewpoint))),
      duration: Array.from(new Set(data.projects.flatMap((item) => item.durationBands))),
    },
  };
}

export function getHomePageModel(): HomePageModel {
  const data = getSiteData();
  const home = data.siteMeta.home;
  const selectedMajors = selectByIds(data.majors, home.majorIds, '首页专业');
  const selectedCapabilities = selectByIds(data.capabilities, home.capabilityIds, '首页能力');
  const selectedProjects = selectByIds(data.projects, home.projectIds, '首页项目');
  const selectedScenarios = selectByIds(data.scenarios, home.scenarioIds, '首页场景');
  const collaborationCase = data.dualLensCases.find((item) => item.id === home.featuredDualLensCaseId);
  const faq = data.faqs.find((item) => item.id === home.faqId);
  if (!collaborationCase || !faq) throw new Error('首页显式编排引用缺失');
  const tasks = [
    { id: 'compare', label: '看懂两个专业', summary: '共同底座、不同侧重、如何协作', href: '/majors', icon: '⇄' },
    { id: 'capability', label: '从能力看任务', summary: '课程能形成什么能力、可以做什么', href: '/capabilities', icon: '◌' },
    { id: 'project', label: '试一个项目', summary: '先看时长、基础和产出，再决定是否开始', href: '/projects', icon: '↗' },
  ].map((task) => ({ ...task, isPrimary: task.id === home.primaryJourneyId }));
  const sharedFoundationClaim = claimFor(data, 'major_comparison', 'major-comparison', 'sharedFoundation');
  return {
    primaryJourneyId: home.primaryJourneyId,
    showExploreSection: home.showExploreSection,
    explanatoryText: '先从一个任务开始：看懂两个专业、从能力找任务，或先试一张项目体验卡。',
    tasks,
    modules: [
      { id: 'tasks', title: '任务入口' },
      { id: 'compare', title: '双专业一屏对照' },
      { id: 'projects', title: '今天先试一个' },
      { id: 'explore', title: '场景与继续探索' },
    ],
    majors: selectedMajors.map((item) => ({ id: item.id, slug: item.slug, name: item.name, shortName: item.shortName, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary, primaryFocus: item.primaryFocus, representativeCourses: item.representativeCourses, claims: [claimFor(data, 'major', item.id, 'focusTask'), claimFor(data, 'major', item.id, 'representativeCourseGroup'), claimFor(data, 'major', item.id, 'totalCredits')] })),
    sharedFoundation: home.sharedFoundation,
    collaboration: { title: collaborationCase.title, summary: collaborationCase.sharedGoal, caseSlug: collaborationCase.slug, artifact: collaborationCase.sharedArtifact, claims: [claimFor(data, 'dual_lens_case', collaborationCase.id, 'sharedGoal'), claimFor(data, 'dual_lens_case', collaborationCase.id, 'sharedArtifact')] },
    capabilities: selectedCapabilities.map((item) => ({ id: item.id, slug: item.slug, name: item.name, shortName: item.shortName, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary })),
    projects: selectedProjects.map((project) => mapProject(project, data)),
    scenarios: selectedScenarios.map((item) => ({ id: item.id, slug: item.slug, name: item.name, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary })),
    faq: { id: faq.id, question: faq.question },
    trust: { cohort: siteConfig.currentCohort, sourceLabel: '专业与课程信息基于 2025 级培养方案', boundary: '公开只读 · 不接入真实患者数据', evidenceHref: sharedFoundationClaim.evidenceHref, claimStatus: sharedFoundationClaim.status },
  };
}

export function getMajorsPageModel() {
  const data = getSiteData();
  const majorIds = data.siteMeta.home.majorIds;
  const source = data.sources.find((item) => item.id === 'source-college-profile');
  return {
    majors: selectByIds(data.majors, majorIds, '专业目录'),
    dualLensCases: data.dualLensCases,
    sharedFoundation: data.siteMeta.home.sharedFoundation,
    source,
    claims: {
      sharedFoundation: claimFor(data, 'major_comparison', 'major-comparison', 'sharedFoundation'),
      majors: majorIds.map((id) => ({
        majorId: id,
        focusTask: claimFor(data, 'major', id, 'focusTask'),
        representativeCourseGroup: claimFor(data, 'major', id, 'representativeCourseGroup'),
        totalCredits: claimFor(data, 'major', id, 'totalCredits'),
      })),
    },
    currentCohort: siteConfig.currentCohort,
  };
}

export function getMajorComparisonPageModel() {
  const data = getSiteData();
  const model = getMajorsPageModel();
  return {
    ...model,
    capabilities: data.capabilities,
    projects: data.projects.map((project) => mapProject(project, data)),
    scenarios: data.scenarios,
  };
}

export function getCapabilityDetailModel(slugOrId: string) {
  const data = getSiteData();
  const capability = data.capabilities.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!capability) return undefined;
  return {
    capability,
    majors: capability.majorEvidence.map((evidence) => ({ ...evidence, major: data.majors.find((item) => item.id === evidence.majorId) })).filter((item) => item.major),
    projects: data.projects.filter((item) => item.capabilityIds.includes(capability.id)).map((project) => mapProject(project, data)),
    scenarios: data.scenarios.filter((item) => item.sharedCapabilities.includes(capability.id)),
  };
}

export function getProjectDetailModel(slugOrId: string) {
  const data = getSiteData();
  const project = data.projects.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!project) return undefined;
  return {
    project,
    catalog: mapProjectDetail(project, data),
    majors: project.majorIds.map((id) => data.majors.find((item) => item.id === id)).filter(Boolean),
    capabilities: project.capabilityIds.map((id) => data.capabilities.find((item) => item.id === id)).filter(Boolean),
    scenarios: project.scenarioIds.map((id) => data.scenarios.find((item) => item.id === id)).filter(Boolean),
  };
}

export function getScenarioDetailModel(slugOrId: string) {
  const data = getSiteData();
  const scenario = data.scenarios.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!scenario) return undefined;
  return {
    scenario,
    capabilities: scenario.sharedCapabilities.map((id) => data.capabilities.find((item) => item.id === id)).filter(Boolean),
    projects: data.projects.filter((item) => item.scenarioIds.includes(scenario.id)).map((project) => mapProject(project, data)),
  };
}

export function getContentRelationMaps(data: SiteData = getSiteData()) {
  return {
    majors: new Map(data.majors.map((item) => [item.id, item])),
    capabilities: new Map(data.capabilities.map((item) => [item.id, item])),
    projects: new Map(data.projects.map((item) => [item.id, item])),
    scenarios: new Map(data.scenarios.map((item) => [item.id, item])),
  };
}
