import type { Metadata } from 'next';
import { GlobalHeader } from '@/components/global-header';
import { SiteFooter } from '@/components/site';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: siteData.siteMeta.title, template: '%s｜HseeHub' },
  description: siteData.siteMeta.description,
  alternates: { canonical: '/' },
  openGraph: { title: 'HseeHub｜健康工程学生探索桌面', description: '先看懂两个专业，试一个小项目，留下可复核的东西，再决定下一步。', type: 'website' },
};

const themeScript = `(() => { try { const saved = localStorage.getItem('hseehub-theme'); const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch (error) {} })()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><GlobalHeader /><a className="skip-link" href="#main-content">跳到主要内容</a><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter /></body>
    </html>
  );
}
