import { describe, expect, it } from 'vitest';
import { careerResourceCatalogSchema, employmentPathwaySchema } from '@/lib/content/schema';
import rawPathways from '@/content/pathways.json';

function catalogFixture() {
  return {
    owner: '资源目录编辑',
    updatedAt: '2026-08-01',
    reviewDueAt: '2026-09-01',
    items: [
      { id: 'career-platform', title: '学生求职入口', url: 'https://example.com/students', category: 'platform' as const, description: '浏览实习与校招入口。', tags: ['实习', '校招'], accessNote: '申请前在原站核对账号要求。' },
      { id: 'career-medical', title: '医疗工程招聘入口', url: 'https://example.com/medical', category: 'medical' as const, description: '查看医疗工程相关招聘。', tags: ['医疗工程'], accessNote: '岗位条件以原站为准。' },
    ],
  };
}

describe('career resource catalog', () => {
  it('keeps a valid expired catalog readable without changing its metadata or items', () => {
    const catalog = { ...catalogFixture(), updatedAt: '2000-01-01', reviewDueAt: '2000-02-01' };
    expect(careerResourceCatalogSchema.parse(catalog)).toEqual(catalog);
  });

  it.each(['http://example.com/jobs', 'javascript:alert(1)', '/jobs', 'not-a-url'])('rejects an unsafe or invalid external URL: %s', (url) => {
    const catalog = catalogFixture();
    catalog.items[0].url = url;
    const result = careerResourceCatalogSchema.safeParse(catalog);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join('.') === 'items.0.url')).toBe(true);
  });

  it.each(['id', 'url'] as const)('rejects repeated resource %s values', (field) => {
    const catalog = catalogFixture();
    catalog.items[1][field] = catalog.items[0][field];
    const result = careerResourceCatalogSchema.safeParse(catalog);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ['items', 1, field], message: field === 'id' ? '就业资源 id 不得重复' : '就业资源 URL 不得重复' })]));
  });

  it.each(['owner', 'updatedAt', 'reviewDueAt', 'items'] as const)('rejects a missing catalog field: %s', (field) => {
    const catalog: Partial<ReturnType<typeof catalogFixture>> = catalogFixture();
    delete catalog[field];
    expect(careerResourceCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it.each(['updatedAt', 'reviewDueAt'] as const)('requires the existing date format for %s', (field) => {
    const catalog = catalogFixture();
    catalog[field] = '2026/10/03';
    expect(careerResourceCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it.each(['id', 'title', 'url', 'category', 'description', 'tags', 'accessNote'] as const)('rejects a missing resource field: %s', (field) => {
    const catalog = catalogFixture();
    const item: Partial<typeof catalog.items[number]> = catalog.items[0];
    delete item[field];
    expect(careerResourceCatalogSchema.safeParse({ ...catalog, items: [item] }).success).toBe(false);
  });

  it('requires an employment catalog and preserves it in the parsed pathway', () => {
    const employment = rawPathways.pathways.find((pathway) => pathway.kind === 'employment');
    const catalog = catalogFixture();
    expect(employmentPathwaySchema.parse({ ...employment, resourceCatalog: catalog }).resourceCatalog).toEqual(catalog);
    expect(employmentPathwaySchema.safeParse({ ...employment, resourceCatalog: undefined }).success).toBe(false);
  });

  it('rejects an empty directory, unknown categories and invalid tag counts', () => {
    const catalog = catalogFixture();
    expect(careerResourceCatalogSchema.safeParse({ ...catalog, items: [] }).success).toBe(false);
    expect(careerResourceCatalogSchema.safeParse({ ...catalog, items: [{ ...catalog.items[0], category: 'other' }] }).success).toBe(false);
    for (const tags of [[], ['1', '2', '3', '4', '5']]) {
      expect(careerResourceCatalogSchema.safeParse({ ...catalog, items: [{ ...catalog.items[0], tags }] }).success).toBe(false);
    }
  });
});
