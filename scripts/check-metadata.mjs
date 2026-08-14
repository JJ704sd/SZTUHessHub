const environment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const checkOrigin = process.env.HSEEHUB_CHECK_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? checkOrigin;
const failures = [];

function fail(message) { failures.push(message); }
const homeResponse = await fetch(`${checkOrigin}/`);
const homeHtml = await homeResponse.text();
const robotsResponse = await fetch(`${checkOrigin}/robots.txt`);
const robots = await robotsResponse.text();
const sitemapResponse = await fetch(`${checkOrigin}/sitemap.xml`);
const sitemap = await sitemapResponse.text();

if (!homeResponse.ok) fail(`首页 HTTP ${homeResponse.status}`);
if (environment === 'production') {
  if (!homeHtml.includes(`<link rel="canonical" href="${expectedOrigin}`)) fail('production 首页缺少正式 canonical');
  if (homeHtml.includes('hseehub.example')) fail('production HTML 包含占位域名');
  if (!robots.includes('Allow: /') || robots.includes('Disallow: /')) fail('production robots 规则不正确');
  if (!sitemap.includes(expectedOrigin)) fail('production sitemap 未指向正式 origin');
} else {
  if (!/noindex/i.test(homeHtml)) fail(`${environment} HTML 缺少 noindex`);
  if (!/Disallow:\s*\//i.test(robots)) fail(`${environment} robots 未禁止抓取`);
  if (/<link rel="canonical"/i.test(homeHtml)) fail(`${environment} 不应输出 canonical`);
}

if (failures.length > 0) {
  console.error('Metadata contract failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Metadata contract passed (${environment}; fetch=${checkOrigin}; expected=${expectedOrigin}).`);
