import type { MetadataRoute } from 'next';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.isProduction) return [];
  const base = siteConfig.siteUrl;
  const staticRoutes = ['/', '/majors', '/majors/faq', '/capabilities', '/projects', '/scenarios', '/sources', '/about'];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: new Date(siteConfig.contentBaseline), changeFrequency: 'monthly' as const, priority: path === '/' ? .9 : .7 })),
    ...siteData.majors.flatMap((major) => [{ url: `${base}/majors/${major.slug}`, lastModified: new Date(major.lastVerified), changeFrequency: 'monthly' as const, priority: .7 }, { url: `${base}/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`, lastModified: new Date(major.lastVerified), changeFrequency: 'monthly' as const, priority: .6 }]),
    ...siteData.capabilities.map((item) => ({ url: `${base}/capabilities/${item.slug}`, lastModified: new Date(item.lastVerified), changeFrequency: 'monthly' as const, priority: .6 })),
    ...siteData.projects.flatMap((item) => [{ url: `${base}/projects/${item.slug}`, lastModified: new Date(item.lastVerified), changeFrequency: 'monthly' as const, priority: .7 }, { url: `${base}/projects/${item.slug}/resources`, lastModified: new Date(item.lastVerified), changeFrequency: 'monthly' as const, priority: .5 }]),
    ...siteData.scenarios.map((item) => ({ url: `${base}/scenarios/${item.slug}`, lastModified: new Date(item.lastVerified), changeFrequency: 'monthly' as const, priority: .6 })),
  ];
}
