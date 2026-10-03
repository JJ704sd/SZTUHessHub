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

type ProjectsPageProps = { searchParams?: Promise<ProjectSearchParams> };

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const catalog = getProjectCatalog();
  const params = await searchParams ?? {};
  const intentValue = firstValue(params.intent);
  const intent = projectIntents.includes(intentValue as ProjectIntent) ? intentValue as ProjectIntent : undefined;
  const legacyFilters = parseLegacyProjectFilters(params, catalog.filters);
  return <div className="page-container release-b-projects-page"><PageIntro eyebrow="PROJECT LAB / 从一个小问题开始" title="你今天想先碰哪一种任务？" description="一段信号、一组数据、一个传感器。挑个让你好奇的方向，看看要花多久、需要什么基础，以及能做出什么。"><Link className="button button-primary" href="#project-list">挑一个能开始的项目 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">查看来源与更新</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="PICK YOUR START / 跟着好奇心走" title="先找一个，你想亲手试试的问题" description="选一个想法，相关项目会排到前面。10 分钟可以先读导览，完整实践的时长、所需基础和资源状态都在卡片里。" /><ProjectBrowser projects={catalog.items} filters={catalog.filters} legacyFilters={legacyFilters} searchParams={params} intent={intent} invalidIntent={Boolean(intentValue && !intent)} /></section>
    <section className="detail-block"><div className="callout"><p><strong>动手之前：</strong>项目不使用真实患者数据、不提供诊断，站内不执行不可信代码。外部资源的可用状态与替代入口，请查看项目说明。</p></div></section>
  </div>;
}
