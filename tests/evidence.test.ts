import { describe, expect, it } from 'vitest';
import { aggregateProjectResourceHealth, evidenceData, getClaimStatus, getClaimValue, hashClaimContent } from '@/lib/content/evidence';
import { getSiteData } from '@/lib/content';
import { parseSiteData } from '@/lib/content/schema';

describe('Phase 1.6 evidence contract', () => {
  it('covers every P0 claim with a current normalized content hash and evidence reference', () => {
    const data = getSiteData();
    // The modular content layer also stores pathway boundary claims in the
    // shared registry.  SiteData claims remain the Phase 1.6 P0 set; pathway
    // claims are validated against content/pathways.json by pathways:check.
    const siteClaims = evidenceData.claims.filter((claim) => claim.subjectType !== 'pathway');
    expect(siteClaims).toHaveLength(15);
    expect(evidenceData.claims.filter((claim) => claim.subjectType === 'pathway')).toHaveLength(5);
    for (const claim of siteClaims) {
      expect(claim.evidenceRefIds.length).toBeGreaterThan(0);
      expect(hashClaimContent(getClaimValue(data, claim))).toBe(claim.normalizedContentHash);
      expect(claim.evidenceRefIds.every((id) => evidenceData.evidenceRefs.some((ref) => ref.id === id))).toBe(true);
    }
  });

  it('keeps internal formal sources valid without fabricating a public URL', () => {
    const parsed = parseSiteData({
      ...getSiteData(),
      sources: [...getSiteData().sources, {
        id: 'source-internal-fixture',
        title: '校内正式文件示例',
        version: '2025',
        accessType: 'institutional',
        accessScope: '校内正式文件 · 无公开入口',
        kind: 'institutional-document',
        scope: '仅用于 schema 兼容性测试。',
        lastVerified: '2026-08-17',
      }],
    });
    const source = parsed.sources.at(-1);
    expect(source?.accessType).toBe('institutional');
    expect('url' in source!).toBe(false);
  });

  it('separates fact evidence from endpoint availability and aggregates all link states', () => {
    const endpoints = [
      { id: 'fixture-source', ownerType: 'project' as const, ownerId: 'fixture', role: 'source' as const, required: true, url: 'https://example.edu/source' },
      { id: 'fixture-tool', ownerType: 'project' as const, ownerId: 'fixture', role: 'tool' as const, required: false, url: 'https://example.edu/tool' },
      { id: 'fixture-replacement', ownerType: 'project' as const, ownerId: 'fixture', role: 'replacement' as const, required: false, url: 'https://example.edu/replacement' },
    ];
    const available = [
      { endpointId: 'fixture-source', checkedAt: '2026-08-17', status: 'available' as const },
      { endpointId: 'fixture-tool', checkedAt: '2026-08-17', status: 'available' as const },
    ];
    expect(aggregateProjectResourceHealth('fixture', [], endpoints).status).toBe('unverified');
    expect(aggregateProjectResourceHealth('fixture', [...available, { endpointId: 'fixture-replacement', checkedAt: '2026-08-17', status: 'available' as const }], endpoints).status).toBe('available');
    expect(aggregateProjectResourceHealth('fixture', [
      { endpointId: 'fixture-source', checkedAt: '2026-08-17', status: 'unavailable' as const },
      { endpointId: 'fixture-tool', checkedAt: '2026-08-17', status: 'available' as const },
      { endpointId: 'fixture-replacement', checkedAt: '2026-08-17', status: 'available' as const },
    ], endpoints).status).toBe('unavailable');
    expect(aggregateProjectResourceHealth('fixture', [
      { endpointId: 'fixture-source', checkedAt: '2026-08-17', status: 'unavailable' as const, replacementEndpointId: 'fixture-replacement' },
      { endpointId: 'fixture-tool', checkedAt: '2026-08-17', status: 'available' as const },
      { endpointId: 'fixture-replacement', checkedAt: '2026-08-17', status: 'available' as const },
    ], endpoints)).toMatchObject({ status: 'degraded', replacementUrl: 'https://example.edu/replacement' });
    expect(aggregateProjectResourceHealth('fixture', [
      { endpointId: 'fixture-source', checkedAt: '2026-08-17', status: 'available' as const },
      { endpointId: 'fixture-tool', checkedAt: '2026-08-17', status: 'unavailable' as const },
      { endpointId: 'fixture-replacement', checkedAt: '2026-08-17', status: 'available' as const },
    ], endpoints).status).toBe('degraded');
  });

  it('derives fixed-clock fact status without confusing it with link status', () => {
    const claim = evidenceData.claims[0];
    expect(getClaimStatus(claim, new Date('2026-08-17T00:00:00Z'))).toBe('unverified');
    const manuallyReviewedRefs = evidenceData.evidenceRefs.map((ref) => ref.id === claim.evidenceRefIds[0] ? { ...ref, owner: '内容负责人' } : ref);
    expect(getClaimStatus(claim, new Date('2026-08-17T00:00:00Z'), manuallyReviewedRefs)).toBe('verified');
    expect(getClaimStatus(claim, new Date('2026-09-14T00:00:00Z'), manuallyReviewedRefs)).toBe('review_due');
    expect(getClaimStatus({ ...claim, evidenceRefIds: ['missing-ref'] })).toBe('unverified');
  });
});
