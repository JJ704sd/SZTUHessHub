import type { ProjectCatalogItem } from './view-models';

export type ProjectFilterState = {
  major: string;
  capability: string;
  scenario: string;
  viewpoint: string;
  duration: string;
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
