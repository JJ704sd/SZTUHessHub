import rawSiteData from "../content/site-data.json";
import rawClaims from "../content/claims.json";
import rawSignalResourceManifest from "../content/resources/signal-feature-notebook.json";

export type SiteMeta = {
  title: string;
  tagline: string;
  description: string;
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
  expectedOutput: string;
  validation: string;
  nextStep: string;
  boundary: string;
  sourceUrl: string;
  sourceId: string;
  lastVerified: string;
  primaryResourceId?: string;
  launch?: ProjectLaunch;
};

export type AutomatedAvailability = 'unknown' | 'reachable' | 'unreachable';
export type HumanReviewStatus = 'pending' | 'verified' | 'stale';
export type ResourceKind = 'starter' | 'data' | 'tool' | 'guide' | 'reference';

export type ResourceLink = {
  id: string;
  title: string;
  url: string;
  kind: ResourceKind;
  version: string;
  license: string;
  licenseEvidenceUrl?: string;
  ownerId: string;
  availability: AutomatedAvailability;
  lastAutomatedCheckAt?: string;
  lastSuccessfulAt?: string;
  automatedStatusCode?: number;
  finalUrl?: string;
  reviewStatus: HumanReviewStatus;
  lastHumanWalkthroughAt?: string;
  reviewedBy?: string;
  walkthroughEvidence?: string;
  failureReason?: string;
  replacementResourceId?: string;
  internalFallbackPath?: string;
};

export type ProjectLaunch = {
  primaryResourceId: string;
  tenMinuteOutput: string;
  maxStartSeconds: 120;
};

export type ResourceManifest = {
  projectId: string;
  primaryResourceId: string;
  resources: ResourceLink[];
};

export type ContentClaim = {
  id: string;
  claimType: 'official' | 'translated' | 'example';
  sourceId: string;
  sourceLocator?: string;
  ownerId: string;
  reviewStatus: 'draft' | 'reviewed' | 'expired';
  reviewedAt?: string;
  reviewedBy?: string;
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
};

export type Source = {
  id: string;
  title: string;
  kind: string;
  url: string;
  version: string;
  scope: string;
  lastVerified: string;
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

  return input as SiteData;
}

function parseResourceManifest(input: unknown): ResourceManifest {
  assertRecord(input, 'resourceManifest');
  assertString(input.projectId, 'resourceManifest.projectId');
  assertString(input.primaryResourceId, 'resourceManifest.primaryResourceId');
  assertArray(input.resources, 'resourceManifest.resources');
  return input as ResourceManifest;
}

function parseClaims(input: unknown): ContentClaim[] {
  assertArray(input, 'claims');
  input.forEach((item, index) => {
    assertRecord(item, `claims[${index}]`);
    for (const field of ['id', 'claimType', 'sourceId', 'ownerId', 'reviewStatus', 'reviewDueAt']) assertString(item[field], `claims[${index}].${field}`);
  });
  return input as ContentClaim[];
}

export const siteData: SiteData = parseSiteData(rawSiteData);
export const resourceManifests: ResourceManifest[] = [parseResourceManifest(rawSignalResourceManifest)];
export const contentClaims = parseClaims(rawClaims);
