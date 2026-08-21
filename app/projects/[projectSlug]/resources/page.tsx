import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { TrustLine } from '@/components/content/trust-line';
import { StatusBadge } from '@/components/ui/primitives';
import { getProjectBySlug, getProjectDetailModel, getSiteData } from '@/lib/content';
import { canBePrimary, deriveResourceStatus, makeLegacyResourceManifest, resourceManifests, resourceStatusLabel, type ResourceLink } from '@/lib/resources';
import { siteConfig } from '@/lib/site-config';

export function generateStaticParams() { return getSiteData().projects.map((project) => ({ projectSlug: project.slug })); }

type ProjectResourcesProps = { params: Promise<{ projectSlug: string }> };

export async function generateMetadata({ params }: ProjectResourcesProps): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = getSiteData().projects.find((item) => item.slug === projectSlug);
  return { title: `${project?.title ?? '项目'} · 资源`, description: '项目体验卡的工具、数据来源、许可与外部入口。', alternates: siteConfig.isProduction ? { canonical: `/projects/${projectSlug}/resources` } : undefined };
}

function ResourceCard({ resource, primary, now }: { resource: ResourceLink; primary: boolean; now: Date }) {
  const status = deriveResourceStatus(resource, now);
  const internal = resource.url.startsWith('/');
  const action = status === 'verified'
    ? internal ? <Link className={primary ? 'button button-primary' : 'button button-secondary'} href={resource.url}>{primary ? '开始 starter' : '打开站内入口'} <span aria-hidden="true">→</span></Link> : <a className="button button-secondary" href={resource.url} target="_blank" rel="noreferrer">打开外部资源 <span aria-hidden="true">↗</span></a>
    : <span className="resource-action-note" role="status">当前状态为“{resourceStatusLabel(status)}”，先核验后再打开。</span>;
  return <article className="resource-card"><div className="resource-card-head"><div><Badge tone={status === 'verified' ? 'teal' : status === 'unavailable' ? 'amber' : 'muted'}>{resourceStatusLabel(status)}</Badge><h3>{resource.title}</h3></div><span className="card-kicker">{resource.kind}</span></div><dl className="resource-facts"><div><dt>版本</dt><dd>{resource.version}</dd></div><div><dt>owner</dt><dd>{resource.ownerId}</dd></div><div><dt>机器</dt><dd>{resource.availability}{resource.automatedStatusCode ? ` · HTTP ${resource.automatedStatusCode}` : ''}{resource.lastAutomatedCheckAt ? ` · ${resource.lastAutomatedCheckAt}` : ''}</dd></div><div><dt>人工</dt><dd>{resource.reviewStatus}{resource.reviewedBy ? ` · ${resource.reviewedBy}` : ''}{resource.lastHumanWalkthroughAt ? ` · ${resource.lastHumanWalkthroughAt}` : ' · 未登记走通时间'}</dd></div><div><dt>freshness</dt><dd>{resource.lastHumanWalkthroughAt && status === 'verified' ? 'fresh · 30 天内' : 'not fresh'}</dd></div><div><dt>许可</dt><dd>{resource.license}</dd></div></dl>{resource.failureReason ? <p className="resource-warning">{resource.failureReason}</p> : null}<div className="resource-actions">{action}{primary && status !== 'verified' ? <span className="resource-action-note">条件未齐全，不升级为主 CTA</span> : null}</div>{resource.internalFallbackPath ? <p className="resource-fallback">替代入口：<Link href={resource.internalFallbackPath}>回到项目说明</Link></p> : null}<small className="resource-url">权威路径：{resource.url}</small></article>;
}

export default async function ProjectResourcesPage({ params }: ProjectResourcesProps) {
  const { projectSlug } = await params;
  const model = getProjectDetailModel(projectSlug);
  const project = getProjectBySlug(projectSlug);
  if (!model || !project) notFound();
  const source = getSiteData().sources.find((item) => item.id === project.sourceId);
  const manifest = resourceManifests.find((item) => item.projectId === project.id) ?? makeLegacyResourceManifest(project);
  const now = new Date();
  const primary = manifest.resources.find((resource) => resource.id === manifest.primaryResourceId);
  const primaryReady = Boolean(primary && canBePrimary(primary, now));
  const { catalog } = model;
  return <div className="page-container"><PageIntro eyebrow="项目资源 · 跳转前先核对成本" title={`${project.title}：工具与数据入口`} description="HseeHub 负责中文导览和边界说明；外部教程、Demo 或工具的实际使用条款，以官方页面当前版本为准。"><Link className="button button-secondary" href={`/projects/${project.slug}`}>回到体验卡 <span aria-hidden="true">→</span></Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="资源状态" title="事实可信度与链接可用性分开显示" description="已登记入口同时保留 EvidenceRef、endpoint 角色和最后探测状态；外部页面可访问不等于事实自动可信。" /><article className="resource-card project-list-card"><div><div className="card-topline"><StatusBadge status={catalog.resourceHealth.status} label={{ available: '资源可用', degraded: '资源有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[catalog.resourceHealth.status]} /><span className="card-kicker">最后核验：{catalog.resourceHealth.checkedAt}</span></div><h2>{project.dataSource}</h2><ul className="detail-list list-no-top">{catalog.endpoints.map((endpoint) => { const link = catalog.linkAvailability.find((item) => item.endpointId === endpoint.id); return <li key={endpoint.id}><span className="endpoint-role">{endpoint.role === 'source' ? '来源' : endpoint.role === 'replacement' ? '批准替代' : '工具'}</span> <span className="source-meta">{endpoint.url} · {link?.status ?? 'unverified'} · {link?.checkedAt ?? '未探测'}</span></li>; })}</ul><div className="tag-row"><Badge tone="muted">{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.access[project.data.access]}</Badge><Badge tone="muted">{project.dataAccess}</Badge><Badge tone="muted">{project.license}</Badge></div>{catalog.resourceHealth.note ? <p className="resource-note">{catalog.resourceHealth.note}</p> : null}<TrustLine label="来源事实" factStatus={catalog.claims.dataBoundary.status} linkStatus={catalog.resourceHealth.status} href={catalog.claims.dataBoundary.evidenceHref} /></div><div className="project-list-side"><span className="project-viewpoint">跳转前说明</span><span>预计时长：{project.duration}</span><span>数据：{project.dataAccess}</span>{catalog.resourceHealth.status === 'available' ? <a className="button button-primary" href={project.sourceUrl} target="_blank" rel="noreferrer">打开官方资源 <span aria-hidden="true">↗</span></a> : catalog.resourceHealth.status === 'degraded' && catalog.resourceHealth.replacementUrl ? <a className="button button-primary" href={catalog.resourceHealth.replacementUrl} target="_blank" rel="noreferrer">打开替代入口 <span aria-hidden="true">↗</span></a> : <span role="status">当前入口不能承诺可开始，请先查看下方核验记录。</span>}</div></article></section>
    <section className="detail-block"><SectionHeading eyebrow="starter 入口" title="机器可达不等于人工走通" description="只有机器可达、人工复核和 freshness 同时满足时，starter 才能成为主入口；当前状态保留为可审计记录。" /><div className="resource-summary"><strong>primaryResourceId</strong><span>{manifest.primaryResourceId || '未登记；当前仅展示工具参考入口'}</span><span>{project.launch ? `启动上限 ${project.launch.maxStartSeconds} 秒 · ${project.launch.tenMinuteOutput}` : '该项目尚未登记 2 分钟 starter 合同。'}</span>{primaryReady ? <Badge tone="teal">可作为主 CTA</Badge> : <Badge tone="amber">当前不作为主 CTA</Badge>}</div><div className="resource-list">{manifest.resources.map((resource) => <ResourceCard key={resource.id} resource={resource} primary={resource.id === manifest.primaryResourceId && primaryReady} now={now} />)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="安全与许可" title="这张卡允许什么，不允许什么" /><div className="card-grid card-grid-2"><article className="side-card"><strong>数据边界</strong><p>{project.dataAccess}{project.dataAccess.endsWith('。') ? '' : '。'}{project.boundary}</p></article><article className="side-card"><strong>使用许可</strong><p>{project.license}{project.license.endsWith('。') ? '' : '。'}不要上传真实患者数据或未获许可的个人/商业敏感数据。</p></article></div><div className="source-block-spaced"><SourceLine source={source} label="项目登记" /></div></section>
  </div>;
}
