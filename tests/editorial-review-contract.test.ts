import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const projectRoot = resolve(import.meta.dirname, '..');
const roots: string[] = [];

function runContract(reviewDueAt: string | undefined) {
  const root = mkdtempSync(join(tmpdir(), 'hseehub-editorial-review-'));
  roots.push(root);
  for (const file of ['scripts/validate-phase-1-1-content.mjs', 'content/site-data.json', 'content/claims.json', 'content/resources/signal-feature-notebook.json', 'content/pathways.json']) {
    const target = join(root, file);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(projectRoot, file), target);
  }
  const sitePath = join(root, 'content/site-data.json');
  const data = JSON.parse(readFileSync(sitePath, 'utf8'));
  const item = data.dualLensCases.find((entry: { id: string }) => entry.id === data.siteMeta.home.featuredDualLensCaseId);
  item.reviewDueAt = reviewDueAt;
  writeFileSync(sitePath, JSON.stringify(data));
  return spawnSync(process.execPath, [join(root, 'scripts/validate-phase-1-1-content.mjs')], { encoding: 'utf8' });
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('editorial review content contract', () => {
  it('allows expired editorial content with a visible review warning', () => {
    const result = runContract('2000-01-01');
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain('首页 discovery item 待复核：case-wearable-vital-signs');
    expect(result.stdout).toContain('editorial review warnings');
    expect(result.stdout).not.toContain('contract passed');
  });

  it.each(['not-a-date', '2026-02-30', undefined])('rejects invalid or missing review dates: %s', (date) => {
    const result = runContract(date);
    expect(result.status, result.stdout).toBe(1);
    expect(result.stderr).toContain('case-wearable-vital-signs reviewDueAt 必须是日期');
    expect(result.stdout).not.toContain('contract passed');
  });
});
