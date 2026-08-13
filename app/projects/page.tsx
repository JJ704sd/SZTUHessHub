import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjectCatalog } from '@/lib/content';
import { PageIntro, SectionHeading } from '@/components/site';
import { ProjectBrowser } from '@/components/project-browser';

export const metadata: Metadata = {
  title: '项目探索',
  description: '从数据与 AI、传感与仪器、材料与检测等视角，挑一个可以继续尝试的小项目。',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  const catalog = getProjectCatalog();
  return <div className="page-container"><PageIntro eyebrow="项目体验卡 · 不在站内运行代码" title="先判断“适不适合我”，再打开外部工具" description="每张卡先把问题、能力、场景、先修、工具/数据、预计时长、产物和安全边界说清楚。首版只提供公开或合成数据与本地运行指引。"><Link className="button button-primary" href="#project-list">浏览 {catalog.items.length} 张首发卡 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/sources">查看来源与许可</Link></PageIntro>
    <section className="detail-block" id="project-list"><SectionHeading eyebrow="今天先试一个" title="先比较结果，再按需展开筛选" description="默认直接显示全部体验卡；筛选条件会进入 URL，刷新或分享后仍能保留。没有匹配结果时可以一键清除。" /><ProjectBrowser projects={catalog.items} filters={catalog.filters} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>项目体验卡不使用真实患者数据、不提供诊断结论、不在 HseeHub 内执行不可信代码。外部资源若失效，页面仍保留解释、来源状态和替代下一步。</p></div></section>
  </div>;
}
