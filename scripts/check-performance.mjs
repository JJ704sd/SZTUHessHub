import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const distDir = process.env.NEXT_DIST_DIR || '.next';
const root = process.cwd();
const legacyManifestPath = resolve(root, distDir, 'app-build-manifest.json');
// Next 16.3.1 + React 19.2.8 has a ~173–177 KiB framework floor under both
// Turbopack and webpack. Keep a narrow route-specific regression allowance.
const budgets = { '/page': 180 * 1024, '/projects/page': 185 * 1024 };
const failures = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function next16RouteAssets(route) {
  const routePath = route.slice(1);
  const clientManifestPath = resolve(root, distDir, 'server', 'app', `${routePath}_client-reference-manifest.js`);
  const routeBuildManifestPath = resolve(root, distDir, 'server', 'app', routePath, 'build-manifest.json');
  const rootBuildManifestPath = resolve(root, distDir, 'build-manifest.json');
  const buildManifestPath = existsSync(routeBuildManifestPath) ? routeBuildManifestPath : rootBuildManifestPath;
  if (!existsSync(clientManifestPath) || !existsSync(buildManifestPath)) {
    failures.push(`找不到 Next 16 路由 manifest：${route}`);
    return [];
  }

  const source = readFileSync(clientManifestPath, 'utf8');
  const routeToken = `globalThis.__RSC_MANIFEST[${JSON.stringify(route)}]`;
  const start = source.indexOf(routeToken);
  if (start === -1) {
    failures.push(`Next 16 client manifest 缺少路由：${route}`);
    return [];
  }
  const equals = source.indexOf('=', start + routeToken.length);
  const serialized = source.slice(equals + 1).trim().replace(/;$/, '');
  const clientManifest = JSON.parse(serialized);
  const buildManifest = readJson(buildManifestPath);
  const entryFiles = clientManifest.entryJSFiles
    ? Object.values(clientManifest.entryJSFiles).flat()
    : Object.values(clientManifest.clientModules ?? {}).flatMap((module) => module.chunks ?? []).filter((chunk) => typeof chunk === 'string' && chunk.endsWith('.js'));
  return [
    ...(buildManifest.polyfillFiles ?? []),
    ...(buildManifest.rootMainFiles ?? []),
    ...entryFiles,
  ];
}

function routeAssets(route, legacyManifest) {
  return legacyManifest ? legacyManifest.pages?.[route] ?? [] : next16RouteAssets(route);
}

function measureRoute(route, files) {
  const uniqueFiles = [...new Set(files)];
  if (uniqueFiles.length === 0) failures.push(`${route} 没有可测量的客户端构建文件`);
  let bytes = 0;
  for (const file of uniqueFiles) {
    const normalized = file.replace(/^\/?_next\//, '');
    const path = resolve(root, distDir, normalized);
    if (!existsSync(path)) {
      failures.push(`${route} 构建文件不存在：${file}`);
      continue;
    }
    bytes += gzipSync(readFileSync(path)).byteLength;
  }
  if (bytes === 0) failures.push(`${route} 客户端 gzip 体积为 0`);
  return bytes;
}

const legacyManifest = existsSync(legacyManifestPath) ? readJson(legacyManifestPath) : null;
for (const [route, budget] of Object.entries(budgets)) {
  const bytes = measureRoute(route, routeAssets(route, legacyManifest));
  console.log(`${route}: ${(bytes / 1024).toFixed(1)} KiB gzip / ${(budget / 1024).toFixed(0)} KiB budget`);
  if (bytes > budget) failures.push(`${route} gzip 预算超出：${bytes} > ${budget}`);
}

if (failures.length) { console.error('Performance budget failed.'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Performance budget passed (${distDir}).`);
