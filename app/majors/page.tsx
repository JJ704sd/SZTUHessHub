import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, MajorProfileCard, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export const metadata: Metadata = {
  title: '学院与专业',
  description: '认识健康与环境工程学院的两个工程专业，比较共同底座、课程侧重与协作关系。',
  alternates: { canonical: '/majors' },
};

export default function MajorsPage() {
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  return (
    <div className="page-container">
      <PageIntro eyebrow={`两个专业 · ${siteConfig.currentCohort} 级课程依据`} title="两个专业每天会处理什么问题？" description="它们都面对生命健康问题，也共享工程基础。真正值得比较的，是更常从哪一侧拆解任务、会做出什么，以及怎样在同一个项目里交接。"><Link className="button button-primary" href="/majors/compare">看同一道题怎么分工 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/majors/faq">先看常见问题</Link></PageIntro>

      <section className="section-quiet section-first"><div className="card-grid card-grid-2">{siteData.majors.map((major) => <MajorProfileCard key={major.id} major={major} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="共同底座" title="差异是侧重，不是“纯软件 / 纯硬件”的二选一" description={`先看两份 ${siteConfig.currentCohort} 级培养方案共同支撑的工程基础，再打开各自的课程 DNA。`} /><FoundationTable majors={siteData.majors} /></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="同一道题" title="两种视角怎样接成一个完整项目？" description="从共同问题出发，再看各自先处理什么、交付什么，以及在哪里共同验收。" /><div className="dual-grid">{siteData.dualLensCases.map((item) => <DualLensCard key={item.id} item={item} majorMap={majorMap} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="再看具体课程" title="哪条学习线更像你愿意继续做的事？" /><div className="card-grid card-grid-2">{siteData.majors.map((major) => <article className="side-card" key={major.id}><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{major.shortName}</Badge><h3 className="card-heading-compact">{major.name}的四年学习故事</h3><p>{major.learningStory[0]?.summary}</p><ArrowLink href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>查看 {siteConfig.currentCohort} 级课程入口</ArrowLink></article>)}</div></section>

      <section className="section-quiet section-last"><SourceLine source={siteData.sources.find((source) => source.id === siteData.majors[0]?.sourceId)} label="主要依据" /></section>
    </div>
  );
}
