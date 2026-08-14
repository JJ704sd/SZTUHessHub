import { siteConfig } from '../site-config';
import { getSiteData } from './repository';
import type { Capability, Major, Project, Scenario, SiteData } from './schema';

export type RelationLink = { id: string; slug: string; label: string; href: string };
export type TaskLink = { id: string; label: string; summary: string; href: string; icon: string };
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

export type HomePageModel = {
  explanatoryText: string;
  tasks: TaskLink[];
  modules: Array<{ id: string; title: string }>;
  majors: Array<Pick<Major, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary' | 'focus' | 'foundation'>>;
  sharedFoundation: string[];
  collaboration: { title: string; summary: string; caseSlug: string; artifact: string };
  capabilities: Array<Pick<Capability, 'id' | 'slug' | 'name' | 'shortName' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  projects: ProjectCatalogItem[];
  scenarios: Array<Pick<Scenario, 'id' | 'slug' | 'name' | 'navigationLabel' | 'cardSummary' | 'taskSummary'>>;
  faq: { id: string; question: string };
  trust: { cohort: string; sourceLabel: string; boundary: string };
};

function mapProject(project: Project): ProjectCatalogItem {
  const asset = getSiteData().mediaAssets.find((item) => item.id === project.visualAssetId);
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

export function getProjectCatalog(): {
  items: ProjectCatalogItem[];
  filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] };
} {
  const data = getSiteData();
  return {
    items: data.projects.map(mapProject),
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
  const firstCase = data.dualLensCases[0];
  return {
    explanatoryText: '先从一个任务开始：看懂两个专业、从能力找任务，或先试一张项目体验卡。',
    tasks: [
      { id: 'compare', label: '看懂两个专业', summary: '共同底座、不同侧重、如何协作', href: '/majors/compare', icon: '⇄' },
      { id: 'capabilities', label: '从能力看任务', summary: '课程能形成什么能力、可以做什么', href: '/capabilities', icon: '◌' },
      { id: 'projects', label: '试一个项目', summary: '先看时长、基础和产出，再决定是否开始', href: '/projects', icon: '↗' },
    ],
    modules: [
      { id: 'tasks', title: '任务入口' },
      { id: 'compare', title: '双专业一屏对照' },
      { id: 'projects', title: '今天先试一个' },
      { id: 'explore', title: '场景与继续探索' },
    ],
    majors: data.majors.map((item) => ({ id: item.id, slug: item.slug, name: item.name, shortName: item.shortName, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary, focus: item.focus, foundation: item.foundation })),
    sharedFoundation: data.majors[0]?.foundation.slice(0, 5) ?? [],
    collaboration: { title: firstCase.title, summary: firstCase.problem, caseSlug: firstCase.slug, artifact: firstCase.sharedArtifact },
    capabilities: data.capabilities.map((item) => ({ id: item.id, slug: item.slug, name: item.name, shortName: item.shortName, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary })),
    projects: data.projects.map(mapProject),
    scenarios: data.scenarios.map((item) => ({ id: item.id, slug: item.slug, name: item.name, navigationLabel: item.navigationLabel, cardSummary: item.cardSummary, taskSummary: item.taskSummary })),
    faq: { id: data.faqs[0].id, question: data.faqs[0].question },
    trust: { cohort: siteConfig.currentCohort, sourceLabel: '学院公开资料与培养方案事实登记', boundary: '公开只读 · 不接入真实患者数据' },
  };
}

export function getCapabilityDetailModel(slugOrId: string) {
  const data = getSiteData();
  const capability = data.capabilities.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!capability) return undefined;
  return {
    capability,
    majors: capability.majorEvidence.map((evidence) => ({ ...evidence, major: data.majors.find((item) => item.id === evidence.majorId) })).filter((item) => item.major),
    projects: data.projects.filter((item) => item.capabilityIds.includes(capability.id)).map(mapProject),
    scenarios: data.scenarios.filter((item) => item.sharedCapabilities.includes(capability.id)),
  };
}

export function getProjectDetailModel(slugOrId: string) {
  const data = getSiteData();
  const project = data.projects.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!project) return undefined;
  return {
    project,
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
    projects: data.projects.filter((item) => item.scenarioIds.includes(scenario.id)).map(mapProject),
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
