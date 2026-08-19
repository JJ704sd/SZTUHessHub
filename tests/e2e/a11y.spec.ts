import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const axePath = resolve(process.cwd(), 'node_modules/axe-core/axe.min.js');
const routes = ['/', '/projects?intent=sensor', '/projects/signal-feature-notebook', '/majors/compare', '/pathways'];

type AxeViolation = { id: string; impact: string | null; help: string; nodes: Array<{ target: string[] }> };

for (const route of routes) {
  test(`axe ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => {
      const axe = (window as typeof window & { axe: { run: (root: Document, options: object) => Promise<{ violations: AxeViolation[] }> } }).axe;
      return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations;
    });
    const detail = violations.map((violation) => `${violation.id}: ${violation.help}\n${violation.nodes.map((node) => node.target.join(' ')).join('\n')}`).join('\n\n');
    expect(violations, detail).toEqual([]);
  });
}
