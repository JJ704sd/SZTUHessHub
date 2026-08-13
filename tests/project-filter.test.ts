import { describe, expect, it } from 'vitest';
import { getProjectCatalog } from '@/lib/content/view-models';
import { filterProjectCatalog } from '@/lib/content/filters';

describe('project catalog filtering', () => {
  it('keeps the default catalog result-first and applies quick filters predictably', () => {
    const catalog = getProjectCatalog();
    const duration = catalog.filters.duration[0];

    expect(filterProjectCatalog(catalog.items, { major: 'all', capability: 'all', scenario: 'all', viewpoint: 'all', duration: 'all' })).toHaveLength(3);

    const filtered = filterProjectCatalog(catalog.items, { major: 'all', capability: 'all', scenario: 'all', viewpoint: 'all', duration });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.durationBands.includes(duration))).toBe(true);
  });

  it('returns no results for an impossible relation without weakening the filter', () => {
    const catalog = getProjectCatalog();

    expect(filterProjectCatalog(catalog.items, { major: 'missing-major', capability: 'all', scenario: 'all', viewpoint: 'all', duration: 'all' })).toEqual([]);
  });
});
