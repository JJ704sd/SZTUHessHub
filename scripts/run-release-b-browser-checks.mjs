import { execFileSync, spawn } from 'node:child_process';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.RELEASE_B_CHECK_PORT ?? 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const nextCli = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const playwrightCli = join(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if ((await fetch(baseUrl)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`Release B browser server did not become ready at ${baseUrl}`);
}

function runPlaywright(label, args) {
  return new Promise((resolve, reject) => {
    console.log(`Release B browser check: ${label}`);
    const child = spawn(process.execPath, [playwrightCli, 'test', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_BASE_URL: baseUrl },
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${label} exited with code ${code}`)));
  });
}

function stopServer(pid) {
  if (process.platform === 'win32') {
    const listeners = execFileSync('netstat', ['-ano'], { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter((line) => line.includes(`:${port}`) && line.includes('LISTENING'))
      .map((line) => Number(line.trim().split(/\s+/).at(-1)))
      .filter((listenerPid, index, items) => Number.isInteger(listenerPid) && items.indexOf(listenerPid) === index);
    for (const listenerPid of listeners) {
      try { process.kill(listenerPid); } catch {}
    }
    if (pid) try { process.kill(pid); } catch {}
  } else {
    if (pid) try { process.kill(-pid, 'SIGTERM'); } catch {}
  }
}

if (process.platform === 'win32' && execFileSync('netstat', ['-ano'], { encoding: 'utf8' }).split(/\r?\n/).some((line) => line.includes(`:${port}`) && line.includes('LISTENING'))) {
  throw new Error(`Release B check port ${port} is already in use; stop the stale test server before building or testing`);
}

const server = spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
  cwd: process.cwd(),
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});
server.unref();

try {
  await waitForServer();
  await runPlaywright('E2E', ['tests/e2e/home.spec.ts', 'tests/e2e/release-a-baseline.spec.ts', '--project=desktop-light', '--project=mobile-light', '--project=narrow-light']);
  await runPlaywright('accessibility', ['tests/e2e/a11y.spec.ts', '--project=desktop-light']);
  // visual.spec.ts owns the viewport/theme matrix; run it once with the
  // desktop-light project so Playwright does not multiply that matrix by all
  // configured projects and create duplicate environment-suffixed snapshots.
  await runPlaywright('visual', ['tests/e2e/visual.spec.ts', '--project=desktop-light']);
} finally {
  stopServer(server.pid);
}
