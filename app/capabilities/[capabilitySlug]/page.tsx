import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCapabilityDetailModel, siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export function generateStaticParams() { return siteData.capabilities.map((capability) => ({ capabilitySlug: capability.slug })); }

type CapabilityDetailProps = { params: Promise<{ capabilitySlug: string }> };

export async function generateMetadata({ params }: CapabilityDetailProps): Promise<Metadata> {
  const { capabilitySlug } = await params;
  const capability = siteData.capabilities.find((item) => item.slug === capabilitySlug);
  return { title: capability?.name ?? '能力详情', description: capability?.summary ?? 'HseeHub 能力与课程关系导览', alternates: siteConfig.isProduction ? { canonical: `/capabilities/${capabilitySlug}` } : undefined };
}

export default async function CapabilityDetailPage({ params }: CapabilityDetailProps) {
  const { capabilitySlug } = await params;
  const capability = siteData.capabilities.find((item) => item.slug === capabilitySlug);
  if (!capability) notFound();
  const model = getCapabilityDetailModel(capabilitySlug);
  if (!model) notFound();
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  const source = siteData.sources.find((item) => item.id === capability.sourceId);
  return <div className="page-container"><PageIntro eyebrow="能力详情 · 解释性导览" title={capability.name} description={capability.summary}><Link className="button button-primary" href="/projects">找一张项目体验卡 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/capabilities">回到 {siteData.capabilities.length} 类能力</Link></PageIntro>
    <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="为什么学" title={capability.why} /><div className="callout"><p><strong>典型任务：</strong>{capability.task}</p></div><SectionHeading eyebrow="课程证据" title="两个专业怎样形成这项能力" description="课程名称和关系只在对应培养方案版本下解释，不把单门课等同于岗位胜任。" /><div className="card-grid card-grid-2">{model.majors.map((evidence) => <article className="side-card" key={evidence.majorId}><Badge tone={evidence.majorId.includes('biomedical') ? 'teal' : 'blue'}>{evidence.major?.shortName ?? '专业'}</Badge><h3 className="detail-card-heading course-heading"><Link href={`/majors/${evidence.major?.slug}/curriculum/${siteConfig.currentCohort}`}>{evidence.course}</Link></h3><p>这门/组课程提供与“{capability.task}”相关的观察或练习入口。</p></article>)}</div></div><aside className="side-panel"><div className="side-card"><strong>健康样例</strong><p>{capability.healthExample}</p></div><div className="side-card"><strong>跨行业样例</strong><p>{capability.transferExample}</p></div></aside></div></section>
    <section className="detail-block"><SectionHeading eyebrow="继续追问" title="进入场景时，哪些条件会改变？" /><div className="card-grid card-grid-2"><article className="transfer-box"><h3>共用方法</h3><p>{capability.healthExample}</p></article><article className="transfer-box"><h3>新增门槛</h3><p>{capability.transferExample}</p></article></div></section>
    <section className="detail-block"><SectionHeading eyebrow="下一步" title="把能力变成一个可说明的成果" /><div className="card-grid card-grid-3">{model.projects.map((project) => <article className="side-card" key={project.id}><Badge tone="amber">项目</Badge><h3 className="detail-card-heading project-heading"><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.outputSummary}</p><ArrowLink href={`/projects/${project.slug}`}>打开体验卡</ArrowLink></article>)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="反向关系" title="这项能力还能进入哪些场景" /><div className="relation-list relation-list-grid">{model.scenarios.map((scenario) => <Link key={scenario.id} href={`/scenarios/${scenario.slug}`}>{scenario.name}<span>{scenario.taskSummary}</span></Link>)}</div></section>
    <section className="detail-block"><SourceLine source={source} label="能力与课程依据" /></section>
  </div>;
}
