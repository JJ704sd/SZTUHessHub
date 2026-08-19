import { spawn } from 'node:child_process';
import net from 'node:net';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { runBrowserCheckLifecycle } from './lib/browser-check-lifecycle.mjs';

const port = Number(process.env.RELEASE_B_CHECK_PORT ?? 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const nextCli = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const playwrightCli = join(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');

function isPortOccupied() {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', (error) => resolve(error?.code === 'EADDRINUSE'));
    probe.listen({ host: '127.0.0.1', port }, () => probe.close(() => resolve(false)));
  });
}

async function waitForServer(child, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Release B browser server exited before readiness (code ${child.exitCode})`);
    try { if ((await fetch(baseUrl)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`Release B browser server did not become ready at ${baseUrl}`);
}

function runPlaywright(label, args) {
  return new Promise((resolve, reject) => {
    console.log(`Release B browser check: ${label}`);
    const child = spawn(process.execPath, [playwrightCli, 'test', ...args, '--reporter=list'], {
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_BASE_URL: baseUrl },
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${label} exited with code ${code}`)));
  });
}

function runNodeCheck(label, script) {
  return new Promise((resolve, reject) => {
    console.log(`Release C browser check: ${label}`);
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(), env: { ...process.env, HSEEHUB_CHECK_ORIGIN: baseUrl }, stdio: 'inherit', windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${label} exited with code ${code}`)));
  });
}

function stopProcessTree(pid) {
  if (!pid) return Promise.resolve();
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
      const timeout = setTimeout(() => { try { killer.kill(); } catch {} resolve(); }, 5_000);
      killer.once('exit', () => { clearTimeout(timeout); resolve(); });
      killer.once('error', () => { clearTimeout(timeout); resolve(); });
    });
  } else {
    try { process.kill(-pid, 'SIGTERM'); } catch {}
    return Promise.resolve();
  }
}

async function stopServer(server) {
  if (!server.pid) return;
  try { server.kill('SIGTERM'); } catch {}
  const gracefulDeadline = Date.now() + 3_000;
  while (Date.now() < gracefulDeadline) {
    if (!await isPortOccupied()) return;
    await delay(100);
  }
  await stopProcessTree(server.pid);
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (!await isPortOccupied()) return;
    await delay(100);
  }
  throw new Error(`Release B browser server did not release port ${port}`);
}

if (await isPortOccupied()) {
  throw new Error(`Release B check port ${port} is already in use; stop the stale test server before building or testing`);
}

const stages = [
  ['metadata', ['node', 'scripts/check-metadata.mjs']],
  ['runtime', ['node', 'scripts/check-runtime-acceptance.mjs']],
  ...['home.spec.ts', 'release-a-baseline.spec.ts', 'release-c.spec.ts'].map((file) => [`E2E:${file}`, [`tests/e2e/${file}`, '--project=desktop-light', '--project=mobile-light', '--project=narrow-light']]),
  ['accessibility', ['tests/e2e/a11y.spec.ts', '--project=desktop-light']],
  // Playwright 1.51 on Windows can retain workers after one 45-case screenshot
  // run. Split the same matrix into bounded page groups so every child exits.
  ...['home', 'majors', 'capabilities', 'projects', 'project-signal', 'starter', 'majors-compare', 'pathways']
    .map((pageId) => [`visual:${pageId}`, ['tests/e2e/visual.spec.ts', '--project=desktop-light', '--grep', `visual ${pageId} `]]),
  ['visual:states', ['tests/e2e/visual.spec.ts', '--project=desktop-light', '--grep', 'visual state|project state']],
];

await runBrowserCheckLifecycle({
  start: async () => spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
    cwd: process.cwd(), detached: true, stdio: 'ignore', windowsHide: true,
  }),
  waitUntilReady: waitForServer,
  stages,
  runStage: ([label, args]) => args[0] === 'node' ? runNodeCheck(label, args[1]) : runPlaywright(label, args),
  stop: stopServer,
});
