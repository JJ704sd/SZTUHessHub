import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectDetailModel, getSiteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { TrustLine } from '@/components/content/trust-line';
import { StatusBadge } from '@/components/ui/primitives';

export function generateStaticParams() { return getSiteData().projects.map((project) => ({ projectSlug: project.slug })); }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  const project = getSiteData().projects.find((item) => item.slug === params.projectSlug);
  return { title: `${project?.title ?? '项目'} · 资源`, description: '项目体验卡的工具、数据来源、许可与外部入口。', alternates: { canonical: `/projects/${params.projectSlug}/resources` } };
}

export default function ProjectResourcesPage({ params }: { params: { projectSlug: string } }) {
  const model = getProjectDetailModel(params.projectSlug);
  if (!model) notFound();
  const { project, catalog } = model;
  const source = getSiteData().sources.find((item) => item.id === project.sourceId);
  return <div className="page-container"><PageIntro eyebrow="项目资源 · 跳转前先核对成本" title={`${project.title}：工具与数据入口`} description="HseeHub 负责中文导览和边界说明；外部教程、Demo 或工具的实际使用条款，以官方页面当前版本为准。"><Link className="button button-secondary" href={`/projects/${project.slug}`}>回到体验卡</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="资源状态" title="已登记的官方入口" description="事实可信度与链接可用性分开记录；状态表示最后一次核验时的已知情况，不承诺实时感知第三方站点变化。" /><article className="resource-card project-list-card"><div><div className="card-topline"><StatusBadge status={catalog.resourceHealth.status} label={{ available: '资源可用', degraded: '资源有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[catalog.resourceHealth.status]} /><span className="card-kicker">最后核验：{catalog.resourceHealth.checkedAt}</span></div><h2>{project.dataSource}</h2><ul className="detail-list list-no-top">{catalog.endpoints.map((endpoint) => { const link = catalog.linkAvailability.find((item) => item.endpointId === endpoint.id); return <li key={endpoint.id}><span className="endpoint-role">{endpoint.role === 'source' ? '来源' : endpoint.role === 'replacement' ? '批准替代' : '工具'}</span> <a className="text-link" href={endpoint.url} target="_blank" rel="noreferrer">{endpoint.url} <span aria-hidden="true">↗</span></a> <span className="source-meta">· {link?.status ?? 'unverified'} · {link?.checkedAt ?? '未探测'}</span></li>; })}</ul><div className="tag-row"><Badge tone="muted">{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.access[project.data.access]}</Badge><Badge tone="muted">{project.dataAccess}</Badge><Badge tone="muted">{project.license}</Badge></div>{catalog.resourceHealth.note ? <p className="resource-note">{catalog.resourceHealth.note}</p> : null}<TrustLine label="来源事实" factStatus={catalog.claims.dataBoundary.status} linkStatus={catalog.resourceHealth.status} href={catalog.claims.dataBoundary.evidenceHref} /></div><div className="project-list-side"><span className="project-viewpoint">跳转前说明</span><span>预计时长：{project.duration}</span><span>数据：{project.dataAccess}</span>{catalog.resourceHealth.status === 'unavailable' ? <span>暂无可用官方入口，请先阅读项目详情中的替代说明。</span> : <a className="button button-primary" href={catalog.resourceHealth.replacementUrl ?? project.sourceUrl} target="_blank" rel="noreferrer">打开官方资源 <span aria-hidden="true">↗</span></a>}</div></article></section>
    <section className="detail-block"><SectionHeading eyebrow="安全与许可" title="这张卡允许什么，不允许什么" /><div className="card-grid card-grid-2"><article className="side-card"><strong>数据边界</strong><p>{project.dataAccess}{project.dataAccess.endsWith('。') ? '' : '。'}{project.boundary}</p></article><article className="side-card"><strong>使用许可</strong><p>{project.license}{project.license.endsWith('。') ? '' : '。'}不要上传真实患者数据或未获许可的个人/商业敏感数据。</p></article></div><div className="source-block-spaced"><SourceLine source={source} label="项目登记" /></div></section>
  </div>;
}
