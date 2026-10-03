import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PathwayDetailSections } from '@/components/content/pathway-sections';
import { CareerResources } from '@/components/content/career-resources';
import { CareerApplication, CareerEvidence, CareerJourney, CareerRoles } from '@/components/content/career-guide';
import { getCareerGuide } from '@/lib/content/career-guide';
import careerStyles from '@/components/content/career-guide.module.css';
import { PageIntro } from '@/components/site';
import { getPathwayBySlug } from '@/lib/content/repository';
import { getPathwayDetailModel } from '@/lib/content/view-models';

const labels = {
  employment: '做工程相关工作',
  'domestic-postgraduate': '继续读研',
  'public-service': '公共服务',
  'overseas-study': '海外继续学习',
  'independent-work': '独立项目与服务',
} as const;

export function generateStaticParams() {
  return ['employment', 'domestic-postgraduate', 'public-service', 'overseas-study', 'independent-work'].map((pathwaySlug) => ({ pathwaySlug }));
}

type PathwayDetailProps = { params: Promise<{ pathwaySlug: string }> };

export async function generateMetadata({ params }: PathwayDetailProps): Promise<Metadata> {
  const { pathwaySlug } = await params;
  const pathway = getPathwayBySlug(pathwaySlug);
  if (pathway?.kind === 'employment') return { title: '就业实习与求职准备', description: '从岗位理解、能力与作品，到实习入口、简历面试和求职复盘，比较医工、软件与 AI 的准备方向。', alternates: { canonical: '/pathways/employment' } };
  return { title: pathway?.title ?? '发展路径', description: pathway?.summary ?? 'HseeHub 发展路径详情', alternates: { canonical: `/pathways/${pathwaySlug}` } };
}

export default async function PathwayDetailPage({ params }: PathwayDetailProps) {
  const { pathwaySlug } = await params;
  const pathway = getPathwayBySlug(pathwaySlug);
  if (!pathway) notFound();
  const model = getPathwayDetailModel(pathway);
  const needsReview = pathway.reviewDueAt < new Date().toISOString().slice(0, 10);
  if (pathway.kind === 'employment') {
    const guide = getCareerGuide();
    return <div className="page-container pathway-detail-page pathway-kind-employment">
      <PageIntro eyebrow="CAREER / 医工、软件与 AI" title="就业实习，按自己的节奏来。" description="还在找方向，或者已经准备投递，都可以从这里接着走。把想做的任务、手里的作品和下一步行动连起来。"><Link className="button button-primary" href="#career-roles">看岗位与准备方向 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="#career-resources">找就业与实习资源 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/pathways">回到五类路径</Link></PageIntro>
      <CareerJourney guide={guide} />
      <CareerRoles guide={guide} />
      <CareerEvidence guide={guide} />
      <CareerResources catalog={pathway.resourceCatalog} />
      <CareerApplication guide={guide} />
      <details id="pathway-actions" className={careerStyles.legacy}><summary>继续查看四档行动与路径依据</summary>
        {needsReview ? <div className="review-notice" role="status"><strong>路径说明需要复核</strong><span>下方既有路径说明已到复核日期，涉及资格、入口和时间的信息请以当前官方页面为准。</span></div> : null}
        <PathwayDetailSections pathway={model.pathway} capabilities={model.capabilities} projects={model.projects} scenarios={model.scenarios} transformations={model.transformations} evidence={model.evidence} />
      </details>
    </div>;
  }
  return <div className={`page-container pathway-detail-page pathway-kind-${pathway.kind}`}>
    <PageIntro eyebrow={`发展路径 · ${labels[pathway.kind]}`} title={pathway.title} description={pathway.question}><Link className="button button-primary" href="#pathway-actions">先看最小行动 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/pathways">回到五类路径</Link></PageIntro>
    {needsReview ? <div className="review-notice" role="status"><strong>需要复核</strong><span>这条路径已过复核日期，涉及资格、入口和时间的信息请以当前官方页面为准。</span></div> : null}
    <div id="pathway-actions"><PathwayDetailSections pathway={model.pathway} capabilities={model.capabilities} projects={model.projects} scenarios={model.scenarios} transformations={model.transformations} evidence={model.evidence} /></div>
  </div>;
}
