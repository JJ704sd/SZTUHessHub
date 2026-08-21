import { z } from 'zod';
import { resourceManifests } from '../resources';

const nonEmptyString = z.string().trim().min(1);
const idList = z.array(nonEmptyString);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '必须是 YYYY-MM-DD 日期');

export const pathwayKindSchema = z.enum([
  'employment',
  'domestic-postgraduate',
  'public-service',
  'overseas-study',
  'independent-work',
]);

export const startModeSchema = z.enum(['has-direction', 'from-assets', 'undecided']);
export const actionHorizonSchema = z.enum(['15-minutes', '7-days', '30-days', 'semester']);

export const pathwayActionSchema = z.object({
  id: nonEmptyString,
  horizon: actionHorizonSchema,
  title: nonEmptyString,
  steps: z.array(nonEmptyString).min(1).max(5),
  output: nonEmptyString,
  stopCondition: nonEmptyString,
  cannotProve: nonEmptyString,
  nextStep: nonEmptyString,
  externalActionRequired: z.boolean(),
});

const pathwayActionList = z.array(pathwayActionSchema).length(4).superRefine((actions, context) => {
  const expected = actionHorizonSchema.options;
  const horizons = actions.map((action) => action.horizon);
  if (new Set(horizons).size !== horizons.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: '行动梯的 horizon 不得重复' });
  }
  expected.forEach((horizon) => {
    if (!horizons.includes(horizon)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `行动梯缺少 ${horizon}` });
    }
  });
});

export const pathwayBaseSchema = z.object({
  id: nonEmptyString,
  slug: nonEmptyString,
  title: nonEmptyString,
  owner: nonEmptyString,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
  question: nonEmptyString,
  summary: nonEmptyString,
  dailyTasks: z.array(nonEmptyString).min(1).max(3),
  capabilityIds: idList.min(2).max(3),
  projectIds: idList.min(1).max(2),
  scenarioIds: idList.min(1).max(3),
  artifactIds: idList.min(1).max(3),
  reusableAssets: z.array(nonEmptyString).min(2).max(3),
  additionalGates: z.array(nonEmptyString).min(1).max(2),
  evidenceChecklist: z.array(nonEmptyString).min(1).max(5),
  timeConstraints: z.array(nonEmptyString).min(1).max(4),
  actions: pathwayActionList,
  sourceIds: idList.min(2).max(4),
  endpointIds: idList.min(2).max(4),
  eligibilityBoundary: nonEmptyString,
  claimKeys: idList.min(1).max(2),
  combinationPaths: z.array(nonEmptyString).min(1).max(2),
});

const roleFamilySchema = z.object({
  title: nonEmptyString,
  tasks: z.array(nonEmptyString).min(2).max(3),
  evidenceExample: nonEmptyString,
  organizationTypes: z.array(nonEmptyString).min(1).max(3),
});

const domesticDirectionSchema = z.object({
  title: nonEmptyString,
  trainingQuestion: nonEmptyString,
  preparationSignal: nonEmptyString,
});

const publicServiceFieldSchema = z.object({
  field: nonEmptyString,
  question: nonEmptyString,
});

const overseasProgramSchema = z.object({
  title: nonEmptyString,
  trainingDifference: nonEmptyString,
  verificationQuestion: nonEmptyString,
});

const independentServiceSchema = z.object({
  audience: nonEmptyString,
  problem: nonEmptyString,
  deliverable: nonEmptyString,
  boundary: nonEmptyString,
});

export const employmentPathwaySchema = pathwayBaseSchema.extend({
  kind: z.literal('employment'),
  roleFamilies: z.array(roleFamilySchema).min(2).max(5),
});

export const domesticPostgraduatePathwaySchema = pathwayBaseSchema.extend({
  kind: z.literal('domestic-postgraduate'),
  studyModes: z.array(nonEmptyString).min(2).max(3),
  directionExamples: z.array(domesticDirectionSchema).min(2).max(3),
});

export const publicServicePathwaySchema = pathwayBaseSchema.extend({
  kind: z.literal('public-service'),
  officialFieldChecklist: z.array(publicServiceFieldSchema).min(4).max(7),
  serviceScopes: z.array(nonEmptyString).min(2).max(3),
});

export const overseasStudyPathwaySchema = pathwayBaseSchema.extend({
  kind: z.literal('overseas-study'),
  programTypes: z.array(overseasProgramSchema).min(2).max(3),
  preparationQuestions: z.array(nonEmptyString).min(3).max(5),
});

export const independentWorkPathwaySchema = pathwayBaseSchema.extend({
  kind: z.literal('independent-work'),
  serviceSlices: z.array(independentServiceSchema).min(2).max(4),
  complianceQuestions: z.array(nonEmptyString).min(3).max(5),
});

export const pathwaySchema = z.discriminatedUnion('kind', [
  employmentPathwaySchema,
  domesticPostgraduatePathwaySchema,
  publicServicePathwaySchema,
  overseasStudyPathwaySchema,
  independentWorkPathwaySchema,
]);

export const pathwayArtifactSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  projectId: nonEmptyString,
  description: nonEmptyString,
  templateUrl: nonEmptyString,
  templateVersion: nonEmptyString,
  license: nonEmptyString,
  owner: nonEmptyString,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
});

export const evidenceTransformationSchema = z.object({
  sourceArtifactId: nonEmptyString,
  pathwayId: nonEmptyString,
  evidenceUse: z.array(nonEmptyString).min(2).max(4),
  missingProof: z.array(nonEmptyString).min(1).max(3),
  truthfulFraming: nonEmptyString,
  owner: nonEmptyString,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
});

export const pathwayLaunchPlanSchema = z.object({
  startModeOrder: z.array(startModeSchema).length(3),
  pathwayIds: idList.length(5),
  featuredArtifactId: nonEmptyString,
  defaultHorizon: z.literal('15-minutes'),
}).superRefine((plan, context) => {
  if (new Set(plan.startModeOrder).size !== plan.startModeOrder.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['startModeOrder'], message: '开始方式不得重复' });
  }
  if (new Set(plan.pathwayIds).size !== plan.pathwayIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathwayIds'], message: '首页路径不得重复' });
  }
});

export const pathwayHomePlanSchema = z.object({
  primaryJourneyId: z.enum(['compare', 'capability', 'project']).optional(),
  majorIds: idList.length(2).optional(),
  sharedFoundation: z.array(nonEmptyString).min(1).max(6).optional(),
  featuredDualLensCaseId: nonEmptyString.optional(),
  capabilityIds: idList.min(1).max(8).optional(),
  projectIds: idList.min(1).max(3).optional(),
  scenarioIds: idList.min(1).max(6).optional(),
  faqId: nonEmptyString.optional(),
  showExploreSection: z.boolean().optional(),
  evidenceRecordId: nonEmptyString.optional(),
  pathwayLaunch: pathwayLaunchPlanSchema,
});

export const pathwayDataSchema = z.object({
  pathways: z.array(pathwaySchema).length(5),
  artifacts: z.array(pathwayArtifactSchema).min(1),
  evidenceTransformations: z.array(evidenceTransformationSchema).min(5),
  homePlan: pathwayHomePlanSchema,
}).superRefine((data, context) => {
  const pathIds = data.pathways.map((pathway) => pathway.id);
  const pathSlugs = data.pathways.map((pathway) => pathway.slug);
  const artifactIds = data.artifacts.map((artifact) => artifact.id);
  if (new Set(pathIds).size !== pathIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways'], message: '路径 id 不得重复' });
  if (new Set(pathSlugs).size !== pathSlugs.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways'], message: '路径 slug 不得重复' });
  if (new Set(artifactIds).size !== artifactIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['artifacts'], message: 'artifact id 不得重复' });
  data.pathways.forEach((pathway, index) => {
    if (new Set(pathway.capabilityIds).size !== pathway.capabilityIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways', index, 'capabilityIds'], message: '能力关系不得重复' });
    if (new Set(pathway.projectIds).size !== pathway.projectIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways', index, 'projectIds'], message: '项目关系不得重复' });
    if (new Set(pathway.scenarioIds).size !== pathway.scenarioIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways', index, 'scenarioIds'], message: '场景关系不得重复' });
    if (new Set(pathway.sourceIds).size !== pathway.sourceIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['pathways', index, 'sourceIds'], message: '来源关系不得重复' });
  });
  data.evidenceTransformations.forEach((transformation, index) => {
    if (!pathIds.includes(transformation.pathwayId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['evidenceTransformations', index, 'pathwayId'], message: `路径不存在：${transformation.pathwayId}` });
    if (!artifactIds.includes(transformation.sourceArtifactId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['evidenceTransformations', index, 'sourceArtifactId'], message: `artifact 不存在：${transformation.sourceArtifactId}` });
  });
  data.homePlan.pathwayLaunch.pathwayIds.forEach((id, index) => {
    if (!pathIds.includes(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['homePlan', 'pathwayLaunch', 'pathwayIds', index], message: `首页路径不存在：${id}` });
  });
  if (!artifactIds.includes(data.homePlan.pathwayLaunch.featuredArtifactId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['homePlan', 'pathwayLaunch', 'featuredArtifactId'], message: '首页 featuredArtifactId 不存在' });
  }
});

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

export const homeJourneyIdSchema = z.enum(['try', 'compare', 'explore']);
export const homeSectionIdSchema = z.enum(['launch', 'discover', 'projects', 'trust']);
const internalHrefSchema = z.string().regex(/^\/(?!\/)[^\s]+$/, '首页入口必须是站内绝对路径');

export const homeJourneySchema = z.object({
  id: homeJourneyIdSchema,
  intent: homeJourneyIdSchema,
  label: nonEmptyString,
  summary: nonEmptyString,
  availabilityLabel: nonEmptyString,
  fallbackLabel: nonEmptyString.optional(),
  safetyCue: nonEmptyString.optional(),
  fallbackJourneyId: homeJourneyIdSchema.optional(),
  href: internalHrefSchema.optional(),
  projectId: nonEmptyString.optional(),
  resourceId: nonEmptyString.optional(),
}).superRefine((journey, context) => {
  if (journey.id !== journey.intent) context.addIssue({ code: z.ZodIssueCode.custom, path: ['intent'], message: '首页 journey 的 intent 必须与 id 一致' });
  if (journey.id === 'try') {
    if (!journey.projectId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['projectId'], message: 'try journey 必须绑定项目' });
    if (!journey.resourceId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['resourceId'], message: 'try journey 必须绑定资源' });
    if (!journey.fallbackLabel) context.addIssue({ code: z.ZodIssueCode.custom, path: ['fallbackLabel'], message: 'try journey 必须提供 fallback 文案' });
    if (journey.href) context.addIssue({ code: z.ZodIssueCode.custom, path: ['href'], message: 'try journey 的 href 由资源 manifest 导出' });
  } else if (!journey.href) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['href'], message: `${journey.id} journey 必须提供 href` });
  }
  if (journey.fallbackJourneyId === journey.id) context.addIssue({ code: z.ZodIssueCode.custom, path: ['fallbackJourneyId'], message: '首页 journey 不得回退到自身' });
});

export const homeCompositionSchema = z.object({
  primaryJourneyId: homeJourneyIdSchema,
  sectionOrder: z.array(homeSectionIdSchema).length(4),
  journeys: z.array(homeJourneySchema).length(3),
  discoveryItemIds: idList.min(1).max(4),
}).superRefine((composition, context) => {
  const ids = composition.journeys.map((journey) => journey.id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['journeys'], message: '首页 journey id 不得重复' });
  if (!ids.includes(composition.primaryJourneyId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['primaryJourneyId'], message: '首页主 journey 必须存在于 journeys' });
  if (new Set(composition.sectionOrder).size !== composition.sectionOrder.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['sectionOrder'], message: '首页区块顺序不得重复' });
  if (new Set(composition.discoveryItemIds).size !== composition.discoveryItemIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['discoveryItemIds'], message: '首页探索实体不得重复' });
  composition.journeys.forEach((journey, index) => {
    if (journey.fallbackJourneyId && !ids.includes(journey.fallbackJourneyId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['journeys', index, 'fallbackJourneyId'], message: `首页 fallback journey 不存在：${journey.fallbackJourneyId}` });
  });
});

export const homePlanSchema = z.object({
  majorIds: z.array(nonEmptyString).length(2),
  sharedFoundation: z.array(nonEmptyString).min(3).max(6),
  featuredDualLensCaseId: nonEmptyString,
  capabilityIds: z.array(nonEmptyString).min(2).max(3),
  projectIds: z.array(nonEmptyString).length(3),
  scenarioIds: z.array(nonEmptyString).min(1).max(6),
  faqId: nonEmptyString,
  showExploreSection: z.boolean(),
  composition: homeCompositionSchema,
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
  owner: nonEmptyString,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
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

export const projectArtifactTemplateSchema = z.object({
  label: nonEmptyString,
  href: z.string().regex(/^\/(?!\/)[^\s]+$/, '模板必须是站内绝对路径'),
  version: nonEmptyString,
  license: nonEmptyString,
});

export const projectPreviewSchema = z.object({
  src: z.string().regex(/^\/project-previews\/(?!\/)[^\s]+$/, '项目素材必须位于 /project-previews/'),
  alt: nonEmptyString,
  kind: z.enum(['project_output', 'process', 'diagram']),
  author: nonEmptyString,
  license: nonEmptyString,
  sourceRef: nonEmptyString,
  generationRef: nonEmptyString,
  updatedAt: dateSchema,
});

const projectInputSchema = z.object({
  ...primaryMetadata,
  title: nonEmptyString,
  navigationLabel: nonEmptyString,
  kicker: nonEmptyString,
  summary: nonEmptyString,
  cardSummary: z.string().trim().min(1).max(48),
  taskSummary: z.string().trim().min(1).max(48),
  outputSummary: z.string().trim().min(1).max(48),
  primaryAction: z.object({ label: nonEmptyString, href: nonEmptyString }),
  primaryResourceId: nonEmptyString.optional(),
  launch: z.object({ primaryResourceId: nonEmptyString, maxStartSeconds: z.number().int().positive(), tenMinuteOutput: nonEmptyString }).optional(),
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
  stopCondition: nonEmptyString,
  expectedOutput: nonEmptyString,
  artifactId: nonEmptyString,
  artifactTemplate: projectArtifactTemplateSchema,
  reflectionPrompt: nonEmptyString,
  validation: nonEmptyString,
  nextStep: nonEmptyString,
  boundary: nonEmptyString,
  dataBoundary: nonEmptyString,
  safetyBoundary: nonEmptyString,
  sourceUrl: z.string().url().startsWith('https://'),
  quickTry: quickTrySchema,
  resourceHealth: resourceHealthSchema,
  endpointIds: idList.min(1),
  previewAssets: z.array(projectPreviewSchema).min(1).optional(),
  preview: projectPreviewSchema.optional(),
  owner: nonEmptyString,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
}).superRefine((project, context) => {
  if (!project.previewAssets?.length && !project.preview) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['previewAssets'], message: '项目必须提供 previewAssets，迁移期可读取单个 preview' });
  }
});

export const projectSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const project = input as Record<string, unknown>;
  return !project.previewAssets && project.preview ? { ...project, previewAssets: [project.preview] } : project;
}, projectInputSchema).transform((project) => {
  const previewAssets = project.previewAssets ?? (project.preview ? [project.preview] : []);
  const preview = project.preview ?? previewAssets.find((asset) => asset.kind === 'project_output') ?? previewAssets[0];
  if (!preview) throw new Error(`项目 ${project.id} 缺少可用预览`);
  return { ...project, previewAssets, preview };
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
  authorityTier: z.enum(['A', 'B', 'C', 'D']).optional(),
};

export const sourceSchema = z.discriminatedUnion('accessType', [
  z.object({ ...sourceRecordBase, accessType: z.literal('public_url'), url: z.string().url().startsWith('https://') }),
  z.object({ ...sourceRecordBase, accessType: z.enum(['institutional', 'internal']), url: z.never().optional() }),
]);

export const claimSubjectTypeSchema = z.enum(['major', 'major_comparison', 'dual_lens_case', 'project', 'pathway', 'pathway_notice']);
export const claimFieldSchema = z.enum(['totalCredits', 'sharedFoundation', 'focusTask', 'representativeCourseGroup', 'sharedGoal', 'sharedArtifact', 'dataBoundary', 'safetyBoundary', 'eligibilityBoundary', 'noticeWindow']);
export const evidenceRefSchema = z.object({
  id: nonEmptyString,
  sourceId: nonEmptyString,
  endpointId: nonEmptyString.optional(),
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
  ownerType: z.enum(['source', 'project', 'pathway']),
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

export const contentUpdateSchema = z.object({
  id: nonEmptyString,
  entityType: z.enum(['project', 'faq', 'dual-lens-case', 'source']),
  entityId: nonEmptyString,
  kind: z.enum(['content-update', 'source-reverification']),
  summary: nonEmptyString,
  publishedAt: dateSchema,
  owner: nonEmptyString,
});

export const contentUpdatesSchema = z.array(contentUpdateSchema).max(3);

export const authorityTierSchema = z.enum(['A', 'B', 'C', 'D']);

export type PathwayKind = z.infer<typeof pathwayKindSchema>;
export type StartMode = z.infer<typeof startModeSchema>;
export type ActionHorizon = z.infer<typeof actionHorizonSchema>;
export type PathwayAction = z.infer<typeof pathwayActionSchema>;
export type Pathway = z.infer<typeof pathwaySchema>;
export type EmploymentPathway = z.infer<typeof employmentPathwaySchema>;
export type DomesticPostgraduatePathway = z.infer<typeof domesticPostgraduatePathwaySchema>;
export type PublicServicePathway = z.infer<typeof publicServicePathwaySchema>;
export type OverseasStudyPathway = z.infer<typeof overseasStudyPathwaySchema>;
export type IndependentWorkPathway = z.infer<typeof independentWorkPathwaySchema>;
export type PathwayArtifact = z.infer<typeof pathwayArtifactSchema>;
export type EvidenceTransformation = z.infer<typeof evidenceTransformationSchema>;
export type PathwayLaunchPlan = z.infer<typeof pathwayLaunchPlanSchema>;
export type PathwayHomePlan = z.infer<typeof pathwayHomePlanSchema>;
export type PathwayData = z.infer<typeof pathwayDataSchema>;
export const siteDataSchema = z.object({
  siteMeta: siteMetaSchema,
  majors: z.array(majorSchema).min(2),
  dualLensCases: z.array(dualLensCaseSchema).min(2),
  capabilities: z.array(capabilitySchema).min(8),
  projects: z.array(projectSchema).min(3),
  scenarios: z.array(scenarioSchema).min(6),
  faqs: z.array(faqSchema).min(3),
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
  const resourcesById = new Map(resourceManifests.flatMap((manifest) => manifest.resources.map((resource) => [resource.id, { resource, manifest }] as const)));
  const home = data.siteMeta.home;
  const checkHomeIds = (ids: string[], available: Set<string>, path: string) => {
    if (new Set(ids).size !== ids.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', path], message: '首页编排 ID 不得重复' });
    ids.forEach((id, index) => { if (!available.has(id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', path, index], message: `首页编排实体不存在：${id}` }); });
  };
  checkHomeIds(home.majorIds, majorIds, 'majorIds');
  checkHomeIds(home.capabilityIds, capabilityIds, 'capabilityIds');
  checkHomeIds(home.projectIds, projectIds, 'projectIds');
  checkHomeIds(home.scenarioIds, scenarioIds, 'scenarioIds');
  home.composition.journeys.forEach((journey, index) => {
    if (journey.projectId && !projectIds.has(journey.projectId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'composition', 'journeys', index, 'projectId'], message: `首页 journey 项目不存在：${journey.projectId}` });
    if (journey.resourceId) {
      const resourceEntry = resourcesById.get(journey.resourceId);
      if (!resourceEntry) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'composition', 'journeys', index, 'resourceId'], message: `首页 journey 资源不存在：${journey.resourceId}` });
      else {
        if (resourceEntry.resource.kind !== 'starter') context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'composition', 'journeys', index, 'resourceId'], message: `首页 try journey 必须指向 starter：${journey.resourceId}` });
        if (journey.projectId && resourceEntry.manifest.projectId !== journey.projectId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'composition', 'journeys', index, 'resourceId'], message: `首页 journey 资源与项目不一致：${journey.resourceId}` });
        if (resourceEntry.resource.internalFallbackPath && !internalHrefSchema.safeParse(resourceEntry.resource.internalFallbackPath).success) context.addIssue({ code: z.ZodIssueCode.custom, path: ['siteMeta', 'home', 'composition', 'journeys', index, 'resourceId'], message: `首页 journey fallback 必须是站内路径：${resourceEntry.resource.internalFallbackPath}` });
      }
    }
  });
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
export type ProjectPreview = z.infer<typeof projectPreviewSchema>;
export type ClaimSubjectType = z.infer<typeof claimSubjectTypeSchema>;
export type ClaimField = z.infer<typeof claimFieldSchema>;
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type ClaimRegistryEntry = z.infer<typeof claimRegistryEntrySchema>;
export type ResourceEndpoint = z.infer<typeof resourceEndpointSchema>;
export type LinkAvailability = z.infer<typeof linkAvailabilitySchema>;
export type EvidenceData = z.infer<typeof evidenceDataSchema>;
export type ContentUpdate = z.infer<typeof contentUpdateSchema>;
export type AuthorityTier = z.infer<typeof authorityTierSchema>;

export function parsePathwayData(input: unknown): PathwayData {
  return pathwayDataSchema.parse(input);
}

export function parseSiteData(input: unknown): SiteData {
  return siteDataSchema.parse(input);
}
