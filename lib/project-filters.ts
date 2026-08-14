import type { Capability, Major, Project, Scenario } from '@/lib/content';

export const PROJECT_FILTER_KEYS = ['major', 'capability', 'scenario', 'viewpoint', 'duration'] as const;
export type ProjectFilterKey = typeof PROJECT_FILTER_KEYS[number];
export type ProjectSearchParams = Record<string, string | string[] | undefined>;
export type ProjectFilterValues = Partial<Record<ProjectFilterKey, string>>;

export type ParsedProjectFilters = {
  values: ProjectFilterValues;
  valid: Array<{ key: ProjectFilterKey; value: string; label: string }>;
  invalid: Array<{ key: ProjectFilterKey; value: string }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseProjectFilters(searchParams: ProjectSearchParams, source: { projects: Project[]; majors: Major[]; capabilities: Capability[]; scenarios: Scenario[] }): ParsedProjectFilters {
  const majorMap = new Map(source.majors.map((item) => [item.id, item.shortName]));
  const capabilityMap = new Map(source.capabilities.map((item) => [item.id, item.shortName]));
  const scenarioMap = new Map(source.scenarios.map((item) => [item.id, item.name]));
  const viewpoints = new Set(source.projects.map((item) => item.viewpoint));
  const durations = new Set(source.projects.flatMap((item) => item.durationBands));
  const values: ProjectFilterValues = {};
  const valid: ParsedProjectFilters['valid'] = [];
  const invalid: ParsedProjectFilters['invalid'] = [];
  const definitions: Record<ProjectFilterKey, { label: (value: string) => string | undefined; valid: (value: string) => boolean }> = {
    major: { label: (value) => majorMap.get(value), valid: (value) => majorMap.has(value) },
    capability: { label: (value) => capabilityMap.get(value), valid: (value) => capabilityMap.has(value) },
    scenario: { label: (value) => scenarioMap.get(value), valid: (value) => scenarioMap.has(value) },
    viewpoint: { label: (value) => value, valid: (value) => viewpoints.has(value) },
    duration: { label: (value) => value, valid: (value) => durations.has(value) },
  };

  for (const key of PROJECT_FILTER_KEYS) {
    const value = firstValue(searchParams[key]);
    if (!value || value === 'all') continue;
    const definition = definitions[key];
    if (definition.valid(value) && definition.label(value)) {
      values[key] = value;
      valid.push({ key, value, label: definition.label(value) as string });
    } else {
      invalid.push({ key, value });
    }
  }

  return { values, valid, invalid };
}

export function filterProjects(projects: Project[], values: ProjectFilterValues) {
  return projects.filter((project) => {
    if (values.major && !project.majorIds.includes(values.major)) return false;
    if (values.capability && !project.capabilityIds.includes(values.capability)) return false;
    if (values.scenario && !project.scenarioIds.includes(values.scenario)) return false;
    if (values.viewpoint && project.viewpoint !== values.viewpoint) return false;
    if (values.duration && !project.durationBands.includes(values.duration)) return false;
    return true;
  });
}

export function removeProjectFilter(searchParams: ProjectSearchParams, key: ProjectFilterKey) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(searchParams)) {
    if (name === key || value === undefined) continue;
    const first = firstValue(value);
    if (first) params.set(name, first);
  }
  const query = params.toString();
  return `/projects${query ? `?${query}` : ''}#project-list`;
}

export function projectFilterSummaryHref() {
  return '/projects#project-list';
}
