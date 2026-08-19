import { siteConfig } from '../site-config';
/* Release A 聚合首页模型已由 origin/main 的模块化模型取代。
import { evidenceData, getClaimStatus, getLinkStatus, type FactStatus, type LinkStatus } from './evidence';
import { getPathwayData, getPathwayEvidence, getRelatedCapabilities, getRelatedProjects, getRelatedScenarios } from './repository';
import { contentUpdates, siteData, type ContentUpdate, type DualLensCase, type FaqItem, type Project } from '../content';
import type { ActionHorizon, EvidenceTransformation, Pathway, PathwayArtifact, PathwayKind, StartMode } from './schema';

const startModeCopy: Record<StartMode, { label: string; summary: string; href: string }> = {
  'has-direction': { label: '我已经有个方向', summary: '想找工作、深造、公共服务、留学或做独立项目', href: '/pathways?start=has-direction' },
  'from-assets': { label: '从课程和项目出发', summary: '先看手里的能力与作品还能怎样转换成证据', href: '/pathways?start=from-assets' },
  undecided: { label: '我还没想好', summary: '同时看两条路，先试再选，不急着一次决定', href: '/pathways/explore?start=undecided' },
};

export type PathwayActionView = {
  id: string;
  horizon: ActionHorizon;
  title: string;
  output: string;
  stopCondition: string;
  cannotProve: string;
  nextStep: string;
  steps: string[];
  externalActionRequired: boolean;
};

export type PathwaySummaryView = {
  id: string;
  slug: string;
  kind: PathwayKind;
  title: string;
  question: string;
  dailyTask: string;
  reusableAssets: string[];
  additionalGate: string;
  defaultAction: PathwayActionView;
  href: string;
};

export type HomePageModel = {
  startModes: Array<{ id: StartMode; label: string; summary: string; href: string }>;
  taskEntries: Array<{ id: string; label: string; summary: string; href: string; primary?: boolean }>;
  featuredProjects: Project[];
  featuredDualLensCase?: DualLensCase;
  faqs: FaqItem[];
  updates: Array<ContentUpdate & { entityTitle: string; href: string }>;
  pathways: PathwaySummaryView[];
  evidence: {
    artifact: Pick<PathwayArtifact, 'id' | 'title' | 'description' | 'owner' | 'updatedAt' | 'reviewDueAt'> & { projectSlug: string };
    transformations: Array<Pick<EvidenceTransformation, 'pathwayId' | 'evidenceUse' | 'missingProof' | 'truthfulFraming' | 'owner' | 'updatedAt' | 'reviewDueAt'> & { pathwayTitle: string }>;
  };
  actionLadder: Array<{ horizon: ActionHorizon; label: string; actions: Array<{ pathwayTitle: string; title: string; output: string }> }>;
  trust: {
    factStatus: FactStatus;
    linkStatuses: Array<{ endpointId: string; status: LinkStatus }>;
    sources: Array<{ id: string; title: string; url: string; version: string; scope: string; lastVerified: string; authorityTier?: string }>;
  };
  contextLinks: Array<{ href: string; label: string }>;
  cohort: string;
};

const horizonLabels: Record<ActionHorizon, string> = {
  '15-minutes': '15 分钟看懂',
  '7-days': '7 天试路',
  '30-days': '30 天做证据',
  semester: '一学期复盘',
};

function actionView(action: Pathway['actions'][number]): PathwayActionView {
  return {
    id: action.id,
    horizon: action.horizon,
    title: action.title,
    output: action.output,
    stopCondition: action.stopCondition,
    cannotProve: action.cannotProve,
    nextStep: action.nextStep,
    steps: action.steps,
    externalActionRequired: action.externalActionRequired,
  };
}

function pathwaySummary(pathway: Pathway): PathwaySummaryView {
  return {
    id: pathway.id,
    slug: pathway.slug,
    kind: pathway.kind,
    title: pathway.title,
    question: pathway.question,
    dailyTask: pathway.dailyTasks[0],
    reusableAssets: pathway.reusableAssets.slice(0, 2),
    additionalGate: pathway.additionalGates[0],
    defaultAction: actionView(pathway.actions.find((action) => action.horizon === '15-minutes') ?? pathway.actions[0]),
    href: `/pathways/${pathway.slug}`,
  };
}

function isEditoriallyCurrent(item: { reviewDueAt: string }) {
  return item.reviewDueAt >= new Date().toISOString().slice(0, 10);
}

function getUpdateEntity(update: ContentUpdate): { title: string; href: string } | undefined {
  if (update.entityType === 'project') {
    const project = siteData.projects.find((item) => item.id === update.entityId);
    return project ? { title: project.title, href: `/projects/${project.slug}` } : undefined;
  }
  if (update.entityType === 'faq') {
    const faq = siteData.faqs.find((item) => item.id === update.entityId);
    return faq ? { title: faq.question, href: `/majors/faq#${faq.slug}` } : undefined;
  }
  if (update.entityType === 'dual-lens-case') {
    const dualLensCase = siteData.dualLensCases.find((item) => item.id === update.entityId);
    return dualLensCase ? { title: dualLensCase.title, href: `/majors/compare#${dualLensCase.slug}` } : undefined;
  }
  const source = siteData.sources.find((item) => item.id === update.entityId);
  return source ? { title: source.title, href: `/sources#${source.id}` } : undefined;
}

export function getHomePageModel(): HomePageModel {
  const pathwayData = getPathwayData();
  const homePlan = siteData.siteMeta.home;
  const orderedPathways = pathwayData.homePlan.pathwayLaunch.pathwayIds.map((id) => pathwayData.pathways.find((pathway) => pathway.id === id)!);
  const summaries = orderedPathways.map(pathwaySummary);
  const featuredArtifact = pathwayData.artifacts.filter(isEditoriallyCurrent).find((artifact) => artifact.id === pathwayData.homePlan.pathwayLaunch.featuredArtifactId) ?? pathwayData.artifacts.filter(isEditoriallyCurrent)[0];
  if (!featuredArtifact) throw new Error('首页没有可用的当前产物');
  const project = siteData.projects.find((item) => item.id === featuredArtifact.projectId);
  if (!project) throw new Error(`首页 featured artifact 缺少项目：${featuredArtifact.projectId}`);
  const transformations = pathwayData.evidenceTransformations
    .filter((item) => item.sourceArtifactId === featuredArtifact.id && isEditoriallyCurrent(item) && pathwayData.pathways.some((pathway) => pathway.id === item.pathwayId && isEditoriallyCurrent(pathway)))
    .map((item) => ({
      pathwayId: item.pathwayId,
      pathwayTitle: pathwayData.pathways.find((pathway) => pathway.id === item.pathwayId)!.title,
      evidenceUse: item.evidenceUse,
      missingProof: item.missingProof,
      truthfulFraming: item.truthfulFraming,
      owner: item.owner,
      updatedAt: item.updatedAt,
      reviewDueAt: item.reviewDueAt,
    }));
  if (transformations.length < 2) throw new Error('首页 featured artifact 至少需要两条当前路径改写');
  const firstEvidence = getPathwayEvidence(orderedPathways[0]);
  const actions = (['15-minutes', '7-days', '30-days', 'semester'] as ActionHorizon[]).map((horizon) => ({
    horizon,
    label: horizonLabels[horizon],
    actions: orderedPathways.map((pathway) => ({
      pathwayTitle: pathway.title,
      title: actionView(pathway.actions.find((action) => action.horizon === horizon) ?? pathway.actions[0]).title,
      output: actionView(pathway.actions.find((action) => action.horizon === horizon) ?? pathway.actions[0]).output,
    })),
  }));
  const featuredProjects = (homePlan?.projectIds ?? siteData.projects.slice(0, 3).map((project) => project.id))
    .map((id) => siteData.projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project))
    .filter(isEditoriallyCurrent)
    .slice(0, 3);
  const currentFaqs = siteData.faqs.filter(isEditoriallyCurrent).slice(0, 3);
  const updates = contentUpdates
    .map((update) => ({ update, entity: getUpdateEntity(update) }))
    .filter((item): item is { update: ContentUpdate; entity: { title: string; href: string } } => Boolean(item.entity))
    .sort((a, b) => b.update.publishedAt.localeCompare(a.update.publishedAt) || a.update.id.localeCompare(b.update.id))
    .slice(0, 3)
    .map(({ update, entity }) => ({ ...update, entityTitle: entity.title, href: entity.href }));
  const featuredDualLensCase = siteData.dualLensCases.find((item) => item.id === homePlan?.featuredDualLensCaseId && isEditoriallyCurrent(item)) ?? siteData.dualLensCases.find(isEditoriallyCurrent);
  if (featuredProjects.length < 3) throw new Error('首页精选项目当前内容少于 3 项');
  if (currentFaqs.length < 3) throw new Error('首页 FAQ 当前内容少于 3 项');
  if (!featuredDualLensCase) throw new Error('首页没有当前双专业案例');
  return {
    startModes: pathwayData.homePlan.pathwayLaunch.startModeOrder.map((id) => ({ id, ...startModeCopy[id] })),
    taskEntries: [
      { id: 'compare', label: '看懂两个专业', summary: '同一个问题，两边分别会先做什么', href: '/majors/compare', primary: true },
      { id: 'project', label: '挑一个小项目', summary: '先看时长、基础和产出，再决定开始', href: '/projects' },
      { id: 'undecided', label: '我还没想好', summary: '先试两种任务，再比较自己愿意继续哪种', href: '/pathways/explore' },
    ],
    featuredProjects,
    featuredDualLensCase,
    faqs: currentFaqs,
    updates,
    pathways: summaries,
    evidence: {
      artifact: { id: featuredArtifact.id, title: featuredArtifact.title, description: featuredArtifact.description, projectSlug: project.slug, owner: featuredArtifact.owner, updatedAt: featuredArtifact.updatedAt, reviewDueAt: featuredArtifact.reviewDueAt },
      transformations,
    },
    actionLadder: actions,
    trust: { factStatus: firstEvidence.claimStatus, linkStatuses: firstEvidence.linkStatuses.map(({ endpointId, status }) => ({ endpointId, status })), sources: firstEvidence.sources.map(({ id, title, url, version, scope, lastVerified, authorityTier }) => ({ id, title, url, version, scope, lastVerified, authorityTier })) },
    contextLinks: [
      { href: '/majors/compare', label: '还在选专业？回到双专业对照' },
      { href: `/projects/${project.slug}`, label: '打开这份项目体验卡' },
      { href: '/capabilities', label: '从能力地图继续' },
      { href: '/scenarios', label: '按场景核对边界' },
    ],
    cohort: siteConfig.currentCohort,
  };
}

export function getPathwayDetailModel(pathway: Pathway) {
  const evidence = getPathwayEvidence(pathway);
  const transformations = getPathwayData().evidenceTransformations.filter((item) => item.pathwayId === pathway.id);
  return {
    pathway,
    capabilities: getRelatedCapabilities(pathway),
    projects: getRelatedProjects(pathway),
    scenarios: getRelatedScenarios(pathway),
    transformations,
*/
import rawUpdates from '../../content/updates.json';
import { evidenceData, getClaimStatus, getProjectEndpoints, getProjectLinkAvailability, type FactStatus, type LinkStatus } from './evidence';
import { getPathwayData, getPathwayEvidence, getRelatedCapabilities, getRelatedProjects, getRelatedScenarios, getSiteData } from './repository';
import { contentUpdatesSchema, type ActionHorizon, type Capability, type ClaimRegistryEntry, type ContentUpdate, type EvidenceTransformation, type HomePlan, type LinkAvailability, type Major, type Pathway, type PathwayArtifact, type PathwayKind, type Project, type Scenario, type SiteData, type StartMode } from './schema';

const contentUpdates = contentUpdatesSchema.parse(rawUpdates);

const startModeCopy: Record<StartMode, { label: string; summary: string; href: string }> = {
  'has-direction': { label: '我已经有个方向', summary: '想找工作、深造、公共服务、留学或做独立项目', href: '/pathways?start=has-direction' },
  'from-assets': { label: '从课程和项目出发', summary: '先看手里的能力与作品还能怎样转换成证据', href: '/pathways?start=from-assets' },
  undecided: { label: '我还没想好', summary: '同时看两条路，先试再选，不急着一次决定', href: '/pathways/explore?start=undecided' },
};

const horizonLabels: Record<ActionHorizon, string> = {
  '15-minutes': '15 分钟看懂',
  '7-days': '7 天试路',
  '30-days': '30 天做证据',
  semester: '一学期复盘',
};

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

export type ProjectIntent = 'quick-look' | 'data-ai' | 'sensor' | 'portfolio';
export type ProjectIntentView = {
  id: ProjectIntent;
  label: string;
  explanation: string;
  projectIds: string[];
};

export type PathwayActionView = {
  id: string;
  horizon: ActionHorizon;
  title: string;
  output: string;
  stopCondition: string;
  cannotProve: string;
  nextStep: string;
  steps: string[];
  externalActionRequired: boolean;
};

export type PathwaySummaryView = {
  id: string;
  slug: string;
  kind: PathwayKind;
  title: string;
  question: string;
  dailyTask: string;
  reusableAssets: string[];
  additionalGate: string;
  defaultAction: PathwayActionView;
  href: string;
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
  startModes: Array<{ id: StartMode; label: string; summary: string; href: string }>;
  taskEntries: Array<{ id: string; label: string; summary: string; href: string; primary?: boolean }>;
  modules: Array<{ id: string; title: string }>;
  majors: Array<Pick<Major, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary' | 'primaryFocus' | 'representativeCourses'> & { claims: ClaimView[] }>;
  sharedFoundation: string[];
  collaboration: { title: string; summary: string; caseSlug: string; artifact: string; claims: ClaimView[] };
  capabilities: Array<Pick<Capability, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  projects: ProjectCatalogItem[];
  featuredProjects: Project[];
  featuredDualLensCase: SiteData['dualLensCases'][number];
  scenarios: Array<Pick<Scenario, 'id' | 'slug' | 'name' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  faq: { id: string; question: string };
  faqs: Array<{ id: string; question: string; answer: string }>;
  updates: Array<ContentUpdate & { entityTitle: string; href: string }>;
  pathways: PathwaySummaryView[];
  evidence: {
    artifact: Pick<PathwayArtifact, 'id' | 'title' | 'description' | 'owner' | 'updatedAt' | 'reviewDueAt'> & { projectSlug: string };
    transformations: Array<Pick<EvidenceTransformation, 'pathwayId' | 'evidenceUse' | 'missingProof' | 'truthfulFraming' | 'owner' | 'updatedAt' | 'reviewDueAt'> & { pathwayTitle: string }>;
  };
  actionLadder: Array<{ horizon: ActionHorizon; label: string; actions: Array<{ pathwayTitle: string; title: string; output: string }> }>;
  contextLinks: Array<{ href: string; label: string }>;
  trust: {
    cohort: string;
    sourceLabel: string;
    boundary: string;
    evidenceHref: string;
    claimStatus: ClaimView['status'];
    factStatus: FactStatus;
    linkStatuses: Array<{ endpointId: string; status: LinkStatus }>;
    sources: Array<{ id: string; title: string; url: string; version: string; scope: string; lastVerified: string; authorityTier?: string }>;
  };
};

const projectIntentViews: ProjectIntentView[] = [
  { id: 'quick-look', label: '我先看 10 分钟', explanation: '这是 10 分钟导览；完整实践约 90 分钟。', projectIds: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
  { id: 'data-ai', label: '我想碰数据 / AI', explanation: '先看数据、特征和结果解释会做什么。', projectIds: ['project-signal-feature-notebook', 'project-material-test-matrix', 'project-sensor-alarm-prototype'] },
  { id: 'sensor', label: '我想动手接传感器', explanation: '优先使用仿真或低压台架，完整实践约 2 小时。', projectIds: ['project-sensor-alarm-prototype', 'project-signal-feature-notebook', 'project-material-test-matrix'] },
  { id: 'portfolio', label: '我想做一份能展示的作品', explanation: '三个项目都会留产物，先比较时间和媒介。', projectIds: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
];

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
  const faqs = [faq, ...data.faqs.filter((item) => item.id !== faq.id)].slice(0, 3);
  if (faqs.length < 3) throw new Error('首页 FAQ 当前内容少于 3 项');
  const updates = contentUpdates
    .map((update) => ({ update, entity: getUpdateEntity(data, update) }))
    .filter((item): item is { update: ContentUpdate; entity: { title: string; href: string } } => Boolean(item.entity))
    .sort((a, b) => b.update.publishedAt.localeCompare(a.update.publishedAt) || a.update.id.localeCompare(b.update.id))
    .slice(0, 3)
    .map(({ update, entity }) => ({ ...update, entityTitle: entity.title, href: entity.href }));
  const pathwayData = getPathwayData();
  const featuredArtifact = pathwayData.artifacts.find((item) => item.id === pathwayData.homePlan.pathwayLaunch.featuredArtifactId);
  if (!featuredArtifact) throw new Error('首页没有可用的当前产物');
  const artifactProject = data.projects.find((item) => item.id === featuredArtifact.projectId);
  if (!artifactProject) throw new Error(`首页 featured artifact 缺少项目：${featuredArtifact.projectId}`);
  const transformations = pathwayData.evidenceTransformations
    .filter((item) => item.sourceArtifactId === featuredArtifact.id)
    .map((item) => ({
      pathwayId: item.pathwayId,
      pathwayTitle: pathwayData.pathways.find((pathway) => pathway.id === item.pathwayId)?.title ?? item.pathwayId,
      evidenceUse: item.evidenceUse,
      missingProof: item.missingProof,
      truthfulFraming: item.truthfulFraming,
      owner: item.owner,
      updatedAt: item.updatedAt,
      reviewDueAt: item.reviewDueAt,
    }));
  if (transformations.length < 2) throw new Error('首页 featured artifact 至少需要两条路径改写');
  const orderedPathways = pathwayData.homePlan.pathwayLaunch.pathwayIds.map((id) => {
    const pathway = pathwayData.pathways.find((item) => item.id === id);
    if (!pathway) throw new Error(`路径首页编排缺少 ${id}`);
    return pathway;
  });
  const firstEvidence = getPathwayEvidence(orderedPathways[0]);
  const actionLadder = (['15-minutes', '7-days', '30-days', 'semester'] as ActionHorizon[]).map((horizon) => ({
    horizon,
    label: horizonLabels[horizon],
    actions: orderedPathways.map((pathway) => {
      const action = pathway.actions.find((item) => item.horizon === horizon) ?? pathway.actions[0];
      return { pathwayTitle: pathway.title, title: action.title, output: action.output };
    }),
  }));
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
    startModes: pathwayData.homePlan.pathwayLaunch.startModeOrder.map((id) => ({ id, ...startModeCopy[id] })),
    taskEntries: [
      { id: 'compare', label: '两个专业到底差在哪', summary: '从共同问题看两边各做什么、最后怎样接起来', href: '/majors/compare', primary: true },
      { id: 'project', label: '给我一个能马上试的项目', summary: '先看时长、最低基础和会留下什么', href: '/projects?intent=quick-look' },
      { id: 'undecided', label: '我还没想好，从这里开始', summary: '用两种短任务比较自己愿意继续哪一种', href: '/pathways/explore' },
    ],
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
    featuredProjects: selectedProjects,
    featuredDualLensCase: collaborationCase,
    scenarios: selectedScenarios.map((item) => ({ id: item.id, slug: item.slug, name: item.name, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary })),
    faq: { id: faq.id, question: faq.question },
    faqs: faqs.map((item) => ({ id: item.id, question: item.question, answer: item.answer })),
    updates,
    pathways: getPathwaySummaries(),
    evidence: {
      artifact: { id: featuredArtifact.id, title: featuredArtifact.title, description: featuredArtifact.description, projectSlug: artifactProject.slug, owner: featuredArtifact.owner, updatedAt: featuredArtifact.updatedAt, reviewDueAt: featuredArtifact.reviewDueAt },
      transformations,
    },
    actionLadder,
    contextLinks: [
      { href: '/majors/compare', label: '还在选专业？回到双专业对照' },
      { href: `/projects/${artifactProject.slug}`, label: '打开这份项目体验卡' },
      { href: '/capabilities', label: '从能力地图继续' },
      { href: '/scenarios', label: '按场景核对边界' },
    ],
    trust: {
      cohort: siteConfig.currentCohort,
      sourceLabel: '专业与课程信息基于 2025 级培养方案',
      boundary: '公开只读 · 不接入真实患者数据',
      evidenceHref: sharedFoundationClaim.evidenceHref,
      claimStatus: sharedFoundationClaim.status,
      factStatus: firstEvidence.claimStatus,
      linkStatuses: firstEvidence.linkStatuses.map(({ endpointId, status }) => ({ endpointId, status })),
      sources: firstEvidence.sources,
    },
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

function pathwayActionView(action: Pathway['actions'][number]): PathwayActionView {
  return {
    id: action.id,
    horizon: action.horizon,
    title: action.title,
    output: action.output,
    stopCondition: action.stopCondition,
    cannotProve: action.cannotProve,
    nextStep: action.nextStep,
    steps: action.steps,
    externalActionRequired: action.externalActionRequired,
  };
}

export function getPathwaySummaries(): PathwaySummaryView[] {
  const data = getPathwayData();
  return data.homePlan.pathwayLaunch.pathwayIds.map((id) => {
    const pathway = data.pathways.find((item) => item.id === id);
    if (!pathway) throw new Error(`路径首页编排缺少 ${id}`);
    return {
      id: pathway.id,
      slug: pathway.slug,
      kind: pathway.kind,
      title: pathway.title,
      question: pathway.question,
      dailyTask: pathway.dailyTasks[0],
      reusableAssets: pathway.reusableAssets.slice(0, 2),
      additionalGate: pathway.additionalGates[0],
      defaultAction: pathwayActionView(pathway.actions.find((action) => action.horizon === '15-minutes') ?? pathway.actions[0]),
      href: `/pathways/${pathway.slug}`,
    };
  });
}

export function getPathwayDetailModel(pathway: Pathway) {
  return {
    pathway,
    capabilities: getRelatedCapabilities(pathway),
    projects: getRelatedProjects(pathway),
    scenarios: getRelatedScenarios(pathway),
    transformations: getPathwayData().evidenceTransformations.filter((item) => item.pathwayId === pathway.id),
    evidence: getPathwayEvidence(pathway),
  };
}

export function getPathwayFactStatus(pathway: Pathway) {
  const claim = evidenceData.claims.find((item) => item.key === pathway.claimKeys[0]);
  return claim ? getClaimStatus(claim) : 'unverified';
}

function getUpdateEntity(data: SiteData, update: ContentUpdate): { title: string; href: string } | undefined {
  if (update.entityType === 'project') {
    const project = data.projects.find((item) => item.id === update.entityId);
    return project ? { title: project.title, href: `/projects/${project.slug}` } : undefined;
  }
  if (update.entityType === 'faq') {
    const faq = data.faqs.find((item) => item.id === update.entityId);
    return faq ? { title: faq.question, href: `/majors/faq#${faq.slug}` } : undefined;
  }
  if (update.entityType === 'dual-lens-case') {
    const item = data.dualLensCases.find((entry) => entry.id === update.entityId);
    return item ? { title: item.title, href: `/majors/compare#${item.slug}` } : undefined;
  }
  const source = data.sources.find((item) => item.id === update.entityId);
  return source ? { title: source.title, href: `/sources#${source.id}` } : undefined;
}

export function getProjectIntentViews(): ProjectIntentView[] {
  return projectIntentViews;
}

export function getProjectsForIntent(intent: string | undefined): { intent?: ProjectIntentView; projects: ProjectCatalogItem[] } {
  const data = getSiteData();
  const selectedIntent = projectIntentViews.find((item) => item.id === intent);
  const ordered = selectedIntent ? selectByIds(data.projects, selectedIntent.projectIds, `项目意图 ${selectedIntent.id}`) : data.projects;
  return { intent: selectedIntent, projects: ordered.map((project) => mapProject(project, data)) };
}
