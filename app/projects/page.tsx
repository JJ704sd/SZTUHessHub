import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { PageIntro, SectionHeading } from '@/components/site';
import { ProjectBrowser } from '@/components/project-browser';
import { parseProjectFilters, type ProjectSearchParams } from '@/lib/project-filters';

export const metadata: Metadata = {
  title: '项目探索',
  description: '从数据与 AI、传感与仪器、材料与检测等视角，挑一个可以继续尝试的小项目。',
  alternates: siteConfig.isProduction ? { canonical: '/projects' } : undefined,
};

export default function ProjectsPage({ searchParams }: { searchParams?: ProjectSearchParams }) {
  const params = searchParams ?? {};
  const parsedFilters = parseProjectFilters(params, { projects: siteData.projects, majors: siteData.majors, capabilities: siteData.capabilities, scenarios: siteData.scenarios });
  return <div className="page-container"><PageIntro eyebrow="项目体验卡 · 不在站内运行代码" title="先判断“适不适合我”，再打开外部工具" description="每张卡先把问题、能力、场景、先修、工具/数据、预计时长、产物和安全边界说清楚。首版只提供公开或合成数据与本地运行指引。"><Link className="button button-primary" href="#project-list">浏览 {siteData.projects.length} 张首发卡 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">查看来源与许可</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="今天先试一个" title="三个项目默认全部展示" description="先按方向、时长、先修、产出和数据边界直接比较。旧链接中的筛选条件仍会被读取并明确显示，但新页面不再增加筛选控件。" /><ProjectBrowser projects={siteData.projects} majors={siteData.majors} capabilities={siteData.capabilities} scenarios={siteData.scenarios} parsedFilters={parsedFilters} searchParams={params} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>项目体验卡不使用真实患者数据、不提供诊断结论、不在 HseeHub 内执行不可信代码。外部资源若失效，页面仍保留解释、来源状态和替代下一步。</p></div></section>
  </div>;
}
