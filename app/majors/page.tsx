import type { Metadata } from 'next';
import Link from 'next/link';
import { getMajorsPageModel } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, MajorProfileCard, PageIntro, SectionHeading, SourceLine } from '@/components/site';
import { TrustLine } from '@/components/content/trust-line';

export const metadata: Metadata = {
  title: '学院与专业',
  description: '认识健康与环境工程学院的两个工程专业，比较共同底座、课程侧重与协作关系。',
  alternates: siteConfig.isProduction ? { canonical: '/majors' } : undefined,
};

export default function MajorsPage() {
  const model = getMajorsPageModel();
  const majorLinks = model.majors.map((major) => ({ id: major.id, slug: major.slug }));
  return (
    <div className="page-container">
      <PageIntro eyebrow={`两个专业 · ${siteConfig.currentCohort} 级课程依据`} title="两个专业每天会处理什么问题？" description="它们都面对生命健康问题，也共享工程基础。真正值得比较的，是更常从哪一侧拆解任务、会做出什么，以及怎样在同一个项目里交接。"><Link className="button button-primary" href="/majors/compare">看同一道题怎么分工 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/majors/faq">先看常见问题</Link></PageIntro>

      <section className="section-quiet section-first"><div className="card-grid card-grid-2">{model.majors.map((major) => <MajorProfileCard key={major.id} major={major} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="共同底座" title="差异是侧重，不是“纯软件 / 纯硬件”的二选一" description={`先看两份 ${siteConfig.currentCohort} 级培养方案共同支撑的工程基础，再打开各自的课程 DNA。`} /><FoundationTable majors={model.majors} /><TrustLine label="共同底座事实" factStatus={model.claims.sharedFoundation.status} href={model.claims.sharedFoundation.evidenceHref} /></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="事实入口" title="每个结论都能回到登记来源" description="以下入口把专业侧重、代表课程组和学分与具体 EvidenceRef 分开标注；来源可访问不等于事实自动可信。" /><div className="evidence-lines">{model.claims.majors.map((claims) => { const major = model.majors.find((item) => item.id === claims.majorId); return <div className="evidence-line-group" key={claims.majorId}><strong>{major?.shortName}</strong><TrustLine label="重点任务" factStatus={claims.focusTask.status} href={claims.focusTask.evidenceHref} evidenceLabel={claims.focusTask.evidence[0]?.title} /><TrustLine label="代表课程组" factStatus={claims.representativeCourseGroup.status} href={claims.representativeCourseGroup.evidenceHref} evidenceLabel={claims.representativeCourseGroup.evidence[0]?.title} /><TrustLine label="总学分" factStatus={claims.totalCredits.status} href={claims.totalCredits.evidenceHref} evidenceLabel={claims.totalCredits.evidence[0]?.title} /></div>; })}</div></section>

      <section className="section-quiet section-spaced" id="dual-lens"><SectionHeading eyebrow="同一道题" title="两种视角怎样接成一个完整项目？" description="从共同问题出发，再看各自先处理什么、交付什么，以及在哪里共同验收。" /><div className="dual-grid">{model.dualLensCases.map((item) => <div id={item.slug} key={item.id}><DualLensCard item={item} majorLinks={majorLinks} /></div>)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="再看具体课程" title="哪条学习线更像你愿意继续做的事？" /><div className="card-grid card-grid-2">{model.majors.map((major) => <article className="side-card" key={major.id}><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{major.shortName}</Badge><h3 className="card-heading-compact">{major.name}的四年学习故事</h3><p>{major.learningStory[0]?.summary}</p><ArrowLink href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>查看 {siteConfig.currentCohort} 级课程入口</ArrowLink></article>)}</div></section>

      <section className="section-quiet section-last"><SourceLine source={model.source} label="主要依据" /></section>
    </div>
  );
}
