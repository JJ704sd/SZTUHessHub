import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSiteData } from '@/lib/content/schema';

const data = parseSiteData(JSON.parse(readFileSync(resolve(process.cwd(), 'content/site-data.json'), 'utf8')));
const bannedTerms = ['诊断建议', '治疗建议', '就业保证', '排名第一', '保证就业', '包就业', '100%就业', '完全治愈', '治愈', '确诊', '处方', '零风险'];

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('content/schema gate', () => {
  it('parses all content through the single Zod schema and preserves required counts', () => {
    expect(data.majors).toHaveLength(2);
    expect(data.dualLensCases).toHaveLength(2);
    expect(data.capabilities).toHaveLength(8);
    expect(data.projects).toHaveLength(3);
    expect(data.scenarios).toHaveLength(6);
    expect(data.faqs.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps routes, safety language, media files, and short copy within the contract', () => {
    const slugs = [...data.majors, ...data.dualLensCases, ...data.capabilities, ...data.projects, ...data.scenarios, ...data.faqs].map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(strings(data).some((value) => bannedTerms.some((term) => value.includes(term) && !new RegExp(`(?:不|非|不能|不得|禁止|无|未)[^。；;:：]{0,14}${term}`).test(value)))).toBe(false);
    for (const asset of data.mediaAssets) expect(existsSync(resolve(process.cwd(), 'public', asset.src.slice(1)))).toBe(true);
    for (const project of data.projects) expect(project.cardSummary.length).toBeLessThanOrEqual(48);
    console.log(`Content validation statistics: majors=${data.majors.length}, dualLensCases=${data.dualLensCases.length}, capabilities=${data.capabilities.length}, projects=${data.projects.length}, scenarios=${data.scenarios.length}, faqs=${data.faqs.length}, mediaAssets=${data.mediaAssets.length}`);
  });
});
