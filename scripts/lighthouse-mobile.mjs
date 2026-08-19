import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';

const preferredPort = Number(process.env.LIGHTHOUSE_PORT ?? 3000);
const routes = ['/', '/projects/signal-feature-notebook', '/pathways'];
const runsPerRoute = 3;
const lcpBudgetMs = 2_500;
const clsBudget = 0.1;

async function waitForServer(url, timeoutMs = 90_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await delay(500);
  }
  throw new Error(`Production server did not become ready at ${url}`);
}

async function isReady(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function main() {
  let server;
  let baseUrl = process.env.LIGHTHOUSE_BASE_URL;
  if (!baseUrl && !(await isReady(`http://127.0.0.1:${preferredPort}/`))) {
    const port = Number(process.env.LIGHTHOUSE_PORT ?? 3001);
    baseUrl = `http://127.0.0.1:${port}`;
    const nextCli = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
    server = spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
      cwd: process.cwd(),
      stdio: 'ignore',
      windowsHide: true,
    });
  }
  baseUrl ??= `http://127.0.0.1:${preferredPort}`;

  try {
    await waitForServer(`${baseUrl}/`);
    const results = [];
    for (const route of routes) {
        const scores = [];
        const lcpValues = [];
        const clsValues = [];
        for (let run = 1; run <= runsPerRoute; run += 1) {
          const profileDir = mkdtempSync(join(tmpdir(), 'hseehub-lighthouse-'));
          const chrome = await launchChrome({ userDataDir: profileDir, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking'] });
          let report;
          try {
            report = await lighthouse(`${baseUrl}${route}`, {
              port: chrome.port,
              logLevel: 'error',
              output: 'json',
              onlyCategories: ['performance'],
              formFactor: 'mobile',
              disableStorageReset: false,
              screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false },
            });
          } finally {
            try { chrome.kill(); } catch {}
            await delay(500);
            try { rmSync(profileDir, { recursive: true, force: true, maxRetries: 30, retryDelay: 250 }); } catch (error) { console.warn(`Lighthouse profile cleanup warning: ${error instanceof Error ? error.message : error}`); }
          }
          const score = Math.round((report.lhr.categories.performance.score ?? 0) * 100);
          const lcpMs = report.lhr.audits['largest-contentful-paint']?.numericValue ?? Number.POSITIVE_INFINITY;
          const cls = report.lhr.audits['cumulative-layout-shift']?.numericValue ?? Number.POSITIVE_INFINITY;
          scores.push(score);
          lcpValues.push(lcpMs);
          clsValues.push(cls);
          console.log(`${route} run ${run}/${runsPerRoute}: performance ${score}, LCP ${Math.round(lcpMs)}ms, CLS ${cls.toFixed(3)}`);
        }
        results.push({
          route,
          performance: scores,
          performanceMedian: median(scores),
          lcpMs: lcpValues.map((value) => Math.round(value)),
          lcpMedianMs: Math.round(median(lcpValues)),
          cls: clsValues.map((value) => Number(value.toFixed(3))),
          clsMedian: Number(median(clsValues).toFixed(3)),
        });
    }
    console.log(`Lighthouse mobile median (${runsPerRoute} cold runs per route)`);
    console.table(results);
    const failures = results.filter((result) => result.lcpMedianMs > lcpBudgetMs || result.clsMedian > clsBudget);
    if (failures.length > 0) throw new Error(`Lighthouse mobile budgets exceeded: ${failures.map((result) => `${result.route} (LCP ${result.lcpMedianMs}ms, CLS ${result.clsMedian})`).join(', ')}`);
  } finally {
    if (server) {
      try {
        server.kill();
      } catch {}
      try {
        if (process.platform === 'win32' && server.pid) {
          execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
        }
      } catch {}
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
