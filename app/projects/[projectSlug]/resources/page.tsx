import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export function generateStaticParams() { return siteData.projects.map((project) => ({ projectSlug: project.slug })); }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  return { title: `${project?.title ?? '项目'} · 资源`, description: '项目体验卡的工具、数据来源、许可与外部入口。', alternates: { canonical: `/projects/${params.projectSlug}/resources` } };
}

export default function ProjectResourcesPage({ params }: { params: { projectSlug: string } }) {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  if (!project) notFound();
  const source = siteData.sources.find((item) => item.id === project.sourceId);
  return <div className="page-container"><PageIntro eyebrow="项目资源 · 跳转前先核对成本" title={`${project.title}：工具与数据入口`} description="HseeHub 负责中文导览和边界说明；外部教程、Demo 或工具的实际使用条款，以官方页面当前版本为准。"><Link className="button button-secondary" href={`/projects/${project.slug}`}>回到体验卡</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="资源状态" title="已登记的官方入口" description="如果外部资源暂时失效，项目详情仍然可读；请优先检查替代说明或返回上一步。" /><article className="project-list-card"><div><div className="card-topline"><Badge tone="teal">待人工核验</Badge><span className="card-kicker">最后核验：{project.lastVerified}</span></div><h2>{project.dataSource}</h2><ul className="detail-list list-no-top">{project.tools.map((tool) => <li key={tool.name}><a className="text-link" href={tool.officialUrl} target="_blank" rel="noreferrer">{tool.name} <span aria-hidden="true">↗</span></a></li>)}</ul><div className="tag-row"><Badge tone="muted">{siteConfig.projectDataLabels.kind[project.data.kind]} · {siteConfig.projectDataLabels.access[project.data.access]}</Badge><Badge tone="muted">{project.dataAccess}</Badge><Badge tone="muted">{project.license}</Badge></div></div><div className="project-list-side"><span className="project-viewpoint">跳转前说明</span><span>预计时长：{project.duration}</span><span>数据：{project.dataAccess}</span><a className="button button-primary" href={project.sourceUrl} target="_blank" rel="noreferrer">打开官方资源 <span aria-hidden="true">↗</span></a></div></article></section>
    <section className="detail-block"><SectionHeading eyebrow="安全与许可" title="这张卡允许什么，不允许什么" /><div className="card-grid card-grid-2"><article className="side-card"><strong>数据边界</strong><p>{project.dataAccess}{project.dataAccess.endsWith('。') ? '' : '。'}{project.boundary}</p></article><article className="side-card"><strong>使用许可</strong><p>{project.license}{project.license.endsWith('。') ? '' : '。'}不要上传真实患者数据或未获许可的个人/商业敏感数据。</p></article></div><div className="source-block-spaced"><SourceLine source={source} label="项目登记" /></div></section>
  </div>;
}
