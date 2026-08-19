import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjectCatalog } from '@/lib/content';
import { parseLegacyProjectFilters, type ProjectSearchParams } from '@/lib/content/filters';
import { projectIntents, type ProjectIntent } from '@/lib/content/project-intents';
import { PageIntro, SectionHeading } from '@/components/site';
import { ProjectBrowser } from '@/components/project-browser';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '项目探索',
  description: '从学生现在想做的事出发，比较时间、基础、产出和真实资源状态。',
  alternates: siteConfig.isProduction ? { canonical: '/projects' } : undefined,
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ProjectsPage({ searchParams }: { searchParams?: ProjectSearchParams }) {
  const catalog = getProjectCatalog();
  const params = searchParams ?? {};
  const intentValue = firstValue(params.intent);
  const intent = projectIntents.includes(intentValue as ProjectIntent) ? intentValue as ProjectIntent : undefined;
  const legacyFilters = parseLegacyProjectFilters(params, catalog.filters);
  return <div className="page-container release-b-projects-page"><PageIntro eyebrow="小项目" title="你今天想先碰哪一种任务？" description="不用先理解五组筛选字段。选一句最像你现在想法的话，再比较时间、基础、会留下什么，以及现在能不能开始。"><Link className="button button-primary" href="#project-list">挑一个能开始的项目 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">依据与更新时间</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="按你的意图开始" title="三个项目都保留，只把更相关的放在前面" description="意图入口只负责排序和解释，不会把 10 分钟导览说成完整项目，也不会替你隐藏其他可能。" /><ProjectBrowser projects={catalog.items} filters={catalog.filters} legacyFilters={legacyFilters} searchParams={params} intent={intent} invalidIntent={Boolean(intentValue && !intent)} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>项目体验卡不使用真实患者数据、不提供诊断结论、不在 HseeHub 内执行不可信代码。外部资源若失效，页面仍保留解释、来源状态和替代下一步。</p></div></section>
  </div>;
}
