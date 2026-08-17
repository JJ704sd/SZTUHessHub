const environment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const publicEnvironment = process.env.NEXT_PUBLIC_HSEEHUB_ENV;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const errors = [];
if (process.env.HSEEHUB_ENV && publicEnvironment && process.env.HSEEHUB_ENV !== publicEnvironment) errors.push('HSEEHUB_ENV 与 NEXT_PUBLIC_HSEEHUB_ENV 必须一致');
if (!['development', 'preview', 'production'].includes(environment)) errors.push(`环境无效：${environment}`);
let url = null;
try { url = siteUrl ? new URL(siteUrl) : null; } catch { errors.push('NEXT_PUBLIC_SITE_URL 不是绝对 URL'); }
if (url && !['http:', 'https:'].includes(url.protocol)) errors.push('NEXT_PUBLIC_SITE_URL 必须是 HTTP(S) origin');
if (environment === 'preview' && !url) errors.push('preview 必须提供显式 origin');
if (environment === 'production') {
  const placeholder = url && ['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url?.hostname.endsWith('.example') || url?.hostname.endsWith('.invalid');
  if (!url || url.protocol !== 'https:' || placeholder) errors.push('production 必须使用真实 HTTPS origin');
  if (!process.env.HSEEHUB_RELEASE_ID) errors.push('production 必须提供不可变 HSEEHUB_RELEASE_ID');
}
if (errors.length) { console.error('Environment contract failed.'); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
console.log(`Environment contract passed (${environment}; canonical=${environment === 'production' ? 'required' : 'omitted'}).`);
