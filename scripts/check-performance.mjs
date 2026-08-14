import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = process.env.NEXT_DIST_DIR || '.next';
const manifestPath = resolve(root, distDir, 'app-build-manifest.json');
const failures = [];

if (!existsSync(manifestPath)) failures.push(`找不到构建 manifest：${manifestPath}`);
else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const budgets = { '/page': 110 * 1024, '/projects/page': 125 * 1024 };
  for (const [route, budget] of Object.entries(budgets)) {
    const files = manifest.pages?.[route] ?? [];
    const bytes = files.reduce((total, file) => {
      const path = resolve(root, distDir, file);
      return existsSync(path) ? total + gzipSync(readFileSync(path)).byteLength : total;
    }, 0);
    if (bytes > budget) failures.push(`${route} gzip 预算超出：${bytes} > ${budget}`);
    console.log(`${route}: ${(bytes / 1024).toFixed(1)} KiB gzip / ${(budget / 1024).toFixed(0)} KiB budget`);
  }
}

if (failures.length > 0) {
  console.error('Performance budget failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Performance budget passed (${distDir}).`);
