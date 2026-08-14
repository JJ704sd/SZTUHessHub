import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
const distDir = process.env.NEXT_DIST_DIR || '.next';
const root = process.cwd();
const manifestPath = resolve(root, distDir, 'app-build-manifest.json');
const failures = [];
if (!existsSync(manifestPath)) failures.push(`找不到构建 manifest：${manifestPath}`);
else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const [route, budget] of Object.entries({ '/page': 110 * 1024, '/projects/page': 125 * 1024 })) {
    const bytes = (manifest.pages?.[route] ?? []).reduce((total, file) => { const path = resolve(root, distDir, file); return existsSync(path) ? total + gzipSync(readFileSync(path)).byteLength : total; }, 0);
    console.log(`${route}: ${(bytes / 1024).toFixed(1)} KiB gzip / ${(budget / 1024).toFixed(0)} KiB budget`);
    if (bytes > budget) failures.push(`${route} gzip 预算超出：${bytes} > ${budget}`);
  }
}
if (failures.length) { console.error('Performance budget failed.'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Performance budget passed (${distDir}).`);
