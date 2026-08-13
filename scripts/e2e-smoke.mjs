import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

async function page(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return html;
}

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

try {
  const home = await page('/');
  assert.equal(count(home, /class="task-card/g), 3, 'home exposes three task entry cards');
  assert.match(home, /href="\/majors\/compare"/);
  assert.match(home, /href="\/capabilities"/);
  assert.match(home, /href="\/projects"/);
  assert.equal(count(home, /class="home-section(?:\s|\")/g), 4, 'home has four follow-up modules after the task launcher');

  const projects = await page('/projects');
  assert.equal(count(projects, /class="project-list-card/g), 3, 'project catalog shows all three cards by default');
  assert.match(projects, /class="advanced-filters"/);
  assert.match(projects, /class="status-badge/g);

  const durationSelect = projects.match(/<select[^>]*id="filter-duration"[\s\S]*?<\/select>/i)?.[0] ?? '';
  const duration = durationSelect.match(/<option value="(?!all)([^"]+)"/i)?.[1];
  assert.ok(duration, 'project catalog exposes a duration option');
  const filtered = await page(`/projects?duration=${encodeURIComponent(duration)}`);
  assert.match(filtered, /class="project-list-card/g, 'a quick filter keeps a result card visible');

  const empty = await page('/projects?major=missing-major');
  assert.equal(count(empty, /class="project-list-card/g), 3, 'static project scheme keeps content readable before hydration');

  for (const path of ['/majors/compare', '/capabilities/signals-images-and-data-ai', '/projects/signal-feature-notebook']) {
    const html = await page(path);
    assert.match(html, /id="main-content"|<main/);
  }

  const comparison = await page('/majors/compare');
  assert.match(comparison, /href="\/majors\/intelligent-medical-engineering"/, 'comparison exposes the intelligent medical engineering relation');
  assert.match(comparison, /href="\/majors\/biomedical-engineering"/, 'comparison exposes the biomedical engineering relation');

  console.log(`E2E smoke passed (${baseUrl}).`);
} catch (error) {
  console.error('E2E smoke failed. Start the production server or set BASE_URL.');
  console.error(error);
  process.exitCode = 1;
}
