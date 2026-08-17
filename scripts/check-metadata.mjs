const origin = (process.env.HSEEHUB_CHECK_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '');
const environment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
const failures = [];
const fetchText = async (path) => { const response = await fetch(`${origin}${path}`); return { response, text: await response.text() }; };
const home = await fetchText('/');
const robots = await fetchText('/robots.txt');
const sitemap = await fetchText('/sitemap.xml');
if (!home.response.ok) failures.push(`首页 HTTP ${home.response.status}`);
if (environment === 'production') {
  if (!home.text.includes(`<link rel="canonical" href="${expectedOrigin}`)) failures.push('production 首页缺少正式 canonical');
  if (!robots.text.includes('Allow: /') || robots.text.includes('Disallow: /')) failures.push('production robots 规则不正确');
  if (!sitemap.text.includes(expectedOrigin)) failures.push('production sitemap 未指向正式 origin');
} else {
  if (!/noindex/i.test(home.text)) failures.push('非 production HTML 缺少 noindex');
  if (!/Disallow:\s*\//i.test(robots.text)) failures.push('非 production robots 未禁止抓取');
  if (/<link rel="canonical"/i.test(home.text)) failures.push('非 production 不应输出 canonical');
  if (sitemap.text.includes('<url>')) failures.push('非 production sitemap 不应列出可索引 URL');
}
if (failures.length) { console.error('Metadata contract failed.'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Metadata contract passed (${environment}; fetch=${origin}).`);
