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
  assert.equal(count(home, /data-home-module=/g), 4, 'home has four convergence modules');

  const projects = await page('/projects');
  assert.equal(count(projects, /class="project-list-card/g), 3, 'project catalog shows all three cards by default');
  assert.doesNotMatch(projects, /<select\b/i, 'P0 project catalog has no filter controls');
  assert.match(projects, /class="status-badge/g);

  const filtered = await page(`/projects?duration=${encodeURIComponent('10 分钟')}`);
  assert.match(filtered, /符合已应用条件/);
  assert.match(filtered, /清除全部/);

  const empty = await page('/projects?major=missing-major');
  assert.equal(count(empty, /class="project-list-card/g), 3, 'invalid legacy condition keeps all project cards');
  assert.match(empty, /已忽略无效旧链接条件/);
  const mixed = await page('/projects?major=major-ime&duration=invalid-duration');
  assert.match(mixed, /已应用的条件/);
  assert.match(mixed, /已忽略无效旧链接条件/);
  const zero = await page('/projects?major=major-bme&duration=10%20%E5%88%86%E9%92%9F');
  assert.match(zero, /当前条件没有匹配的体验卡/);

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
