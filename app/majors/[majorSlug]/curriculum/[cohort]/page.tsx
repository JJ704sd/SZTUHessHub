import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export function generateStaticParams() { return siteData.majors.map((major) => ({ majorSlug: major.slug, cohort: siteConfig.currentCohort })); }

export function generateMetadata({ params }: { params: { majorSlug: string; cohort: string } }): Metadata {
  const major = siteData.majors.find((item) => item.slug === params.majorSlug);
  return { title: `${major?.shortName ?? '专业'} · ${params.cohort} 级课程入口`, description: 'HseeHub 版本化培养方案导览', alternates: { canonical: `/majors/${params.majorSlug}/curriculum/${params.cohort}` } };
}

export default function CurriculumPage({ params }: { params: { majorSlug: string; cohort: string } }) {
  const major = siteData.majors.find((item) => item.slug === params.majorSlug);
  if (!major || params.cohort !== siteConfig.currentCohort) notFound();
  const source = siteData.sources.find((item) => item.id === major.sourceId);
  const capabilityMap = new Map(siteData.capabilities.map((capability) => [capability.id, capability]));
  return <div className="page-container"><PageIntro eyebrow={`${major.shortName} · 版本快照`} title={`${params.cohort} 级培养方案导览`} description={`${major.name}的课程、选修和实践入口。这里是解释性导览，不替代学校正式培养方案、教务通知或选课系统。`}><Link className="button button-secondary" href={`/majors/${major.slug}`}>回到专业介绍</Link><Link className="button button-secondary" href="/sources">查看来源版本</Link></PageIntro>
    <section className="detail-block"><div className="card-grid card-grid-3"><article className="side-card"><span className="eyebrow">总学分</span><strong className="metric-value">{major.credits}</strong><p>{major.creditNote}</p></article><article className="side-card"><span className="eyebrow">选修入口</span><strong className="metric-value">{major.electives.length}</strong><p>类能力模块/选修指引，按正式版本理解。</p></article><article className="side-card"><span className="eyebrow">实践叙事</span><strong className="metric-value">{major.learningStory.length}</strong><p>从基础、方法、协作到作品证据的学习故事。</p></article></div></section>
    <section className="detail-block"><SectionHeading eyebrow="课程 DNA" title="课程为什么会连接到这些能力" description="先看课程证据，再打开能力与任务关系；不要把课程名孤立地当作专业结论。" /><div className="card-grid card-grid-3">{major.courseEvidence.map((evidence) => <article className="side-card" key={evidence.course}><div className="tag-row">{evidence.capabilityIds.slice(0, 2).map((id) => <Badge key={id} tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{capabilityMap.get(id)?.shortName ?? id}</Badge>)}</div><h3 className="detail-card-heading course-heading">{evidence.course}</h3><p>{evidence.detail}</p></article>)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="选修与实践" title="从模块走向你想验证的任务" /><div className="card-grid card-grid-2">{major.electives.map((item) => <article className="side-card" key={item}><strong>{item}</strong><p>从这里进入能力、项目或跨行业场景，确认还要补的领域门槛。</p><ArrowLink href="/capabilities">看能力地图</ArrowLink></article>)}</div></section>
    <section className="detail-block"><div className="callout"><p><strong>版本提示：</strong>当前主叙事默认 {siteConfig.currentCohort} 级；旧年级不覆盖当前版本，未来如需查看历史版本会从单独入口进入。</p></div><SourceLine source={source} label="培养方案来源" /></section>
  </div>;
}
