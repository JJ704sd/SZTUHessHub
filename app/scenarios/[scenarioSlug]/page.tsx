import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/content';
import { ArrowLink, Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { siteConfig } from '@/lib/site-config';

export function generateStaticParams() { return siteData.scenarios.map((scenario) => ({ scenarioSlug: scenario.slug })); }

export function generateMetadata({ params }: { params: { scenarioSlug: string } }): Metadata {
  const scenario = siteData.scenarios.find((item) => item.slug === params.scenarioSlug);
  return { title: scenario?.name ?? '发展场景', description: scenario?.summary ?? 'HseeHub 能力迁移场景导览', alternates: siteConfig.isProduction ? { canonical: `/scenarios/${params.scenarioSlug}` } : undefined };
}

export default function ScenarioDetailPage({ params }: { params: { scenarioSlug: string } }) {
  const scenario = siteData.scenarios.find((item) => item.slug === params.scenarioSlug);
  if (!scenario) notFound();
  const source = siteData.sources.find((item) => item.id === scenario.sourceId);
  const relatedProjects = siteData.projects.filter((project) => project.scenarioIds.includes(scenario.id));
  const capabilityMap = new Map(siteData.capabilities.map((capability) => [capability.id, capability]));
  return <div className="page-container"><PageIntro eyebrow="发展场景 · 共用能力 + 新增门槛" title={scenario.name} description={scenario.summary}><Link className="button button-primary" href="/projects">找对应项目 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/scenarios">回到场景总览</Link></PageIntro>
    <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="问题与约束" title="在这个场景里，工程任务会怎样变化？" /><p>{scenario.example}</p><div className="card-grid card-grid-2 section-gap-top"><article className="side-card"><Badge tone="teal">共用能力</Badge><ul className="detail-list">{scenario.sharedCapabilities.map((item) => { const capability = capabilityMap.get(item); return <li key={item}>{capability ? <Link className="text-link" href={`/capabilities/${capability.slug}`}>{capability.name}</Link> : item}</li>; })}</ul></article><article className="side-card"><Badge tone="amber">新增门槛</Badge><p>{scenario.extraGate}</p></article></div></div><aside className="side-panel"><div className="side-card"><strong>不做什么</strong><p>不把场景写成行业通行证，不按企业或职位排名，也不替学生做职业选择。</p><ArrowLink href="/capabilities">回看能力定义</ArrowLink></div></aside></div></section>
    <section className="detail-block"><SectionHeading eyebrow="代表项目" title="用一个小成果验证方法能否迁移" />{relatedProjects.length > 0 ? <div className="card-grid card-grid-2">{relatedProjects.map((project) => <article className="side-card" key={project.id}><Badge tone="blue">{project.kicker}</Badge><h3 className="detail-card-heading project-heading">{project.title}</h3><p>{project.expectedOutput}</p><ArrowLink href={`/projects/${project.slug}`}>查看体验卡</ArrowLink></article>)}</div> : <div className="empty-state"><p>当前没有已登记的代表项目，请先从能力地图继续。</p><Link className="button button-secondary" href="/capabilities">回到能力地图</Link></div>}</section>
    <section className="detail-block"><SourceLine source={source} label="场景依据" /></section>
  </div>;
}
