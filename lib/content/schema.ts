import { z } from 'zod';

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

export const homePlanSchema = z.object({
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
  homePlan: homePlanSchema,
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

export const claimSubjectTypeSchema = z.enum(['major', 'major_comparison', 'dual_lens_case', 'project', 'pathway', 'pathway_notice']);
export const claimFieldSchema = z.enum([
  'totalCredits',
  'sharedFoundation',
  'focusTask',
  'representativeCourseGroup',
  'sharedGoal',
  'sharedArtifact',
  'dataBoundary',
  'safetyBoundary',
  'eligibilityBoundary',
  'noticeWindow',
]);

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
  evidenceRefIds: idList.min(1),
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
export type HomePlan = z.infer<typeof homePlanSchema>;
export type PathwayData = z.infer<typeof pathwayDataSchema>;
export type ClaimSubjectType = z.infer<typeof claimSubjectTypeSchema>;
export type ClaimField = z.infer<typeof claimFieldSchema>;
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type ClaimRegistryEntry = z.infer<typeof claimRegistryEntrySchema>;
export type ResourceEndpoint = z.infer<typeof resourceEndpointSchema>;
export type LinkAvailability = z.infer<typeof linkAvailabilitySchema>;
export type EvidenceData = z.infer<typeof evidenceDataSchema>;
export type AuthorityTier = z.infer<typeof authorityTierSchema>;

export function parsePathwayData(input: unknown): PathwayData {
  return pathwayDataSchema.parse(input);
}
