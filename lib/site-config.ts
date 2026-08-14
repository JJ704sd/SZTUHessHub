export type DeploymentEnvironment = 'development' | 'preview' | 'production';

function readEnvironment(): DeploymentEnvironment {
  const serverValue = process.env.HSEEHUB_ENV;
  const publicValue = process.env.NEXT_PUBLIC_HSEEHUB_ENV;
  if (serverValue && publicValue && serverValue !== publicValue) {
    throw new Error('HSEEHUB_ENV and NEXT_PUBLIC_HSEEHUB_ENV must match.');
  }

  const value = serverValue ?? publicValue ?? 'development';
  if (value === 'development' || value === 'preview' || value === 'production') return value;
  throw new Error(`Unsupported HSEEHUB_ENV: ${value}`);
}

function parseAbsoluteUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

const environment = readEnvironment();
const configuredUrl = parseAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const isPlaceholderHost = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.example') || hostname.endsWith('.invalid');
const isPlaceholderUrl = configuredUrl ? isPlaceholderHost(configuredUrl.hostname) : false;

if (environment === 'production' && (!configuredUrl || configuredUrl.protocol !== 'https:' || isPlaceholderUrl)) {
  throw new Error('Production requires NEXT_PUBLIC_SITE_URL to be a real HTTPS origin.');
}
if (environment === 'production' && !process.env.HSEEHUB_RELEASE_ID) {
  throw new Error('Production requires an immutable HSEEHUB_RELEASE_ID.');
}

export const siteConfig = {
  environment,
  isProduction: environment === 'production',
  siteUrl: (configuredUrl && !isPlaceholderUrl ? configuredUrl.origin : null) ?? 'http://localhost:3000',
  siteUrlConfigured: Boolean(configuredUrl && !isPlaceholderUrl),
  releaseId: process.env.HSEEHUB_RELEASE_ID ?? `${environment}-local`,
  currentCohort: '2025',
  contentBaseline: '2026-08-13',
  projectDataLabels: {
    kind: { none: '无外部数据', synthetic: '合成数据', real: '真实世界数据' },
    access: { none: '无访问要求', open: '公开可用', restricted: '受控访问', credentialed: '需要账号或凭据' },
    sensitivity: { none: '无敏感信息', personal: '个人信息', health: '健康信息', commercial: '商业敏感信息', 'security-relevant': '安全相关信息' },
  },
  navItems: [
    { href: '/majors', label: '专业对比' },
    { href: '/capabilities', label: '能力地图' },
    { href: '/projects', label: '项目实践' },
    { href: '/scenarios', label: '去向场景' },
  ],
} as const;
