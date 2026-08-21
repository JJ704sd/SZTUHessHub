import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, test } from 'vitest';

const roots: string[] = [];
const projectRoot = resolve(import.meta.dirname, '..');
const scriptPath = resolve(projectRoot, 'scripts/check-performance.mjs');

function writeFile(path: string, contents: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function writeRoute(distDir: string, route: '/page' | '/projects/page', routeChunk: string) {
  const routePath = route.slice(1);
  const runtimeChunk = 'static/chunks/runtime.js';
  const manifest = {
    entryJSFiles: {
      '[project]/app/layout': [runtimeChunk],
      [`[project]/app/${routePath}`]: [runtimeChunk, routeChunk],
    },
  };
  writeFile(
    join(distDir, 'server/app', `${routePath}_client-reference-manifest.js`),
    `globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};\nglobalThis.__RSC_MANIFEST[${JSON.stringify(route)}] = ${JSON.stringify(manifest)};\n`,
  );
  writeFile(
    join(distDir, 'server/app', routePath, 'build-manifest.json'),
    `${JSON.stringify({ polyfillFiles: [], rootMainFiles: [runtimeChunk] })}\n`,
  );
  writeFile(join(distDir, routeChunk), `console.log(${JSON.stringify(route)});\n`);
}

function writeWebpackRoute(distDir: string, route: '/page' | '/projects/page', routeChunk: string) {
  const routePath = route.slice(1);
  const manifest = {
    clientModules: {
      [`[project]/app/${routePath}`]: { chunks: ['100', routeChunk] },
    },
  };
  writeFile(
    join(distDir, 'server/app', `${routePath}_client-reference-manifest.js`),
    `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});globalThis.__RSC_MANIFEST[${JSON.stringify(route)}]=${JSON.stringify(manifest)};\n`,
  );
  writeFile(join(distDir, routeChunk), `console.log(${JSON.stringify(route)});\n`);
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('performance budget CLI', () => {
  test('measures non-zero Next 16 route assets', () => {
    const distDir = mkdtempSync(join(tmpdir(), 'hseehub-performance-'));
    roots.push(distDir);
    writeFile(join(distDir, 'static/chunks/runtime.js'), 'globalThis.__runtime = true;\n');
    writeRoute(distDir, '/page', 'static/chunks/home.js');
    writeRoute(distDir, '/projects/page', 'static/chunks/projects.js');

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: projectRoot,
      env: { ...process.env, NEXT_DIST_DIR: distDir },
      encoding: 'utf8',
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('/page:');
    expect(result.stdout).toContain('/projects/page:');
  });

  test('measures non-zero Next 16 webpack route assets', () => {
    const distDir = mkdtempSync(join(tmpdir(), 'hseehub-performance-'));
    roots.push(distDir);
    const runtimeChunk = 'static/chunks/runtime.js';
    writeFile(join(distDir, 'build-manifest.json'), `${JSON.stringify({ polyfillFiles: [], rootMainFiles: [runtimeChunk] })}\n`);
    writeFile(join(distDir, runtimeChunk), 'globalThis.__runtime = true;\n');
    writeWebpackRoute(distDir, '/page', 'static/chunks/home.js');
    writeWebpackRoute(distDir, '/projects/page', 'static/chunks/projects.js');

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: projectRoot,
      env: { ...process.env, NEXT_DIST_DIR: distDir },
      encoding: 'utf8',
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('/page:');
    expect(result.stdout).toContain('/projects/page:');
  });
});
