import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { evidenceData, getLinkStatus, getProjectResourceState } from '@/lib/content/evidence';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

const linkStatusLabels = { available: '入口可访问', degraded: '入口有变化', unavailable: '入口不可用', unverified: '入口待复核' } as const;

export function generateStaticParams() { return siteData.projects.map((project) => ({ projectSlug: project.slug })); }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  return { title: `${project?.title ?? '项目'} · 资源`, description: '项目体验卡的工具、数据来源、许可与外部入口。', alternates: { canonical: `/projects/${params.projectSlug}/resources` } };
}

export default function ProjectResourcesPage({ params }: { params: { projectSlug: string } }) {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  if (!project) notFound();
  const source = siteData.sources.find((item) => item.id === project.sourceId);
  const resourceState = getProjectResourceState(project);
  const endpoints = evidenceData.endpoints.filter((endpoint) => project.endpointIds.includes(endpoint.id));
  return <div className="page-container"><PageIntro eyebrow="项目资源 · 跳转前先核对状态" title={`${project.title}：工具与数据入口`} description="HseeHub 负责中文导览和边界说明；外部教程、Demo 或工具的实际使用条款，以官方页面当前版本为准。"><Link className="button button-secondary" href={`/projects/${project.slug}`}>回到体验卡</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="资源状态" title={resourceState.label} description={resourceState.description} /><div className="project-endpoint-grid">{endpoints.map((endpoint) => { const status = getLinkStatus(endpoint.id); const availability = evidenceData.linkAvailability.find((item) => item.endpointId === endpoint.id); return <article className="project-endpoint-card" key={endpoint.id}><div className="card-topline"><Badge tone={endpoint.role === 'source' ? 'blue' : 'teal'}>{endpoint.role === 'source' ? '主入口' : '替代入口'}</Badge><span className={`resource-state resource-state-${status === 'available' ? 'ready' : status === 'unavailable' ? 'unavailable' : 'unknown'}`}>{linkStatusLabels[status]}</span></div><h2>{endpoint.url}</h2><p>{availability?.note ?? '状态说明尚未登记。'}</p><small>最近检查：{availability?.checkedAt ?? '未登记'}</small><a className="button button-primary" href={endpoint.url} target="_blank" rel="noreferrer">打开官方入口 <span aria-hidden="true">↗</span></a></article>; })}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="数据、工具与许可" title="先看清成本和边界，再打开外部页面" /><div className="comparison-table-wrap"><table className="comparison-table"><caption className="sr-only">项目工具、数据和许可</caption><tbody><tr><th scope="row">工具</th><td><ul className="detail-list list-no-top">{project.tools.map((tool) => <li key={tool.name}><a className="text-link" href={tool.officialUrl} target="_blank" rel="noreferrer">{tool.name} <span aria-hidden="true">↗</span></a></li>)}</ul></td></tr><tr><th scope="row">数据类型</th><td>{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.access[project.data.access]} · {siteConfig.projectDataLabels.sensitivity[project.data.sensitivity]}</td></tr><tr><th scope="row">数据来源</th><td>{project.dataSource}</td></tr><tr><th scope="row">许可</th><td>{project.license}</td></tr></tbody></table></div><div className="callout"><p><strong>风险边界：</strong>{project.boundary}</p></div><SourceLine source={source} label="项目登记" /></section>
  </div>;
}
