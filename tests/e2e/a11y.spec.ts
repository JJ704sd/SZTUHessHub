import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/projects?intent=sensor', '/projects/signal-feature-notebook', '/projects/signal-feature-notebook/starter', '/majors/compare', '/pathways', '/pathways/employment', '/capabilities/signals-images-and-data-ai', '/capabilities/health-and-user-understanding', '/scenarios/software-systems'];

for (const route of routes) {
  test(`axe ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const detail = results.violations
      .map((violation) => `${violation.id}: ${violation.help}\n${violation.nodes.map((node) => node.target.join(' ')).join('\n')}`)
      .join('\n\n');
    expect(results.violations, detail).toEqual([]);
  });
}

test('axe career guide with preparation and original pathway details expanded', async ({ page }) => {
  await page.goto('/pathways/employment');
  await page.evaluate(() => document.querySelectorAll('details').forEach((detail) => { detail.open = true; }));
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
