import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';
import { runColdLighthouseAudit } from './lib/lighthouse-runner.mjs';

const preferredPort = Number(process.env.LIGHTHOUSE_PORT ?? 3000);
const routes = ['/', '/projects/signal-feature-notebook', '/pathways'];
const runsPerRoute = 3;
const deploymentEnvironment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const seoRequired = process.env.LIGHTHOUSE_REQUIRE_SEO
  ? process.env.LIGHTHOUSE_REQUIRE_SEO === 'true'
  : deploymentEnvironment === 'production';
const budgets = { performance: 90, accessibility: 95, seo: 95, seoRequired, lcpMs: 2_500, cls: 0.1 };
const artifactPath = resolve('artifacts/perf-ci.json');

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

function categoryScore(report, category) {
  return Math.round((report.lhr.categories[category]?.score ?? 0) * 100);
}

function summarizeRoute(route, samples) {
  return {
    route,
    samples,
    medians: {
      performance: median(samples.map((sample) => sample.performance)),
      accessibility: median(samples.map((sample) => sample.accessibility)),
      seo: median(samples.map((sample) => sample.seo)),
      lcpMs: Math.round(median(samples.map((sample) => sample.lcpMs))),
      cls: Number(median(samples.map((sample) => sample.cls)).toFixed(3)),
    },
  };
}

function routeFailure(result) {
  const { medians } = result;
  const failed = medians.performance < budgets.performance
    || medians.accessibility < budgets.accessibility
    || (budgets.seoRequired && medians.seo < budgets.seo)
    || medians.lcpMs > budgets.lcpMs
    || medians.cls > budgets.cls;
  return failed
    ? `${result.route} (Performance ${medians.performance}, Accessibility ${medians.accessibility}, SEO ${medians.seo}, LCP ${medians.lcpMs}ms, CLS ${medians.cls})`
    : null;
}

function writeArtifact(baseUrl, results, failures) {
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify({
    schemaVersion: 1,
    baseUrl,
    deploymentEnvironment,
    routes,
    runsPerRoute,
    budgets,
    results,
    failures,
    checkedAt: new Date().toISOString(),
  }, null, 2)}\n`);
}

async function main() {
  let server;
  let baseUrl = process.env.LIGHTHOUSE_BASE_URL;
  const results = [];
  const failures = [];

  try {
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
    await waitForServer(`${baseUrl}/`);
    for (const route of routes) {
      const samples = [];
      for (let run = 1; run <= runsPerRoute; run += 1) {
        const report = await runColdLighthouseAudit({
          launchChrome,
          audit: (port) => lighthouse(`${baseUrl}${route}`, {
            port,
            logLevel: 'error',
            output: 'json',
            onlyCategories: ['performance', 'accessibility', 'seo'],
            formFactor: 'mobile',
            disableStorageReset: false,
            screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false },
          }),
        });
        const sample = {
          run,
          performance: categoryScore(report, 'performance'),
          accessibility: categoryScore(report, 'accessibility'),
          seo: categoryScore(report, 'seo'),
          lcpMs: Math.round(report.lhr.audits['largest-contentful-paint']?.numericValue ?? Number.POSITIVE_INFINITY),
          cls: Number((report.lhr.audits['cumulative-layout-shift']?.numericValue ?? Number.POSITIVE_INFINITY).toFixed(3)),
        };
        samples.push(sample);
        console.log(`${route} run ${run}/${runsPerRoute}: Performance ${sample.performance}, Accessibility ${sample.accessibility}, SEO ${sample.seo}, LCP ${sample.lcpMs}ms, CLS ${sample.cls.toFixed(3)}`);
      }
      results.push(summarizeRoute(route, samples));
    }
    console.log(`Lighthouse mobile median (${runsPerRoute} cold runs per route)`);
    console.table(results.map((result) => ({ route: result.route, ...result.medians })));
    if (!budgets.seoRequired) console.log(`SEO scores are recorded but not enforced for ${deploymentEnvironment}, whose noindex contract is checked separately.`);
    failures.push(...results.map(routeFailure).filter(Boolean));
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
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
    writeArtifact(baseUrl ?? `http://127.0.0.1:${preferredPort}`, results, failures);
  }

  if (failures.length > 0) {
    throw new Error(`Lighthouse mobile budgets failed or were blocked: ${failures.join('; ')}`);
  }
  console.log(`Lighthouse performance gate passed; report: ${artifactPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
