import type { ProjectCatalogItem, RelationLink } from './view-models';

export const PROJECT_FILTER_KEYS = ['major', 'capability', 'scenario', 'viewpoint', 'duration'] as const;
export type ProjectFilterKey = typeof PROJECT_FILTER_KEYS[number];
export type ProjectFilterState = { major: string; capability: string; scenario: string; viewpoint: string; duration: string };
export type ProjectSearchParams = Record<string, string | string[] | undefined>;
export type LegacyProjectCondition = { key: ProjectFilterKey; value: string; label: string };
export type ParsedLegacyProjectFilters = {
  values: ProjectFilterState;
  valid: LegacyProjectCondition[];
  invalid: Array<{ key: ProjectFilterKey; value: string }>;
};

export function filterProjectCatalog(items: ProjectCatalogItem[], selected: ProjectFilterState) {
  return items.filter((project) => (
    (selected.major === 'all' || project.majorIds.includes(selected.major)) &&
    (selected.capability === 'all' || project.capabilityIds.includes(selected.capability)) &&
    (selected.scenario === 'all' || project.scenarioIds.includes(selected.scenario)) &&
    (selected.viewpoint === 'all' || project.viewpoint === selected.viewpoint) &&
    (selected.duration === 'all' || project.durationBands.includes(selected.duration))
  ));
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseLegacyProjectFilters(searchParams: ProjectSearchParams, filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] }): ParsedLegacyProjectFilters {
  const values: ProjectFilterState = { major: 'all', capability: 'all', scenario: 'all', viewpoint: 'all', duration: 'all' };
  const valid: LegacyProjectCondition[] = [];
  const invalid: ParsedLegacyProjectFilters['invalid'] = [];
  const definitions: Record<ProjectFilterKey, { values: string[]; label: (value: string) => string | undefined }> = {
    major: { values: filters.major.map((item) => item.id), label: (value) => filters.major.find((item) => item.id === value)?.label },
    capability: { values: filters.capability.map((item) => item.id), label: (value) => filters.capability.find((item) => item.id === value)?.label },
    scenario: { values: filters.scenario.map((item) => item.id), label: (value) => filters.scenario.find((item) => item.id === value)?.label },
    viewpoint: { values: filters.viewpoint, label: (value) => value },
    duration: { values: filters.duration, label: (value) => value },
  };

  for (const key of PROJECT_FILTER_KEYS) {
    const value = firstValue(searchParams[key]);
    if (!value || value === 'all') continue;
    const definition = definitions[key];
    const label = definition.values.includes(value) ? definition.label(value) : undefined;
    if (label) {
      values[key] = value;
      valid.push({ key, value, label });
    } else invalid.push({ key, value });
  }
  return { values, valid, invalid };
}

export function removeLegacyProjectFilter(searchParams: ProjectSearchParams, key: ProjectFilterKey) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(searchParams)) {
    if (name === key || value === undefined) continue;
    const first = firstValue(value);
    if (first) params.set(name, first);
  }
  const query = params.toString();
  return `/projects${query ? `?${query}` : ''}#project-list`;
}

export function clearLegacyProjectFilters() {
  return '/projects#project-list';
}
