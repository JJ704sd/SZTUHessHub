import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCapabilityDetailModel,
  getHomePageModel,
  getPathwayData,
  getProjectCatalog,
  getProjectDetailModel,
  getScenarioDetailModel,
  getSiteData,
} from '@/lib/content';
import { parseSiteData } from '@/lib/content/schema';
import { canBePrimary, deriveResourceStatus, primaryResourceConditions, resourceManifests, validateResourceManifest } from '@/lib/resources';

function nonWhitespaceLength(value: string) {
  return value.replace(/\s/g, '').length;
}

describe('Phase 1.5 content model', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-21T00:00:00Z'));
    vi.stubEnv('EVIDENCE_BUILD_DATE', '');
    vi.stubEnv('BUILD_DATE', '');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it.each([['2026-10-03', 'verified'], ['2027-10-03', 'review_due']])('keeps configured content visible and marks editorial review due on %s', (date, pathwayFactStatus) => {
    vi.setSystemTime(new Date(`${date}T00:00:00Z`));

    const home = getHomePageModel();

    expect(home.editorialReviewDue).toBe(true);
    expect(home.projects.map((project) => project.id)).toEqual(['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix']);
    expect(home.featuredDualLensCase.id).toBe('case-wearable-vital-signs');
    expect(home.faqs).toHaveLength(3);
    expect(home.faqs[0].id).toBe('faq-shared-foundation');
    expect(home.evidence.artifact.id).toBe('artifact-signal-analysis');
    expect(home.evidence.transformations.map((item) => item.pathwayId)).toEqual(['path-employment', 'path-domestic-postgraduate', 'path-public-service', 'path-overseas-study', 'path-independent-work']);
    expect(home.pathways).toHaveLength(5);
    expect(home.actionLadder).toHaveLength(4);
    expect(home.reviewDueItems).toEqual(expect.arrayContaining(['project-signal-feature-notebook', 'case-wearable-vital-signs', 'artifact-signal-analysis', 'path-employment', 'transformation:artifact-signal-analysis:path-employment']));
    expect(home.homeActions.find((action) => action.id === 'try')).toMatchObject({ status: 'pending', directStart: false, href: '/projects/signal-feature-notebook' });
    expect(home.trust.claimStatus).toBe('unverified');
    expect(home.trust.factStatus).toBe(pathwayFactStatus);
  });

  it('projects a task-first home without rendering detail-only content', () => {
    const home = getHomePageModel();

    expect(home.editorialReviewDue).toBe(false);
    expect(home.reviewDueItems).toEqual([]);
    expect(home.tasks.map((task) => task.id)).toEqual(['compare', 'try', 'explore']);
    expect(home.tasks.map((task) => task.href)).toEqual(['/majors/compare#dual-lens', '/projects/signal-feature-notebook', '/pathways/explore']);
    expect(home.primaryJourneyId).toBe(home.homeComposition.primaryJourneyId);
    expect(home.primaryJourneyId).toBe('try');
    expect(home.tasks.filter((task) => task.isPrimary)).toHaveLength(1);
    expect(home.tasks.filter((task) => task.isPrimary).map((task) => task.id)).toEqual([home.primaryJourneyId]);
    expect(home.homeActions.map((action) => action.id)).toEqual(['compare', 'try', 'explore']);
    expect(home.homeActions.filter((action) => action.isPrimary).map((action) => action.id)).toEqual(['try']);
    expect(home.homeActions.find((action) => action.id === 'try')).toMatchObject({
      href: '/projects/signal-feature-notebook',
      fallbackHref: '/projects/signal-feature-notebook',
      fallbackLabel: '先看 Starter 状态',
      directStart: false,
      status: 'pending',
      statusLabel: 'Starter 待人工复核',
      statusDetail: 'Starter 待人工复核 · 机器可达 · 人工与许可待复核',
    });
    expect(home.homeComposition.sectionOrder).toEqual(['launch', 'discover', 'projects', 'trust']);
    expect(home.homeComposition.discoveryItemIds).toEqual(['case-wearable-vital-signs', 'artifact-signal-analysis']);
    expect(home.modules.map((module) => module.id)).toEqual(home.homeComposition.sectionOrder);
    expect(home.capabilities).toHaveLength(3);
    expect(home.projects).toHaveLength(3);
    expect(home.scenarios).toHaveLength(6);
    expect(home.sharedFoundation).toEqual(getSiteData().siteMeta.home.sharedFoundation);
    expect(nonWhitespaceLength(home.explanatoryText)).toBeLessThanOrEqual(140);
    expect(home.projects.every((project) => project.cardSummary.length <= 48)).toBe(true);
    expect(home.projects.every((project) => !('steps' in project))).toBe(true);
    expect(home.projects.every((project) => !('boundary' in project))).toBe(true);
  });

  it('rejects broken home journey references before rendering', () => {
    const invalid = JSON.parse(JSON.stringify(getSiteData())) as Record<string, any>;
    invalid.siteMeta.home.composition.journeys[2].id = 'try';
    invalid.siteMeta.home.composition.journeys[2].intent = 'try';
    expect(() => parseSiteData(invalid)).toThrow(/journey id 不得重复/);
  });

  it('rejects missing and cross-project Starter references before rendering', () => {
    const missing = JSON.parse(JSON.stringify(getSiteData())) as Record<string, any>;
    missing.siteMeta.home.composition.journeys[1].resourceId = 'resource-missing';
    expect(() => parseSiteData(missing)).toThrow(/资源不存在/);

    const crossProject = JSON.parse(JSON.stringify(getSiteData())) as Record<string, any>;
    crossProject.siteMeta.home.composition.journeys[1].projectId = 'project-sensor-alarm-prototype';
    expect(() => parseSiteData(crossProject)).toThrow(/资源与项目不一致/);
  });

  it('still rejects missing configured entities after their review dates pass', () => {
    vi.setSystemTime(new Date('2027-10-03T00:00:00Z'));
    const data = getSiteData();
    const home = data.siteMeta.home;
    const projectIds = home.projectIds;
    const discoveryIds = home.composition.discoveryItemIds;
    const transformation = getPathwayData().evidenceTransformations[0];
    const pathwayId = transformation.pathwayId;

    try {
      home.projectIds = ['project-missing', ...projectIds.slice(1)];
      expect(() => getHomePageModel()).toThrow('首页项目 缺少登记实体 project-missing');
      home.projectIds = projectIds;

      home.composition.discoveryItemIds = ['case-missing', 'artifact-signal-analysis'];
      expect(() => getHomePageModel()).toThrow('首页显式编排引用缺失');
      home.composition.discoveryItemIds = ['case-wearable-vital-signs', 'artifact-missing'];
      expect(() => getHomePageModel()).toThrow('首页编排缺少产物');
      home.composition.discoveryItemIds = discoveryIds;

      transformation.pathwayId = 'path-missing';
      expect(() => getHomePageModel()).toThrow('首页产物改写缺少路径：path-missing');
    } finally {
      home.projectIds = projectIds;
      home.composition.discoveryItemIds = discoveryIds;
      transformation.pathwayId = pathwayId;
    }
  });

  it('keeps the project catalog to interactive fields only', () => {
    const catalog = getProjectCatalog();
    const forbidden = ['courseEvidence', 'prerequisites', 'tools', 'steps', 'validation', 'boundary', 'license'];

    expect(catalog.items).toHaveLength(3);
    expect(catalog.items.every((item) => item.cardSummary.length <= 48)).toBe(true);
    expect(catalog.items.every((item) => item.outputSummary.length > 0)).toBe(true);
    expect(catalog.items.every((item) => forbidden.every((key) => !(key in item)))).toBe(true);
    expect(catalog.items.every((item) => !('linkAvailability' in item) && !('endpoints' in item) && !('quickTry' in item) && !('claims' in item))).toBe(true);
    const detail = getProjectDetailModel('signal-feature-notebook')?.catalog;
    expect(detail?.linkAvailability.length).toBeGreaterThan(0);
    expect(detail?.endpoints.length).toBeGreaterThan(0);
    expect(detail?.quickTry.enabled).toBe(true);
    expect(catalog.filters.major.length).toBe(2);
    expect(catalog.filters.capability.length).toBe(8);
    expect(catalog.filters.scenario.length).toBe(6);
  });

  it('derives navigable reverse relations from one content source', () => {
    const capability = getCapabilityDetailModel('cap-signal-data-ai');
    const project = getProjectDetailModel('signal-feature-notebook');
    const scenario = getScenarioDetailModel('scenario-healthcare');

    expect(capability?.projects.length).toBeGreaterThan(0);
    expect(capability?.scenarios.length).toBeGreaterThan(0);
    expect(project?.capabilities.some((item) => item?.slug === capability?.capability.slug)).toBe(true);
    expect(scenario?.projects.length).toBeGreaterThan(0);
    expect(scenario?.capabilities.length).toBeGreaterThan(0);
  });

  it('validates media contracts against local assets and resource health states', () => {
    const data = getSiteData();

    expect(data.mediaAssets.length).toBeGreaterThanOrEqual(3);
    for (const asset of data.mediaAssets) {
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.decorative ? asset.alt : asset.alt.length).toBe(asset.decorative ? '' : asset.alt.length);
      expect(existsSync(resolve(process.cwd(), `public${asset.src}`))).toBe(true);
    }

    for (const project of data.projects) {
      expect(['available', 'degraded', 'unverified', 'unavailable']).toContain(project.resourceHealth.status);
      if (project.resourceHealth.status === 'unavailable') {
        expect(project.resourceHealth.replacementUrl || project.resourceHealth.note).toBeTruthy();
      }
    }
  });

  it('keeps primary resource conditions explicit and replacement references safe', () => {
    const manifest = resourceManifests[0];
    const primary = manifest.resources.find((resource) => resource.id === manifest.primaryResourceId);
    expect(validateResourceManifest(manifest)).toEqual([]);
    expect(primary).toBeDefined();
    expect(primaryResourceConditions(primary as NonNullable<typeof primary>)).toEqual({ machineReachable: true, humanVerified: false, fresh: false });
    expect(canBePrimary(primary as NonNullable<typeof primary>)).toBe(false);
  });

  it('does not promote a resource without explicit approval evidence', () => {
    const primary = resourceManifests[0].resources[0];
    const now = new Date('2026-08-21T00:00:00Z');
    const contradictory = { ...primary, availability: 'reachable' as const, reviewStatus: 'verified' as const, license: 'NOASSERTION', ownerId: 'owner-pending-confirmation', lastHumanWalkthroughAt: '2026-08-20', reviewedBy: 'pending-reviewer', walkthroughEvidence: 'pending' };
    expect(deriveResourceStatus(contradictory, now)).toBe('pending');
    expect(canBePrimary(contradictory, now)).toBe(false);

    const stale = { ...contradictory, license: 'CC BY 4.0', ownerId: 'owner-hseehub', lastHumanWalkthroughAt: '2026-07-01', reviewedBy: 'reviewer', walkthroughEvidence: 'walkthrough-1' };
    expect(deriveResourceStatus(stale, now)).toBe('stale');
  });
});
