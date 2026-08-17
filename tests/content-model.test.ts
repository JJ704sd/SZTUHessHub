import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getCapabilityDetailModel,
  getHomePageModel,
  getProjectCatalog,
  getProjectDetailModel,
  getScenarioDetailModel,
  getSiteData,
} from '@/lib/content';
import { canBePrimary, primaryResourceConditions, resourceManifests, validateResourceManifest } from '@/lib/resources';

function nonWhitespaceLength(value: string) {
  return value.replace(/\s/g, '').length;
}

describe('Phase 1.5 content model', () => {
  it('projects a task-first home without rendering detail-only content', () => {
    const home = getHomePageModel();

    expect(home.tasks.map((task) => task.id)).toEqual(['compare', 'capability', 'project']);
    expect(home.tasks.map((task) => task.href)).toEqual(['/majors', '/capabilities', '/projects']);
    expect(home.primaryJourneyId).toBe('compare');
    expect(home.tasks.filter((task) => task.isPrimary)).toHaveLength(1);
    expect(home.tasks.filter((task) => task.isPrimary).map((task) => task.id)).toEqual([home.primaryJourneyId]);
    expect(home.modules.map((module) => module.id)).toEqual(['tasks', 'compare', 'projects', 'explore']);
    expect(home.capabilities).toHaveLength(3);
    expect(home.projects).toHaveLength(3);
    expect(home.scenarios).toHaveLength(6);
    expect(home.sharedFoundation).toEqual(getSiteData().siteMeta.home.sharedFoundation);
    expect(nonWhitespaceLength(home.explanatoryText)).toBeLessThanOrEqual(140);
    expect(home.projects.every((project) => project.cardSummary.length <= 48)).toBe(true);
    expect(home.projects.every((project) => !('steps' in project))).toBe(true);
    expect(home.projects.every((project) => !('boundary' in project))).toBe(true);
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
});
