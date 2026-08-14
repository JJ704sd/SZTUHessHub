import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { TrackedLink } from '@/components/tracked-link';

export function generateStaticParams() { return siteData.capabilities.map((capability) => ({ capabilitySlug: capability.slug })); }

export function generateMetadata({ params }: { params: { capabilitySlug: string } }): Metadata {
  const capability = siteData.capabilities.find((item) => item.slug === params.capabilitySlug);
  return { title: capability?.name ?? '能力详情', description: capability?.summary ?? 'HseeHub 能力与课程关系导览', alternates: siteConfig.isProduction ? { canonical: `/capabilities/${params.capabilitySlug}` } : undefined };
}

export default function CapabilityDetailPage({ params }: { params: { capabilitySlug: string } }) {
  const capability = siteData.capabilities.find((item) => item.slug === params.capabilitySlug);
  if (!capability) notFound();
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  const source = siteData.sources.find((item) => item.id === capability.sourceId);
  const relatedProjects = siteData.projects.filter((project) => project.capabilityIds.includes(capability.id));
  const relatedScenarios = siteData.scenarios.filter((scenario) => scenario.sharedCapabilities.includes(capability.id));
  return <div className="page-container"><PageIntro eyebrow="能力详情 · 解释性导览" title={capability.name} description={capability.summary}><TrackedLink className="button button-primary" href="/projects" event={{ name: 'next_step_select', from: 'capability_detail', target: 'project' }}>找一张项目体验卡 <span aria-hidden="true">→</span></TrackedLink><Link className="button button-secondary" href="/capabilities">回到 {siteData.capabilities.length} 类能力</Link></PageIntro>
    <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="为什么学" title={capability.why} /><div className="callout"><p><strong>典型任务：</strong>{capability.task}</p></div><SectionHeading eyebrow="课程证据" title="两个专业怎样形成这项能力" description="课程名称和关系只在对应培养方案版本下解释，不把单门课等同于岗位胜任。" /><div className="card-grid card-grid-2">{capability.majorEvidence.map((evidence) => <article className="side-card" key={evidence.majorId}><Badge tone={evidence.majorId.includes('biomedical') ? 'teal' : 'blue'}>{majorMap.get(evidence.majorId)?.shortName ?? '专业'}</Badge><h3 className="detail-card-heading course-heading">{evidence.course}</h3><p>这门/组课程提供与“{capability.task}”相关的观察或练习入口。</p></article>)}</div></div><aside className="side-panel"><div className="side-card"><strong>健康样例</strong><p>{capability.healthExample}</p></div><div className="side-card"><strong>跨行业样例</strong><p>{capability.transferExample}</p></div></aside></div></section>
    <section className="detail-block"><SectionHeading eyebrow="继续追问" title="进入场景时，哪些条件会改变？" /><div className="card-grid card-grid-2"><article className="transfer-box"><h3>共用方法</h3><p>{capability.healthExample}</p></article><article className="transfer-box"><h3>新增门槛</h3><p>{capability.transferExample}</p></article></div></section>
    <section className="detail-block"><SectionHeading eyebrow="下一步" title="把能力接到一个项目或场景" description="至少给出一个可继续走的相关入口；项目用于形成证据，场景用于理解新增门槛。" /><div className="card-grid card-grid-3">{relatedProjects.map((project) => <article className="side-card" key={project.id}><Badge tone="amber">项目</Badge><h3 className="detail-card-heading project-heading">{project.title}</h3><p>{project.expectedOutput}</p><TrackedLink className="text-link" href={`/projects/${project.slug}`} event={{ name: 'next_step_select', from: 'capability_detail', target: 'project' }}>打开体验卡 <span aria-hidden="true">→</span></TrackedLink></article>)}{relatedScenarios.slice(0, 3).map((scenario) => <article className="side-card" key={scenario.id}><Badge tone="teal">场景</Badge><h3 className="detail-card-heading project-heading">{scenario.name}</h3><p>{scenario.extraGate}</p><TrackedLink className="text-link" href={`/scenarios/${scenario.slug}`} event={{ name: 'next_step_select', from: 'capability_detail', target: 'scenario' }}>看场景门槛 <span aria-hidden="true">→</span></TrackedLink></article>)}</div></section>
    <section className="detail-block"><SourceLine source={source} label="能力与课程依据" /></section>
  </div>;
}
