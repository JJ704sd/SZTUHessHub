import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, MajorProfileCard, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export const metadata: Metadata = {
  title: '学院与专业',
  description: '认识健康与环境工程学院的两个工程专业，比较共同底座、课程侧重与协作关系。',
  alternates: siteConfig.isProduction ? { canonical: '/majors' } : undefined,
};

export default function MajorsPage() {
  const majorLinks = siteData.majors.map((major) => ({ id: major.id, slug: major.slug }));
  return (
    <div className="page-container">
      <PageIntro eyebrow={`学院与双专业 · 默认 ${siteConfig.currentCohort} 级`} title="先把两个专业放在同一张工程地图上" description="它们都在健康与环境工程学院，都要面对生命健康问题；区别在于更常从哪一侧拆解问题、形成什么能力，以及怎样在项目里协作。"><Link className="button button-primary" href="/majors/compare">进入双专业对照 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/majors/faq">先看学生常问</Link></PageIntro>

      <section className="section-quiet section-first"><div className="card-grid card-grid-2">{siteData.majors.map((major) => <MajorProfileCard key={major.id} major={major} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="共同底座" title="差异是侧重，不是“纯软件 / 纯硬件”的二选一" description={`先看两份 ${siteConfig.currentCohort} 级培养方案共同支撑的工程基础，再打开各自的课程 DNA。`} /><FoundationTable majors={siteData.majors} /></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="同题双解" title="把两种视角放在一个协作接口里" description="每个案例都明确角色、输入、输出和共同验收结果。" /><div className="dual-grid">{siteData.dualLensCases.map((item) => <DualLensCard key={item.id} item={item} majorLinks={majorLinks} />)}</div></section>

      <section className="section-quiet section-spaced"><SectionHeading eyebrow="继续走" title="从一个专业入口，跳到课程、能力和项目" /><div className="card-grid card-grid-2">{siteData.majors.map((major) => <article className="side-card" key={major.id}><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{major.shortName}</Badge><h3 className="card-heading-compact">{major.name}的四年学习故事</h3><p>{major.learningStory[0]?.summary}</p><ArrowLink href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>查看 {siteConfig.currentCohort} 级课程入口</ArrowLink></article>)}</div></section>

      <section className="section-quiet section-last"><SourceLine source={siteData.sources.find((source) => source.id === siteData.majors[0]?.sourceId)} label="主要依据" /></section>
    </div>
  );
}
