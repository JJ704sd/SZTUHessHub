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
      <PageIntro eyebrow="MAJOR MAP / 两个专业，两种视角" title="两个专业每天会处理什么问题？" description="同一个健康问题，可以从数据与算法切入，也可以从设备与系统动手。看看两个专业分别做什么，又怎样一起把想法做出来。"><Link className="button button-primary" href="/majors/compare">看同一道题怎么分工 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/majors/faq">你可能也想问</Link></PageIntro>

      <section className="section-quiet section-first"><div className="card-grid card-grid-2">{model.majors.map((major) => <MajorProfileCard key={major.id} major={major} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="SHARED BASE / 一起打底" title="从相近的基础，长出不同的侧重" description={`两个专业都不只学软件或硬件。先看看 ${siteConfig.currentCohort} 级培养方案中的共同基础，再认识各自更常面对的任务。`} /><FoundationTable majors={model.majors} /><TrustLine label="共同基础的依据" factStatus={model.claims.sharedFoundation.status} href={model.claims.sharedFoundation.evidenceHref} /></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="OPEN THE NOTES / 翻翻依据" title="这些介绍，从哪里来？" description="专业侧重、课程与学分都附有来源。是否已经核验，请看每条内容旁的状态。" /><div className="evidence-lines">{model.claims.majors.map((claims) => { const major = model.majors.find((item) => item.id === claims.majorId); return <div className="evidence-line-group" key={claims.majorId}><strong>{major?.shortName}</strong><TrustLine label="重点任务" factStatus={claims.focusTask.status} href={claims.focusTask.evidenceHref} evidenceLabel={claims.focusTask.evidence[0]?.title} /><TrustLine label="代表课程组" factStatus={claims.representativeCourseGroup.status} href={claims.representativeCourseGroup.evidenceHref} evidenceLabel={claims.representativeCourseGroup.evidence[0]?.title} /><TrustLine label="总学分" factStatus={claims.totalCredits.status} href={claims.totalCredits.evidenceHref} evidenceLabel={claims.totalCredits.evidence[0]?.title} /></div>; })}</div></section>

      <section className="section-quiet section-spaced" id="dual-lens"><SectionHeading eyebrow="TWO LENSES / 同题开工" title="两种视角怎样接成一个完整项目？" description="从一个共同问题出发，看看各自先动哪一块、交接什么，最后怎样确认做成了。" /><div className="dual-grid">{model.dualLensCases.map((item) => <div id={item.slug} key={item.id}><DualLensCard item={item} majorLinks={majorLinks} /></div>)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="KEEP EXPLORING / 把兴趣接到课程" title="哪条学习线，让你想继续往下看？" /><div className="card-grid card-grid-2">{model.majors.map((major) => <article className="side-card" key={major.id}><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{major.shortName}</Badge><h3 className="card-heading-compact">{major.name}的四年学习故事</h3><p>{major.learningStory[0]?.summary}</p><ArrowLink href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>看看 {siteConfig.currentCohort} 级都学什么</ArrowLink></article>)}</div></section>

      <section className="section-quiet section-last"><SourceLine source={model.source} label="主要依据" /></section>
    </div>
  );
}
