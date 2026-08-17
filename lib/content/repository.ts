import 'server-only';

import rawSiteData from '../../content/site-data.json';
import { aggregateProjectResourceHealth, evidenceData } from './evidence';
import { parseSiteData, type Capability, type Major, type Project, type Scenario, type SiteData } from './schema';

const parsedSiteData = parseSiteData(rawSiteData);

export const siteData: SiteData = {
  ...parsedSiteData,
  projects: parsedSiteData.projects.map((project) => ({ ...project, resourceHealth: aggregateProjectResourceHealth(project.id) })),
};

export function getSiteData(): SiteData {
  return siteData;
}

export function getEvidenceData() {
  return evidenceData;
}

export function getMajorBySlug(slug: string): Major | undefined {
  return siteData.majors.find((item) => item.slug === slug);
}

export function getCapabilityBySlug(slug: string): Capability | undefined {
  return siteData.capabilities.find((item) => item.slug === slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return siteData.projects.find((item) => item.slug === slug);
}

export function getScenarioBySlug(slug: string): Scenario | undefined {
  return siteData.scenarios.find((item) => item.slug === slug);
}
