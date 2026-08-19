import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { PageIntro, SectionHeading } from '@/components/site';
import { ProjectBrowser } from '@/components/project-browser';
import { projectIntents, type ProjectIntent } from '@/lib/content/project-intents';

export const metadata: Metadata = {
  title: '项目探索',
  description: '从数据与 AI、传感与仪器、材料与检测等视角，挑一个可以继续尝试的小项目。',
  alternates: { canonical: '/projects' },
};

function valueOf(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

type SearchParams = { intent?: string | string[]; major?: string | string[]; capability?: string | string[]; scenario?: string | string[]; viewpoint?: string | string[]; duration?: string | string[] };

export default function ProjectsPage({ searchParams }: { searchParams?: SearchParams }) {
  const intentValue = valueOf(searchParams?.intent);
  const initialIntent = projectIntents.includes(intentValue as ProjectIntent) ? intentValue as ProjectIntent : undefined;
  const invalidIntent = Boolean(intentValue && !initialIntent);
  const legacyFilters = { major: valueOf(searchParams?.major), capability: valueOf(searchParams?.capability), scenario: valueOf(searchParams?.scenario), viewpoint: valueOf(searchParams?.viewpoint), duration: valueOf(searchParams?.duration) };
  const hasLegacy = Object.values(legacyFilters).some(Boolean);
  const knownValues = { major: new Set(siteData.majors.map((item) => item.id)), capability: new Set(siteData.capabilities.map((item) => item.id)), scenario: new Set(siteData.scenarios.map((item) => item.id)), viewpoint: new Set(siteData.projects.map((item) => item.viewpoint)), duration: new Set(siteData.projects.flatMap((item) => item.durationBands)) };
  const invalidLegacy = Object.entries(legacyFilters).some(([key, value]) => value && !knownValues[key as keyof typeof knownValues].has(value));
  const legacyNotice = invalidIntent || invalidLegacy ? 'invalid' : hasLegacy ? 'active' : undefined;
  const resourceStates = Object.fromEntries(siteData.projects.map((project) => [project.id, getProjectResourceState(project)]));
  return <div className="page-container release-b-projects-page"><PageIntro eyebrow="小项目" title="你今天想先碰哪一种任务？" description="不用先理解五组筛选字段。选一句最像你现在想法的话，再比较时间、基础、会留下什么，以及现在能不能开始。"><Link className="button button-primary" href="#project-list">挑一个能开始的项目 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">依据与更新时间</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="按你的意图开始" title="三个项目都保留，只把更相关的放在前面" description="意图入口只负责排序和解释，不会把 10 分钟导览说成完整项目，也不会替你隐藏其他可能。" /><ProjectBrowser projects={siteData.projects} resourceStates={resourceStates} initialIntent={initialIntent} legacyFilters={legacyFilters} legacyNotice={legacyNotice} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>项目体验卡不使用真实患者数据、不提供诊断结论、不在 HseeHub 内执行不可信代码。外部资源若失效，页面仍保留解释、来源状态和替代下一步。</p></div></section>
  </div>;
}
