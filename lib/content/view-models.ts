import { siteConfig } from '../site-config';
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
    evidence,
  };
}

export function getPathwayFactStatus(pathway: Pathway): FactStatus {
  const claimKey = pathway.claimKeys[0];
  const claim = evidenceData.claims.find((item) => item.key === claimKey);
  return claim ? getClaimStatus(claim) : 'unverified';
}
