import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '必须是 YYYY-MM-DD 日期');
const nonEmptyString = z.string().trim().min(1);
const idList = z.array(nonEmptyString);

export const resourceHealthSchema = z.object({
  status: z.enum(['available', 'degraded', 'unverified', 'unavailable']),
  checkedAt: dateSchema,
  replacementUrl: z.string().url().startsWith('https://').optional(),
  note: nonEmptyString.optional(),
});

export const mediaAssetSchema = z.object({
  id: nonEmptyString,
  src: z.string().regex(/^\/(?!\/)[^\s]+$/, '媒体必须是本地绝对路径'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
  decorative: z.boolean(),
  role: z.enum(['hero', 'card', 'diagram', 'evidence']),
  caption: nonEmptyString.optional(),
  sourceId: nonEmptyString.optional(),
  license: nonEmptyString,
  lastVerified: dateSchema,
}).superRefine((asset, context) => {
  if (asset.decorative && asset.alt !== '') {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['alt'], message: '装饰媒体的 alt 必须为空' });
  }
  if (!asset.decorative && asset.alt.trim() === '') {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['alt'], message: '信息媒体必须有描述性 alt' });
  }
  if (asset.license !== '原创 SVG/CSS') {
    if (!asset.sourceId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['sourceId'], message: '非原创媒体必须关联来源' });
    if (!asset.lastVerified) context.addIssue({ code: z.ZodIssueCode.custom, path: ['lastVerified'], message: '非原创媒体必须有核验日期' });
  }
});

const primaryMetadata = {
  id: nonEmptyString,
  slug: nonEmptyString,
  sourceId: nonEmptyString,
  lastVerified: dateSchema,
};

export const homePlanSchema = z.object({
  primaryJourneyId: z.enum(['compare', 'capability', 'project']),
  majorIds: z.array(nonEmptyString).length(2),
  sharedFoundation: z.array(nonEmptyString).min(3).max(6),
  featuredDualLensCaseId: nonEmptyString,
  capabilityIds: z.array(nonEmptyString).min(2).max(3),
  projectIds: z.array(nonEmptyString).length(3),
  scenarioIds: z.array(nonEmptyString).min(1).max(6),
  faqId: nonEmptyString,
  showExploreSection: z.boolean(),
  evidenceRecordId: nonEmptyString.optional(),
}).superRefine((home, context) => {
  if ((home.capabilityIds.length < 3 || home.scenarioIds.length < 6 || !home.showExploreSection) && !home.evidenceRecordId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['evidenceRecordId'], message: '首页能力/场景数量减少或合并探索区段时必须绑定 WP0 证据记录' });
  }
});

export const siteMetaSchema = z.object({
  title: nonEmptyString,
  tagline: nonEmptyString,
  description: nonEmptyString,
  home: homePlanSchema,
});

export const learningStoryItemSchema = z.object({ stage: nonEmptyString, title: nonEmptyString, summary: nonEmptyString });

export const courseEvidenceSchema = z.object({
  course: nonEmptyString,
  detail: nonEmptyString.optional(),
  capabilityIds: idList.default([]),
});

export const majorSchema = z.object({
  ...primaryMetadata,
  name: nonEmptyString,
  shortName: nonEmptyString,
  navigationLabel: nonEmptyString,
  eyebrow: nonEmptyString,
  summary: nonEmptyString,
  cardSummary: z.string().trim().min(1).max(48),
  taskSummary: z.string().trim().min(1).max(48),
  focus: z.array(nonEmptyString).min(1),
  primaryFocus: z.array(nonEmptyString).length(2),
  credits: z.number().int().positive(),
  creditNote: nonEmptyString,
  cohort: nonEmptyString,
  foundation: z.array(nonEmptyString).min(1),
  electives: z.array(nonEmptyString).min(1),
  learningStory: z.array(learningStoryItemSchema).min(1),
  courseEvidence: z.array(courseEvidenceSchema).min(1),
  representativeCourses: z.array(nonEmptyString).min(1).max(3),
});

export const dualLensSchema = z.object({
  majorId: nonEmptyString,
  label: nonEmptyString,
  role: nonEmptyString,
  input: nonEmptyString,
  output: nonEmptyString,
  interface: nonEmptyString,
  contribution: nonEmptyString,
});

export const dualLensCaseSchema = z.object({
  ...primaryMetadata,
  title: nonEmptyString,
  problem: nonEmptyString,
  sharedGoal: nonEmptyString,
  lenses: z.array(dualLensSchema).length(2),
  sharedArtifact: nonEmptyString,
  validation: nonEmptyString,
  riskBoundary: nonEmptyString,
});

export const majorEvidenceSchema = z.object({ majorId: nonEmptyString, course: nonEmptyString });

export const capabilitySchema = z.object({
  ...primaryMetadata,
  name: nonEmptyString,
  shortName: nonEmptyString,
  navigationLabel: nonEmptyString,
  summary: nonEmptyString,
  cardSummary: z.string().trim().min(1).max(48),
  taskSummary: z.string().trim().min(1).max(48),
  why: nonEmptyString,
  task: nonEmptyString,
  majorEvidence: z.array(majorEvidenceSchema).min(2),
  healthExample: nonEmptyString,
  transferExample: nonEmptyString,
});

export const projectToolSchema = z.object({ name: nonEmptyString, officialUrl: z.string().url().startsWith('https://') });
export const projectDataSchema = z.object({
  kind: z.enum(['none', 'synthetic', 'real']),
  access: z.enum(['none', 'open', 'restricted', 'credentialed']),
  sensitivity: z.enum(['none', 'personal', 'health', 'commercial', 'security-relevant']),
});

export const quickTrySchema = z.discriminatedUnion('enabled', [
  z.object({ enabled: z.literal(false) }),
  z.object({
    enabled: z.literal(true),
    durationMinutes: z.number().int().positive().max(10),
    minimumArtifact: nonEmptyString,
    startAction: z.object({ label: nonEmptyString, href: nonEmptyString }),
  }),
]);

export const projectCollaborationRoleSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  suggestedMajorIds: idList,
  responsibilities: z.array(nonEmptyString).min(1),
  inputs: z.array(nonEmptyString).min(1),
  outputs: z.array(nonEmptyString).min(1),
  acceptance: z.array(nonEmptyString).min(1),
});

export const projectSchema = z.object({
  ...primaryMetadata,
  title: nonEmptyString,
  navigationLabel: nonEmptyString,
  kicker: nonEmptyString,
  summary: nonEmptyString,
  cardSummary: z.string().trim().min(1).max(48),
  taskSummary: z.string().trim().min(1).max(48),
  outputSummary: z.string().trim().min(1).max(48),
  primaryAction: z.object({ label: nonEmptyString, href: nonEmptyString }),
  visualAssetId: nonEmptyString,
  viewpoint: nonEmptyString,
  level: z.enum(['glimpse', 'try', 'mini-project']),
  mode: z.enum(['individual', 'cross-major']),
  majorIds: idList,
  courseEvidence: z.array(majorEvidenceSchema).min(1),
  capabilityIds: idList,
  scenarioIds: idList,
  collaborationRoles: z.array(projectCollaborationRoleSchema),
  data: projectDataSchema,
  suitableFor: nonEmptyString,
  duration: nonEmptyString,
  durationBands: z.array(nonEmptyString).min(1),
  prerequisites: z.array(nonEmptyString).min(1),
  tools: z.array(projectToolSchema).min(1),
  dataAccess: nonEmptyString,
  dataSource: nonEmptyString,
  license: nonEmptyString,
  steps: z.array(nonEmptyString).min(1),
  expectedOutput: nonEmptyString,
  validation: nonEmptyString,
  nextStep: nonEmptyString,
  boundary: nonEmptyString,
  dataBoundary: nonEmptyString,
  safetyBoundary: nonEmptyString,
  sourceUrl: z.string().url().startsWith('https://'),
  quickTry: quickTrySchema,
  resourceHealth: resourceHealthSchema,
});

export const scenarioSchema = z.object({
  ...primaryMetadata,
  name: nonEmptyString,
  navigationLabel: nonEmptyString,
  summary: nonEmptyString,
  cardSummary: z.string().trim().min(1).max(48),
  taskSummary: z.string().trim().min(1).max(48),
  sharedCapabilities: idList,
  extraGate: nonEmptyString,
  example: nonEmptyString,
});

export const faqSchema = z.object({ ...primaryMetadata, question: nonEmptyString, answer: nonEmptyString });
const sourceRecordBase = {
  id: nonEmptyString,
  title: nonEmptyString,
  version: nonEmptyString,
  accessScope: nonEmptyString,
  kind: nonEmptyString,
  scope: nonEmptyString,
  lastVerified: dateSchema,
};

export const sourceSchema = z.discriminatedUnion('accessType', [
  z.object({ ...sourceRecordBase, accessType: z.literal('public_url'), url: z.string().url().startsWith('https://') }),
  z.object({ ...sourceRecordBase, accessType: z.enum(['institutional', 'internal']), url: z.never().optional() }),
]);

export const claimSubjectTypeSchema = z.enum(['major', 'major_comparison', 'dual_lens_case', 'project']);
export const claimFieldSchema = z.enum(['totalCredits', 'sharedFoundation', 'focusTask', 'representativeCourseGroup', 'sharedGoal', 'sharedArtifact', 'dataBoundary', 'safetyBoundary']);
export const evidenceRefSchema = z.object({
  id: nonEmptyString,
  sourceId: nonEmptyString,
  locator: nonEmptyString.optional(),
  reviewedAt: dateSchema,
  reviewDueAt: dateSchema,
  owner: nonEmptyString,
  reviewDecision: z.enum(['verified', 'disputed']),
});
export const claimRegistryEntrySchema = z.object({
  key: nonEmptyString,
  subjectType: claimSubjectTypeSchema,
  subjectId: nonEmptyString,
  field: claimFieldSchema,
  normalizedContentHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  evidenceRefIds: z.array(nonEmptyString).min(1),
});
export const resourceEndpointSchema = z.object({
  id: nonEmptyString,
  ownerType: z.enum(['source', 'project']),
  ownerId: nonEmptyString,
  role: z.enum(['source', 'tool', 'replacement']),
  required: z.boolean(),
  url: z.string().url().startsWith('https://'),
});
export const linkAvailabilitySchema = z.object({
  endpointId: nonEmptyString,
  checkedAt: dateSchema,
  status: z.enum(['available', 'degraded', 'unavailable', 'unverified']),
  replacementEndpointId: nonEmptyString.optional(),
  note: nonEmptyString.optional(),
});
export const evidenceDataSchema = z.object({
  claims: z.array(claimRegistryEntrySchema),
  evidenceRefs: z.array(evidenceRefSchema),
  endpoints: z.array(resourceEndpointSchema),
  linkAvailability: z.array(linkAvailabilitySchema),
});

export const siteDataSchema = z.object({
  siteMeta: siteMetaSchema,
  majors: z.array(majorSchema).min(2),
  dualLensCases: z.array(dualLensCaseSchema).min(2),
  capabilities: z.array(capabilitySchema).min(8),
  projects: z.array(projectSchema).min(3),
  scenarios: z.array(scenarioSchema).min(6),
  faqs: z.array(faqSchema).min(4),
  sources: z.array(sourceSchema).min(1),
  mediaAssets: z.array(mediaAssetSchema).min(3),
}).superRefine((data, context) => {
  const collections = [data.majors, data.dualLensCases, data.capabilities, data.projects, data.scenarios, data.faqs, data.sources, data.mediaAssets];
  const allIds = new Set<string>();
  for (const collection of collections) {
    const localIds = new Set<string>();
    for (const item of collection) {
      if (localIds.has(item.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['id'], message: `集合内 id 重复：${item.id}` });
      localIds.add(item.id);
      if (allIds.has(item.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['id'], message: `全局 id 重复：${item.id}` });
      allIds.add(item.id);
    }
  }
  const sourceIds = new Set(data.sources.map((item) => item.id));
  for (const [collectionName, collection] of Object.entries(data) as Array<[string, unknown]>) {
    if (!Array.isArray(collection)) continue;
    collection.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;
      const record = item as Record<string, unknown>;
      if ('sourceId' in record && typeof record.sourceId === 'string' && !sourceIds.has(record.sourceId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: [collectionName, index, 'sourceId'], message: `来源不存在：${record.sourceId}` });
      }
    });
  }
  const majorIds = new Set(data.majors.map((item) => item.id));
  const capabilityIds = new Set(data.capabilities.map((item) => item.id));
  const scenarioIds = new Set(data.scenarios.map((item) => item.id));
  const dualLensCaseIds = new Set(data.dualLensCases.map((item) => item.id));
  const projectIds = new Set(data.projects.map((item) => item.id));
  const faqIds = new Set(data.faqs.map((item) => item.id));
  const home = data.siteMeta.home;
  const checkHomeIds = (ids: string[], available: Set<string>, path: string) => {
    if (new Set(ids).size !== ids.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', path], message: '首页编排 ID 不得重复' });
    ids.forEach((id, index) => { if (!available.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', path, index], message: `首页编排实体不存在：${id}` }); });
  };
  checkHomeIds(home.majorIds, majorIds, 'majorIds');
  checkHomeIds(home.capabilityIds, capabilityIds, 'capabilityIds');
  checkHomeIds(home.projectIds, projectIds, 'projectIds');
  checkHomeIds(home.scenarioIds, scenarioIds, 'scenarioIds');
  if (!dualLensCaseIds.has(home.featuredDualLensCaseId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'featuredDualLensCaseId'], message: '首页同题双解实体不存在' });
  if (!faqIds.has(home.faqId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'faqId'], message: '首页 FAQ 实体不存在' });
  for (const item of data.dualLensCases) item.lenses.forEach((lens, index) => { if (!majorIds.has(lens.majorId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['dualLensCases', item.id, 'lenses', index, 'majorId'], message: '专业关系不存在' }); });
  for (const item of data.majors) item.courseEvidence.forEach((evidence, index) => evidence.capabilityIds?.forEach((id) => { if (!capabilityIds.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['majors', item.id, 'courseEvidence', index, 'capabilityIds'], message: `能力关系不存在：${id}` }); }));
  for (const item of data.capabilities) item.majorEvidence.forEach((evidence, index) => { if (!majorIds.has(evidence.majorId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['capabilities', item.id, 'majorEvidence', index, 'majorId'], message: '专业关系不存在' }); });
  for (const item of data.projects) {
    item.majorIds.forEach((id) => { if (!majorIds.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['projects', item.id, 'majorIds'], message: `专业关系不存在：${id}` }); });
    item.capabilityIds.forEach((id) => { if (!capabilityIds.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['projects', item.id, 'capabilityIds'], message: `能力关系不存在：${id}` }); });
    item.scenarioIds.forEach((id) => { if (!scenarioIds.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['projects', item.id, 'scenarioIds'], message: `场景关系不存在：${id}` }); });
  }
  for (const item of data.scenarios) item.sharedCapabilities.forEach((id) => { if (!capabilityIds.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['scenarios', item.id, 'sharedCapabilities'], message: `能力关系不存在：${id}` }); });
});

export type SiteData = z.infer<typeof siteDataSchema>;
export type SiteMeta = z.infer<typeof siteMetaSchema>;
export type HomePlan = z.infer<typeof homePlanSchema>;
export type Major = z.infer<typeof majorSchema>;
export type DualLens = z.infer<typeof dualLensSchema>;
export type DualLensCase = z.infer<typeof dualLensCaseSchema>;
export type Capability = z.infer<typeof capabilitySchema>;
export type Project = z.infer<typeof projectSchema>;
export type QuickTry = z.infer<typeof quickTrySchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type FaqItem = z.infer<typeof faqSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type SourceRecord = z.infer<typeof sourceSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type ResourceHealth = z.infer<typeof resourceHealthSchema>;
export type ClaimSubjectType = z.infer<typeof claimSubjectTypeSchema>;
export type ClaimField = z.infer<typeof claimFieldSchema>;
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type ClaimRegistryEntry = z.infer<typeof claimRegistryEntrySchema>;
export type ResourceEndpoint = z.infer<typeof resourceEndpointSchema>;
export type LinkAvailability = z.infer<typeof linkAvailabilitySchema>;
export type EvidenceData = z.infer<typeof evidenceDataSchema>;

export function parseSiteData(input: unknown): SiteData {
  return siteDataSchema.parse(input);
}
