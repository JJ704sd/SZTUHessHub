import rawSiteData from "../content/site-data.json";
import rawUpdates from "../content/updates.json";
import type { HomePlan } from './content/schema';

export type SiteMeta = {
  title: string;
  tagline: string;
  description: string;
  home?: HomePlan;
};

export type LearningStoryItem = {
  stage: string;
  title: string;
  summary: string;
};

export type CourseEvidence = {
  course: string;
  detail: string;
  capabilityIds: string[];
};

export type Major = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  summary: string;
  focus: string[];
  credits: number;
  creditNote: string;
  cohort: string;
  foundation: string[];
  electives: string[];
  learningStory: LearningStoryItem[];
  courseEvidence: CourseEvidence[];
  sourceId: string;
  lastVerified: string;
};

export type DualLens = {
  majorId: string;
  label: string;
  role: string;
  input: string;
  output: string;
  interface: string;
  contribution: string;
};

export type DualLensCase = {
  id: string;
  slug: string;
  title: string;
  problem: string;
  sharedGoal: string;
  lenses: DualLens[];
  sharedArtifact: string;
  validation: string;
  riskBoundary: string;
  sourceId: string;
  lastVerified: string;
  owner: string;
  updatedAt: string;
  reviewDueAt: string;
};

export type MajorEvidence = {
  majorId: string;
  course: string;
};

export type Capability = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  why: string;
  task: string;
  majorEvidence: MajorEvidence[];
  healthExample: string;
  transferExample: string;
  sourceId: string;
  lastVerified: string;
};

export type ProjectTool = {
  name: string;
  officialUrl: string;
};

export type ProjectData = {
  kind: 'none' | 'synthetic' | 'real';
  access: 'none' | 'open' | 'restricted' | 'credentialed';
  sensitivity: 'none' | 'personal' | 'health' | 'commercial' | 'security-relevant';
};

export type ProjectArtifactTemplate = {
  label: string;
  href: string;
  version: string;
  license: string;
};

export type ProjectPreview = {
  src: string;
  alt: string;
  kind: 'project_output' | 'process' | 'diagram';
  author: string;
  license: string;
  sourceRef: string;
  generationRef: string;
  updatedAt: string;
};

export type ProjectCollaborationRole = {
  id: string;
  title: string;
  suggestedMajorIds: string[];
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  acceptance: string[];
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  viewpoint: string;
  level: 'glimpse' | 'try' | 'mini-project';
  mode: 'individual' | 'cross-major';
  majorIds: string[];
  courseEvidence: Array<{ majorId: string; course: string }>;
  capabilityIds: string[];
  scenarioIds: string[];
  collaborationRoles: ProjectCollaborationRole[];
  data: ProjectData;
  suitableFor: string;
  duration: string;
  durationBands: string[];
  prerequisites: string[];
  tools: ProjectTool[];
  dataAccess: string;
  dataSource: string;
  license: string;
  steps: string[];
  stopCondition: string;
  expectedOutput: string;
  artifactId: string;
  artifactTemplate: ProjectArtifactTemplate;
  reflectionPrompt: string;
  validation: string;
  nextStep: string;
  boundary: string;
  sourceUrl: string;
  sourceId: string;
  lastVerified: string;
  endpointIds: string[];
  previewAssets: ProjectPreview[];
  /** @deprecated 兼容尚未迁移的消费者；内容源只写 previewAssets。 */
  preview: ProjectPreview;
  owner: string;
  updatedAt: string;
  reviewDueAt: string;
};

export type Scenario = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  sharedCapabilities: string[];
  extraGate: string;
  example: string;
  sourceId: string;
  lastVerified: string;
};

export type FaqItem = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  sourceId: string;
  lastVerified: string;
  owner: string;
  updatedAt: string;
  reviewDueAt: string;
};

export type Source = {
  id: string;
  title: string;
  kind: string;
  url: string;
  version: string;
  scope: string;
  lastVerified: string;
  authorityTier?: 'A' | 'B' | 'C' | 'D';
};

export type SiteData = {
  siteMeta: SiteMeta;
  majors: Major[];
  dualLensCases: DualLensCase[];
  capabilities: Capability[];
  projects: Project[];
  scenarios: Scenario[];
  faqs: FaqItem[];
  sources: Source[];
};

export type ContentUpdate = {
  id: string;
  entityType: 'project' | 'faq' | 'dual-lens-case' | 'source';
  entityId: string;
  kind: 'content-update' | 'source-reverification';
  summary: string;
  publishedAt: string;
  owner: string;
};

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Invalid content record: ${label}`);
  }
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid content string: ${label}`);
  }
}

function assertArray(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid content array: ${label}`);
  }
}

function parseSiteData(input: unknown): SiteData {
  assertRecord(input, "siteData");
  assertRecord(input.siteMeta, "siteMeta");

  for (const field of ["title", "tagline", "description"]) {
    assertString(input.siteMeta[field], `siteMeta.${field}`);
  }

  const collections = [
    ["majors", ["id", "slug", "sourceId", "lastVerified"]],
    ["dualLensCases", ["id", "slug", "sourceId", "lastVerified"]],
    ["capabilities", ["id", "slug", "sourceId", "lastVerified"]],
    ["projects", ["id", "slug", "sourceId", "lastVerified"]],
    ["scenarios", ["id", "slug", "sourceId", "lastVerified"]],
    ["faqs", ["id", "sourceId", "lastVerified"]],
    ["sources", ["id", "lastVerified"]]
  ] as const;

  for (const [collection, fields] of collections) {
    assertArray(input[collection], collection);
    input[collection].forEach((item, index) => {
      assertRecord(item, `${collection}[${index}]`);
      for (const field of fields) {
        assertString(item[field], `${collection}[${index}].${field}`);
      }
    });
  }

  assertArray(input.projects, 'projects');
  const normalizedProjects = input.projects.map((project, index) => {
    assertRecord(project, `projects[${index}]`);
    const legacyPreview = project.preview;
    const assets = project.previewAssets ?? (legacyPreview ? [legacyPreview] : undefined);
    assertArray(assets, `projects[${index}].previewAssets`);
    if (assets.length === 0) throw new Error(`Invalid empty preview assets: projects[${index}].previewAssets`);
    const legacyCompatiblePreview = assets.find((asset) => {
      assertRecord(asset, `projects[${index}].previewAssets item`);
      return asset.kind === 'project_output';
    }) ?? assets[0];
    return { ...project, previewAssets: assets, preview: legacyCompatiblePreview };
  });

  return { ...input, projects: normalizedProjects } as SiteData;
}

export const siteData: SiteData = parseSiteData(rawSiteData);

function parseContentUpdates(input: unknown, data: SiteData): ContentUpdate[] {
  assertArray(input, 'updates');
  const allowedKinds = new Set<ContentUpdate['kind']>(['content-update', 'source-reverification']);
  const entityIds: Record<ContentUpdate['entityType'], Set<string>> = {
    project: new Set(data.projects.map((item) => item.id)),
    faq: new Set(data.faqs.map((item) => item.id)),
    'dual-lens-case': new Set(data.dualLensCases.map((item) => item.id)),
    source: new Set(data.sources.map((item) => item.id)),
  };
  const seenIds = new Set<string>();
  return input.map((item, index) => {
    assertRecord(item, `updates[${index}]`);
    for (const field of ['id', 'entityType', 'entityId', 'kind', 'summary', 'publishedAt', 'owner']) {
      assertString(item[field], `updates[${index}].${field}`);
    }
    const update = item as ContentUpdate;
    if (seenIds.has(update.id)) throw new Error(`Duplicate update id: ${update.id}`);
    seenIds.add(update.id);
    if (!allowedKinds.has(update.kind)) throw new Error(`Invalid update kind: updates[${index}].kind`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(update.publishedAt)) throw new Error(`Invalid update date: updates[${index}].publishedAt`);
    if (!entityIds[update.entityType]?.has(update.entityId)) {
      throw new Error(`Invalid update entity: updates[${index}] -> ${update.entityType}.${update.entityId}`);
    }
    return update;
  });
}

export const contentUpdates = parseContentUpdates(rawUpdates, siteData);
