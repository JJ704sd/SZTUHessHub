import { describe, expect, test, vi } from 'vitest';
import { runBrowserCheckLifecycle } from '../scripts/lib/browser-check-lifecycle.mjs';

describe('browser check server lifecycle', () => {
  test('stops the server after every browser stage succeeds', async () => {
    const stop = vi.fn(async (_server: { pid: number }) => undefined);
    const runStage = vi.fn(async (_stage: string) => undefined);

    await runBrowserCheckLifecycle({
      start: async () => ({ pid: 1234 }),
      waitUntilReady: async () => undefined,
      stages: ['e2e', 'axe', 'visual'],
      runStage,
      stop,
    });

    expect(runStage.mock.calls.map((call) => call[0])).toEqual(['e2e', 'axe', 'visual']);
    expect(stop).toHaveBeenCalledExactlyOnceWith({ pid: 1234 });
  });

  test('stops the server when a browser stage fails and preserves the failure', async () => {
    const failure = new Error('axe failed');
    const stop = vi.fn(async (_server: { pid: number }) => undefined);

    await expect(runBrowserCheckLifecycle({
      start: async () => ({ pid: 5678 }),
      waitUntilReady: async () => undefined,
      stages: ['e2e', 'axe', 'visual'],
      runStage: async (stage: string) => { if (stage === 'axe') throw failure; },
      stop,
    })).rejects.toBe(failure);

    expect(stop).toHaveBeenCalledExactlyOnceWith({ pid: 5678 });
  });
});
