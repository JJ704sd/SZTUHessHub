import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, LearningStory, PageIntro, SectionHeading, SourceLine } from '@/components/site';

export function generateStaticParams() { return siteData.majors.map((major) => ({ majorSlug: major.slug })); }

type MajorDetailProps = { params: Promise<{ majorSlug: string }> };

export async function generateMetadata({ params }: MajorDetailProps): Promise<Metadata> {
  const { majorSlug } = await params;
  const major = siteData.majors.find((item) => item.slug === majorSlug);
  return { title: major?.name ?? '专业介绍', description: major?.summary ?? 'HseeHub 双专业通俗导览', alternates: siteConfig.isProduction ? { canonical: `/majors/${majorSlug}` } : undefined };
}

export default async function MajorDetailPage({ params }: MajorDetailProps) {
  const { majorSlug } = await params;
  const major = siteData.majors.find((item) => item.slug === majorSlug);
  if (!major) notFound();
  const source = siteData.sources.find((item) => item.id === major.sourceId);
  const relatedCapabilities = siteData.capabilities.filter((capability) => capability.majorEvidence.some((evidence) => evidence.majorId === major.id));
  const relatedProjects = siteData.projects.filter((project) => project.majorIds.includes(major.id));
  return <div className="page-container"><PageIntro eyebrow={`${major.eyebrow} · ${siteConfig.currentCohort} 级 · ${major.credits} 学分`} title={major.name} description={major.summary}><Link className="button button-primary" href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>看 {siteConfig.currentCohort} 级课程入口 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/majors">回到双专业对照</Link></PageIntro>
    <section className="detail-block"><div className="detail-layout"><div className="reading-column"><SectionHeading eyebrow="你会从哪些任务侧理解它" title="培养侧重" description="这些标签是培养方案的解释性摘要，不是封闭的职业边界。" /><div className="card-grid card-grid-3">{major.focus.map((item) => <article className="side-card" key={item}><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>侧重</Badge><h3 className="detail-card-heading">{item}</h3><p>继续连接到课程证据、能力和工程任务，而不是停在专业名称。</p></article>)}</div><div className="callout section-gap-top"><p>{major.creditNote} 课程与学分必须结合适用年级和正式版本理解，不用于推断难度或专业优劣。</p></div></div><aside className="side-panel"><div className="side-card"><strong>版本快照</strong><p>适用培养年级：{major.cohort}<br />总学分：{major.credits}<br />当前主叙事：{siteConfig.currentCohort} 级</p><ArrowLink href={`/majors/${major.slug}/curriculum/${siteConfig.currentCohort}`}>打开课程入口</ArrowLink></div><div className="side-card"><strong>继续浏览</strong><p>按能力查看它与另一专业的课程证据和项目连接。</p><ArrowLink href="/capabilities">进入能力地图</ArrowLink></div></aside></div></section>
    <section className="detail-block"><SectionHeading eyebrow="四年学习故事" title="从共同基础，走向能够解释和验证的工程任务" /><LearningStory major={major} /></section>
    <section className="detail-block"><SectionHeading eyebrow="关系导航" title="从专业进入能力和项目" description="这些是与当前专业直接登记的关系，不是岗位推荐或综合排名。" /><div className="card-grid card-grid-2"><article className="side-card"><strong>相关能力</strong><div className="relation-list">{relatedCapabilities.slice(0, 5).map((capability) => <Link key={capability.id} href={`/capabilities/${capability.slug}`}>{capability.name}</Link>)}</div></article><article className="side-card"><strong>相关项目</strong><div className="relation-list">{relatedProjects.map((project) => <Link key={project.id} href={`/projects/${project.slug}`}>{project.title}</Link>)}</div></article></div></section>
    <section className="detail-block"><SectionHeading eyebrow="选修与实践" title="把正式模块放回能力形成的语境里" description="模块名称以版本化内容为准；它们是能力探索入口，不是网站替代的选课决定。" /><div className="card-grid card-grid-3">{major.electives.map((item) => <article className="side-card" key={item}><strong>{item}</strong><p>建议继续查看对应课程、能力和项目，确认自己还需要补什么。</p></article>)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="来源" title="这页的事实从哪里来" /><SourceLine source={source} label="专业与培养方案" /></section>
  </div>;
}
