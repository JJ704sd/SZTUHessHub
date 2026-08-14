const errors = [];
const environment = process.env.HSEEHUB_ENV ?? process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? 'development';
const publicEnvironment = process.env.NEXT_PUBLIC_HSEEHUB_ENV;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const releaseId = process.env.HSEEHUB_RELEASE_ID;

if (process.env.HSEEHUB_ENV && publicEnvironment && process.env.HSEEHUB_ENV !== publicEnvironment) errors.push('HSEEHUB_ENV 与 NEXT_PUBLIC_HSEEHUB_ENV 必须一致');
if (!['development', 'preview', 'production'].includes(environment)) errors.push(`环境无效：${environment}`);
let parsedUrl;
try { parsedUrl = siteUrl ? new URL(siteUrl) : null; } catch { errors.push('NEXT_PUBLIC_SITE_URL 不是绝对 URL'); }
if (parsedUrl && !['http:', 'https:'].includes(parsedUrl.protocol)) errors.push('NEXT_PUBLIC_SITE_URL 必须是 HTTP(S) origin');
if (environment === 'production') {
  const placeholderHost = parsedUrl && (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === '::1' || parsedUrl.hostname.endsWith('.example') || parsedUrl.hostname.endsWith('.invalid'));
  if (!parsedUrl || parsedUrl.protocol !== 'https:' || placeholderHost) errors.push('production 必须使用真实 HTTPS origin，禁止占位域名');
  if (!releaseId || releaseId === 'production-local') errors.push('production 必须提供不可变 HSEEHUB_RELEASE_ID');
}
if (environment === 'preview' && !parsedUrl) errors.push('preview 必须提供显式 preview origin');

if (errors.length > 0) {
  console.error('Environment contract failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Environment contract passed (${environment}; canonical=${environment === 'production' ? 'required' : 'omitted'}; robots=${environment === 'production' ? 'allow' : 'noindex'}; release=${releaseId ?? `${environment}-local`}).`);
