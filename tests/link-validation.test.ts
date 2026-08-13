import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSiteData } from '@/lib/content/schema';

const data = parseSiteData(JSON.parse(readFileSync(resolve(process.cwd(), 'content/site-data.json'), 'utf8')));

function isHttps(value: string) {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

describe('link protocol gate', () => {
  it('requires every registered external resource and replacement to use HTTPS', () => {
    for (const source of data.sources) expect(isHttps(source.url), source.url).toBe(true);
    for (const project of data.projects) {
      expect(isHttps(project.sourceUrl), project.sourceUrl).toBe(true);
      for (const tool of project.tools) expect(isHttps(tool.officialUrl), tool.officialUrl).toBe(true);
      if (project.resourceHealth.replacementUrl) expect(isHttps(project.resourceHealth.replacementUrl), project.resourceHealth.replacementUrl).toBe(true);
    }
  });
});
