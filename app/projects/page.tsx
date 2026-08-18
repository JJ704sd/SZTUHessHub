import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { PageIntro, SectionHeading } from '@/components/site';
import { ProjectBrowser } from '@/components/project-browser';

export const metadata: Metadata = {
  title: '项目探索',
  description: '从数据与 AI、传感与仪器、材料与检测等视角，挑一个可以继续尝试的小项目。',
  alternates: { canonical: '/projects' },
};

function valueOf(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default function ProjectsPage({ searchParams }: { searchParams?: { major?: string | string[]; capability?: string | string[]; scenario?: string | string[]; viewpoint?: string | string[]; duration?: string | string[] } }) {
  const initialFilters = { major: valueOf(searchParams?.major), capability: valueOf(searchParams?.capability), scenario: valueOf(searchParams?.scenario), viewpoint: valueOf(searchParams?.viewpoint), duration: valueOf(searchParams?.duration) };
  const resourceStates = Object.fromEntries(siteData.projects.map((project) => [project.id, getProjectResourceState(project)]));
  return <div className="page-container"><PageIntro eyebrow="项目体验卡 · 不在站内运行代码" title="先判断“适不适合我”，再打开外部工具" description="每张卡先把问题、能力、场景、先修、工具/数据、预计时长、产物和安全边界说清楚。首版只提供公开或合成数据与本地运行指引。"><Link className="button button-primary" href="#project-list">浏览 {siteData.projects.length} 张首发卡 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">查看来源与许可</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="今天先试一个" title="按专业、能力、场景、视角或时长筛选" description="筛选条件会进入 URL，刷新或分享后仍能保留。没有匹配结果时可以一键清除。" /><ProjectBrowser projects={siteData.projects} majors={siteData.majors} capabilities={siteData.capabilities} scenarios={siteData.scenarios} resourceStates={resourceStates} initialFilters={initialFilters} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>项目体验卡不使用真实患者数据、不提供诊断结论、不在 HseeHub 内执行不可信代码。外部资源若失效，页面仍保留解释、来源状态和替代下一步。</p></div></section>
  </div>;
}
