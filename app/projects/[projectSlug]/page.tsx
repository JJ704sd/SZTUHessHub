import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectDetailModel, siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { Badge, SectionHeading, SourceLine } from '@/components/site';
import { TrustLine } from '@/components/content/trust-line';
import { StatusBadge } from '@/components/ui/primitives';
import { getProjectResourceState } from '@/lib/content/project-resource-state';
import { primaryResourceConditions, resourceManifests } from '@/lib/resources';
import styles from './project-detail.module.css';

export function generateStaticParams() { return siteData.projects.map((project) => ({ projectSlug: project.slug })); }

type ProjectDetailProps = { params: Promise<{ projectSlug: string }> };

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = siteData.projects.find((item) => item.slug === projectSlug);
  return { title: project?.title ?? '项目体验卡', description: project?.summary ?? 'HseeHub 项目体验卡', alternates: siteConfig.isProduction ? { canonical: `/projects/${projectSlug}` } : undefined };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { projectSlug } = await params;
  const model = getProjectDetailModel(projectSlug);
  if (!model) notFound();
  const { project, catalog } = model;
  const source = siteData.sources.find((item) => item.id === project.sourceId);
  const statusLabel = { available: '资源可用', degraded: '有替代入口', unverified: '需要先核验', unavailable: '暂不可开始' }[catalog.resourceHealth.status];
  const resourceState = getProjectResourceState(project);
  const primaryEndpoint = catalog.endpoints.find((endpoint) => endpoint.role === 'source');
  const primaryUrl = primaryEndpoint?.url ?? project.sourceUrl;
  const isStarterProject = project.slug === 'signal-feature-notebook';
  const starterManifest = resourceManifests.find((item) => item.projectId === project.id);
  const starterResource = starterManifest?.resources.find((item) => item.id === starterManifest.primaryResourceId);
  const starterConditions = starterResource ? primaryResourceConditions(starterResource) : null;
  const startAction = catalog.resourceHealth.status === 'available'
    ? <a className="button button-primary" href={primaryUrl} target="_blank" rel="noreferrer">打开主入口 <span aria-hidden="true">↗</span></a>
    : catalog.resourceHealth.status === 'degraded' && catalog.resourceHealth.replacementUrl
      ? <a className="button button-primary" href={catalog.resourceHealth.replacementUrl} target="_blank" rel="noreferrer">打开替代入口 <span aria-hidden="true">↗</span></a>
      : catalog.resourceHealth.status === 'unverified'
        ? <Link className="button button-secondary" href={`/projects/${project.slug}/resources`}>先核验入口 <span aria-hidden="true">→</span></Link>
      : <p className="project-unavailable" role="status">暂时不能开始：{catalog.resourceHealth.note ?? '已登记入口当前不可用。'} 请稍后回到资源页核对。</p>;
  const heroAction = isStarterProject ? <div className={styles.startPanel}><div className={styles.actions}><Link className="button button-primary" href={`/projects/${project.slug}/starter`}>{starterConditions?.humanVerified && starterConditions.fresh ? '先做 10 分钟 Starter' : 'Starter 待人工复核（可预览）'} <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href={`/projects/${project.slug}/resources`}>看完整步骤与资源 <span aria-hidden="true">→</span></Link><a className={styles.reference} href={primaryUrl} target="_blank" rel="noreferrer">打开 PhysioNet 说明 <span aria-hidden="true">↗</span></a></div><dl className={styles.statuses} aria-label="Starter 三维状态"><div><dt>机器可达</dt><dd>{starterConditions?.machineReachable ? 'reachable' : 'unknown'}</dd></div><div><dt>人工待复核</dt><dd>{starterConditions?.humanVerified ? 'approved' : 'pending'}</dd></div><div><dt>新鲜度</dt><dd>{starterConditions?.fresh ? 'current' : '待登记'}</dd></div></dl><p className={styles.pending}>机器返回 200 只说明路由可达；owner、许可和人工走通未登记，因此不标记“可直接开始”。</p></div> : <>{startAction}<span className={`resource-state resource-state-${resourceState.key}`}>{resourceState.label}</span></>;

  return <>
    <section className="project-hero release-b-project-hero"><div className="page-container"><div className="breadcrumb"><Link href="/projects">小项目</Link><span aria-hidden="true">/</span><span>{project.title}</span></div><div className="project-hero-content"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><h1>{project.title}</h1><p>{project.summary}</p><dl className="project-hero-facts"><div><dt>时间</dt><dd>{project.duration}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisites[0]}</dd></div><div><dt>会留下</dt><dd>{project.expectedOutput}</dd></div></dl><div className="project-hero-action">{heroAction}</div></div></div></section>

    <div className="page-container release-b-project-detail">
      <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="先看完整路线" title="你会经历什么" description="只有真实步骤使用编号。完成一个足够小的成果就可以停，不需要为了完整而扩大范围。" /><ol className="project-step-list">{project.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><aside className="side-panel project-start-card"><strong>现在能不能开始</strong><StatusBadge status={catalog.resourceHealth.status} label={statusLabel} /><p>{catalog.resourceHealth.note ?? '打开前先核对资源状态、数据许可和工具成本。'}</p>{startAction}<Link className="text-link" href={`/projects/${project.slug}/resources`}>查看全部资源状态 <span aria-hidden="true">→</span></Link></aside></div></section>

      <section className="detail-block"><SectionHeading eyebrow="过程视觉" title="先看看这项工作会处理什么" description="这是登记项目的确定性视觉预览，不代表已有学生参与或完成。" /><div className="project-process-gallery"><figure><img src={catalog.visualAsset.src} alt={catalog.visualAsset.alt} width={catalog.visualAsset.width} height={catalog.visualAsset.height} loading="lazy" /><figcaption>{catalog.visualAsset.alt}</figcaption></figure></div></section>

      <section className="detail-block" id="artifact-template"><SectionHeading eyebrow="作品记录" title="做完以后，你会留下什么" description="把问题、输入、做法、结果和限制放在一起，别人才能看懂你真正做过什么。" /><div className="project-artifact-layout"><figure className="project-artifact-preview"><img src={catalog.visualAsset.src} alt={catalog.visualAsset.alt} width={catalog.visualAsset.width} height={catalog.visualAsset.height} loading="lazy" /><figcaption className="asset-note">本站登记的项目结果预览</figcaption></figure><div className="project-artifact-info"><h3>{project.expectedOutput}</h3><dl className="artifact-annotations"><div><dt>问题</dt><dd>{project.summary}</dd></div><div><dt>输入</dt><dd>{project.dataSource}</dd></div><div><dt>做法</dt><dd>{project.steps.slice(0, 2).join('；')}</dd></div><div><dt>结果</dt><dd>{project.expectedOutput}</dd></div><div><dt>限制</dt><dd>{project.boundary}</dd></div></dl>{isStarterProject ? <Link className="button button-secondary" href={`/projects/${project.slug}/starter`}>打开 10 分钟 Starter <span aria-hidden="true">→</span></Link> : <a className="button button-secondary" href={project.artifactTemplate.href} download>下载记录模板</a>}</div></div></section>

      <section className="detail-block"><SectionHeading eyebrow="随时可以停" title="卡住或不合适时，怎么收尾" /><div className="card-grid card-grid-2"><article className="boundary-card"><strong>停止条件</strong><p>完成一份能说明问题、过程、结果和限制的最小记录后即可停止；不要扩大到真实诊疗或敏感数据。</p></article><article className="side-card"><strong>复盘一个问题</strong><p>哪一步最能说明你愿不愿意继续做同类任务？</p></article></div></section>

      <section className="detail-block"><SectionHeading eyebrow="安全与数据" title="只在边界清楚的范围内继续" /><div className="comparison-table-wrap"><table className="comparison-table"><caption className="sr-only">项目工具、数据和许可</caption><tbody><tr><th scope="row">工具 / 材料</th><td>{project.tools.map((tool) => tool.name).join('、')}</td></tr><tr><th scope="row">数据类型</th><td>{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.sensitivity[project.data.sensitivity]}</td></tr><tr><th scope="row">数据访问</th><td>{project.dataAccess}</td></tr><tr><th scope="row">许可</th><td>{project.license}</td></tr></tbody></table></div><div className="boundary-card section-gap-top"><strong>安全边界</strong><p>{project.safetyBoundary}</p></div><TrustLine label="数据边界事实" factStatus={catalog.claims.dataBoundary.status} href={catalog.claims.dataBoundary.evidenceHref} /></section>

      <section className="detail-block"><SectionHeading eyebrow="资源、模板与下一步" title="合适的话，从真实入口继续" /><div className="card-grid card-grid-2"><article className="side-card"><strong>继续做什么</strong><p>{project.nextStep}</p></article><article className="side-card"><strong>{statusLabel}</strong><p>{catalog.resourceHealth.note ?? '打开前先核对资源状态。'}</p>{startAction}<Link className="text-link" href={`/projects/${project.slug}/resources`}>查看主入口和替代入口 <span aria-hidden="true">→</span></Link></article></div></section>

      <section className="detail-block"><SectionHeading eyebrow="依据与更新时间" title="需要核对时，回到原始来源" /><SourceLine source={source} label="项目来源" /><p className="source-updated">项目最后核验于 {project.lastVerified}</p></section>
    </div>
  </>;
}
