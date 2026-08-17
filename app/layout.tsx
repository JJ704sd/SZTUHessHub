import type { Metadata } from 'next';
import { GlobalHeader } from '@/components/global-header';
import { SiteFooter } from '@/components/site';
import { SkipLink } from '@/components/shell/skip-link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: siteData.siteMeta.title, template: '%s｜HseeHub' },
  description: siteData.siteMeta.description,
  alternates: siteConfig.isProduction ? { canonical: '/' } : undefined,
  robots: siteConfig.isProduction ? undefined : { index: false, follow: false },
  openGraph: { title: 'HseeHub｜健康工程双专业与跨行业能力探索站', description: '先看懂两个专业，再找到一个可以继续尝试的小项目。', type: 'website' },
};

const themeScript = `(() => { try { const saved = localStorage.getItem('hseehub-theme'); const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch (error) {} })()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><SkipLink /><GlobalHeader /><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter capabilityCount={siteData.capabilities.length} /></body>
    </html>
  );
}
