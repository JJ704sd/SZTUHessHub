import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { runColdLighthouseAudit } from '../scripts/lib/lighthouse-runner.mjs';

describe('cold Lighthouse profile lifecycle', () => {
  test('leaves no profile directory after a successful audit', async () => {
    const root = mkdtempSync(join(tmpdir(), 'hseehub-lighthouse-test-'));
    const customProfile = join(root, 'caller-owned');

    try {
      const result = await runColdLighthouseAudit({
        launchChrome: async (options) => {
          if (options.userDataDir) mkdirSync(customProfile);
          const launcherOwnedProfile = options.userDataDir ? undefined : mkdtempSync(join(root, 'launcher-owned-'));
          return {
            port: 9222,
            kill: () => {
              if (launcherOwnedProfile) rmSync(launcherOwnedProfile, { recursive: true, force: true });
            },
          };
        },
        audit: async () => 'report',
      });

      expect(result).toBe('report');
      expect(existsSync(customProfile)).toBe(false);
      expect(readdirSync(root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('closes Chrome gracefully before launcher cleanup', async () => {
    let browserClosed = false;

    await expect(runColdLighthouseAudit({
      launchChrome: async () => ({
        port: 9222,
        kill: () => {
          if (!browserClosed) {
            const error = new Error('profile is still locked') as NodeJS.ErrnoException;
            error.code = 'EPERM';
            throw error;
          }
        },
      }),
      audit: async () => 'report',
      closeChrome: async () => { browserClosed = true; },
      waitForChromeToExit: async () => undefined,
    })).resolves.toBe('report');
  });
});
