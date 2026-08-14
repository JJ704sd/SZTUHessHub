import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { TrackedLink } from '@/components/tracked-link';
import { getProjectBySlug, siteData } from '@/lib/content';
import { canBePrimary, deriveResourceStatus, makeLegacyResourceManifest, resourceManifests, resourceStatusLabel, type ResourceLink } from '@/lib/resources';
import { siteConfig } from '@/lib/site-config';

export function generateStaticParams() { return siteData.projects.map((project) => ({ projectSlug: project.slug })); }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  const project = getProjectBySlug(params.projectSlug);
  return { title: `${project?.title ?? '项目'} · 资源`, description: '项目体验卡的工具、数据来源、许可与外部入口。', alternates: siteConfig.isProduction ? { canonical: `/projects/${params.projectSlug}/resources` } : undefined };
}

function ResourceCard({ projectId, resource, primary, now }: { projectId: string; resource: ResourceLink; primary: boolean; now: Date }) {
  const status = deriveResourceStatus(resource, now);
  const internal = resource.url.startsWith('/');
  const action = internal ? <TrackedLink className={primary ? 'button button-primary' : 'button button-secondary'} href={resource.url} event={{ name: 'starter_begin', projectId, resourceId: resource.id }}>{primary ? '开始 starter' : '打开站内入口'} <span aria-hidden="true">→</span></TrackedLink> : <TrackedLink className="button button-secondary" href={resource.url} target="_blank" rel="noreferrer" event={{ name: 'external_resource_open', projectId, resourceId: resource.id }}>打开外部资源 <span aria-hidden="true">↗</span></TrackedLink>;
  return <article className="resource-card"><div className="resource-card-head"><div><Badge tone={status === 'verified' ? 'teal' : status === 'unavailable' ? 'amber' : 'muted'}>{resourceStatusLabel(status)}</Badge><h3>{resource.title}</h3></div><span className="card-kicker">{resource.kind}</span></div><dl className="resource-facts"><div><dt>版本</dt><dd>{resource.version}</dd></div><div><dt>owner</dt><dd>{resource.ownerId}</dd></div><div><dt>机器</dt><dd>{resource.availability}{resource.automatedStatusCode ? ` · HTTP ${resource.automatedStatusCode}` : ''}{resource.lastAutomatedCheckAt ? ` · ${resource.lastAutomatedCheckAt}` : ''}</dd></div><div><dt>人工</dt><dd>{resource.reviewStatus}{resource.reviewedBy ? ` · ${resource.reviewedBy}` : ''}{resource.lastHumanWalkthroughAt ? ` · ${resource.lastHumanWalkthroughAt}` : ' · 未登记走通时间'}</dd></div><div><dt>freshness</dt><dd>{resource.lastHumanWalkthroughAt && status === 'verified' ? 'fresh · 30 天内' : 'not fresh'}</dd></div><div><dt>许可</dt><dd>{resource.license}</dd></div></dl>{resource.failureReason ? <p className="resource-warning">{resource.failureReason}</p> : null}<div className="resource-actions">{action}{primary && status !== 'verified' ? <span className="resource-action-note">条件未齐全，不升级为主 CTA</span> : null}</div>{resource.internalFallbackPath ? <p className="resource-fallback">替代入口：<Link href={resource.internalFallbackPath}>回到项目说明</Link></p> : null}<small className="resource-url">权威路径：{resource.url}</small></article>;
}

export default function ProjectResourcesPage({ params }: { params: { projectSlug: string } }) {
  const project = getProjectBySlug(params.projectSlug);
  if (!project) notFound();
  const source = siteData.sources.find((item) => item.id === project.sourceId);
  const manifest = resourceManifests.find((item) => item.projectId === project.id) ?? makeLegacyResourceManifest(project);
  const now = new Date();
  const primary = manifest.resources.find((resource) => resource.id === manifest.primaryResourceId);
  const primaryReady = Boolean(primary && canBePrimary(primary, now));
  return <div className="page-container"><PageIntro eyebrow="项目资源 · 跳转前先核对成本" title={`${project.title}：工具与数据入口`} description="HseeHub 负责中文导览和边界说明；外部教程、Demo 或工具的实际使用条款，以官方页面当前版本为准。"><Link className="button button-secondary" href={`/projects/${project.slug}`}>回到体验卡 <span aria-hidden="true">→</span></Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="资源状态" title="机器可达性与人工复核分开显示" description="HTTP/站内可达只说明能连到；只有人工走通且在 freshness 窗口内，starter 才能成为主入口。" /><div className="resource-summary"><strong>primaryResourceId</strong><span>{manifest.primaryResourceId || '未登记；当前仅展示工具参考入口'}</span><span>{project.launch ? `启动上限 ${project.launch.maxStartSeconds} 秒 · ${project.launch.tenMinuteOutput}` : '该项目尚未登记 2 分钟 starter 合同。'}</span>{primaryReady ? <Badge tone="teal">可作为主 CTA</Badge> : <Badge tone="amber">当前不作为主 CTA</Badge>}</div><div className="resource-list">{manifest.resources.map((resource) => <ResourceCard key={resource.id} projectId={project.id} resource={resource} primary={resource.id === manifest.primaryResourceId && primaryReady} now={now} />)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="安全与许可" title="这张卡允许什么，不允许什么" /><div className="card-grid card-grid-2"><article className="side-card"><strong>数据边界</strong><p>{project.dataAccess}{project.dataAccess.endsWith('。') ? '' : '。'}{project.boundary}</p></article><article className="side-card"><strong>使用许可</strong><p>{project.license}{project.license.endsWith('。') ? '' : '。'}不要上传真实患者数据或未获许可的个人/商业敏感数据。</p></article></div><div className="source-block-spaced"><SourceLine source={source} label="项目登记" /></div></section>
  </div>;
}
