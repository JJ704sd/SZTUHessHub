import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, SectionHeading, SourceLine } from '@/components/site';
import { evidenceData, getLinkStatus, getProjectResourceState } from '@/lib/content/evidence';
import { siteData } from '@/lib/content';
import { getPathwayArtifact } from '@/lib/content/repository';
import { siteConfig } from '@/lib/site-config';

export function generateStaticParams() { return siteData.projects.map((project) => ({ projectSlug: project.slug })); }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  return { title: project?.title ?? '项目体验卡', description: project?.summary ?? 'HseeHub 项目体验卡', alternates: { canonical: `/projects/${params.projectSlug}` } };
}

export default function ProjectDetailPage({ params }: { params: { projectSlug: string } }) {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  if (!project) notFound();
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  const source = siteData.sources.find((item) => item.id === project.sourceId);
  const artifact = getPathwayArtifact(project.artifactId);
  const resourceState = getProjectResourceState(project);
  const endpoints = evidenceData.endpoints.filter((endpoint) => project.endpointIds.includes(endpoint.id));
  const primaryEndpoint = endpoints.find((endpoint) => endpoint.role === 'source' && getLinkStatus(endpoint.id) === 'available');
  const alternativeEndpoint = endpoints.find((endpoint) => endpoint.role === 'replacement' && getLinkStatus(endpoint.id) === 'available');
  const actionEndpoint = resourceState.key === 'ready' ? primaryEndpoint : resourceState.key === 'alternative' ? alternativeEndpoint : undefined;
  const capabilityLabels = project.capabilityIds.map((id) => siteData.capabilities.find((item) => item.id === id)?.shortName).filter(Boolean);
  const scenarioLabels = project.scenarioIds.map((id) => siteData.scenarios.find((item) => item.id === id)?.name).filter(Boolean);
  const resultAsset = project.previewAssets.find((asset) => asset.kind === 'project_output') ?? project.previewAssets.at(-1)!;
  const processAssets = project.previewAssets.filter((asset) => asset.kind === 'process' || asset.kind === 'diagram');

  const startAction = actionEndpoint
    ? <a className="button button-primary" href={actionEndpoint.url} target="_blank" rel="noreferrer">{resourceState.key === 'alternative' ? '打开替代入口' : '打开主入口'} <span aria-hidden="true">↗</span></a>
    : resourceState.key === 'unknown'
      ? <Link className="button button-secondary" href={`/projects/${project.slug}/resources`}>先核验入口 <span aria-hidden="true">→</span></Link>
      : <p className="project-unavailable" role="status">暂时不能开始：{resourceState.description} 请稍后回到资源页核对。</p>;

  return <>
    <section className="project-hero release-b-project-hero"><div className="page-container"><div className="breadcrumb"><Link href="/projects">小项目</Link><span aria-hidden="true">/</span><span>{project.title}</span></div><div className="project-hero-content"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><h1>{project.title}</h1><p>{project.summary}</p><dl className="project-hero-facts"><div><dt>时间</dt><dd>{project.duration}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisites[0]}</dd></div><div><dt>会留下</dt><dd>{project.expectedOutput}</dd></div></dl><div className="project-hero-action">{startAction}<span className={`resource-state resource-state-${resourceState.key}`}>{resourceState.label}</span></div></div></div></section>

    <div className="page-container release-b-project-detail">
      <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="先看完整路线" title="你会经历什么" description="只有真实步骤使用编号。做到停止条件就可以收尾，不需要为了完整而扩大范围。" /><ol className="project-step-list">{project.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><aside className="side-panel project-start-card"><strong>现在能不能开始</strong><p>{resourceState.description}</p>{startAction}<Link className="text-link" href={`/projects/${project.slug}/resources`}>查看全部资源状态 <span aria-hidden="true">→</span></Link></aside></div></section>

      <section className="detail-block"><SectionHeading eyebrow="过程视觉" title="先看看这项工作是怎样做出来的" description="这些画面基于本站项目步骤重建，不代表已有学生参与或完成。" /><div className="project-process-gallery">{(processAssets.length ? processAssets : project.previewAssets.slice(0, 1)).map((asset) => <figure key={asset.src}><img src={asset.src} alt={asset.alt} width="720" height="460" loading="lazy" /><figcaption>{asset.author} · {asset.license}</figcaption></figure>)}</div></section>

      <section className="detail-block" id="artifact-template"><SectionHeading eyebrow="作品记录" title="做完以后，你会留下什么" description="把问题、输入、做法、结果和限制放在一起，别人才能看懂你真正做过什么。" /><div className="project-artifact-layout"><figure className="project-artifact-preview"><img src={resultAsset.src} alt={resultAsset.alt} width="720" height="460" loading="lazy" /><figcaption className="asset-note">{resultAsset.author} · {resultAsset.license} · {resultAsset.generationRef}</figcaption></figure><div className="project-artifact-info"><h3>{artifact?.title ?? project.expectedOutput}</h3><p>{artifact?.description ?? project.expectedOutput}</p><dl className="artifact-annotations"><div><dt>问题</dt><dd>{project.summary}</dd></div><div><dt>输入</dt><dd>{project.dataSource}</dd></div><div><dt>做法</dt><dd>{project.steps.slice(0, 2).join('；')}</dd></div><div><dt>结果</dt><dd>{project.expectedOutput}</dd></div><div><dt>限制</dt><dd>{project.boundary}</dd></div></dl><a className="button button-secondary" href={project.artifactTemplate.href} download>{project.artifactTemplate.label} <span aria-hidden="true">↓</span></a></div></div></section>

      <section className="detail-block"><SectionHeading eyebrow="随时可以停" title="卡住或不合适时，怎么收尾" /><div className="card-grid card-grid-2"><article className="boundary-card"><strong>停止条件</strong><p>{project.stopCondition}</p></article><article className="side-card"><strong>复盘一个问题</strong><p>{project.reflectionPrompt}</p></article></div></section>

      <section className="detail-block"><SectionHeading eyebrow="安全与数据" title="只在边界清楚的范围内继续" /><div className="comparison-table-wrap"><table className="comparison-table"><caption className="sr-only">项目工具、数据和许可</caption><tbody><tr><th scope="row">工具 / 材料</th><td>{project.tools.map((tool) => tool.name).join('、')}</td></tr><tr><th scope="row">数据类型</th><td>{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.sensitivity[project.data.sensitivity]}</td></tr><tr><th scope="row">数据访问</th><td>{project.dataAccess}</td></tr><tr><th scope="row">许可</th><td>{project.license}</td></tr></tbody></table></div><div className="boundary-card section-gap-top"><strong>安全边界</strong><p>{project.boundary}</p></div></section>

      <section className="detail-block"><SectionHeading eyebrow="资源、模板与下一步" title="合适的话，从真实入口继续" /><div className="card-grid card-grid-2"><article className="side-card"><strong>继续做什么</strong><p>{project.nextStep}</p><p>{capabilityLabels.join('、')} · {scenarioLabels.join('、')}</p></article><article className="side-card"><strong>{resourceState.label}</strong><p>{resourceState.description}</p>{startAction}<Link className="text-link" href={`/projects/${project.slug}/resources`}>查看主入口和替代入口 <span aria-hidden="true">→</span></Link></article></div></section>

      <section className="detail-block"><SectionHeading eyebrow="依据与更新时间" title="需要核对时，回到原始来源" /><SourceLine source={source} label="项目来源" /><p className="source-updated">项目内容更新于 {project.updatedAt} · 下次复核日期 {project.reviewDueAt}</p></section>
    </div>
  </>;
}
