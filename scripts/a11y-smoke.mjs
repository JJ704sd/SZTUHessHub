import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

async function check(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  assert.match(html, /class="skip-link"[^>]*href="#main-content"/i, `${path} has a skip link`);
  assert.match(html, /<main[^>]*id="main-content"/i, `${path} has a named main landmark`);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${path} has one h1`);

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    assert.match(image, /\balt="[^"]*"/i, `${path} image is missing alt text`);
  }
}

try {
  for (const path of ['/', '/projects', '/majors/compare', '/capabilities', '/scenarios']) await check(path);
  console.log(`Accessibility smoke passed (${baseUrl}); axe and manual keyboard review remain release checks.`);
} catch (error) {
  console.error('Accessibility smoke failed.');
  console.error(error);
  process.exitCode = 1;
}
