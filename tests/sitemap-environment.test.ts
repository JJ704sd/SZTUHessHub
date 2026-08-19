import { afterEach, describe, expect, test, vi } from 'vitest';

const originalEnvironment = { ...process.env };

async function loadSitemap(environment: 'development' | 'preview' | 'production') {
  vi.resetModules();
  process.env.HSEEHUB_ENV = environment;
  process.env.NEXT_PUBLIC_HSEEHUB_ENV = environment;
  process.env.NEXT_PUBLIC_SITE_URL = environment === 'production' ? 'https://hseehub.test' : 'http://localhost:3000';
  process.env.HSEEHUB_RELEASE_ID = environment === 'production' ? 'release-c-test' : '';
  const { default: sitemap } = await import('../app/sitemap');
  return sitemap();
}

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.resetModules();
});

describe('sitemap deployment contract', () => {
  test.each(['development', 'preview'] as const)('%s publishes no routes', async (environment) => {
    expect(await loadSitemap(environment)).toEqual([]);
  });

  test('production publishes public routes from the canonical HTTPS origin', async () => {
    const urls = (await loadSitemap('production')).map((entry) => entry.url);

    expect(urls).toContain('https://hseehub.test/pathways/explore');
    expect(urls).toContain('https://hseehub.test/projects/signal-feature-notebook/starter');
    expect(urls.every((url) => url.startsWith('https://hseehub.test/'))).toBe(true);
  });
});
