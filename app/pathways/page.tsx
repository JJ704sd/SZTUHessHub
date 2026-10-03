import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SectionHeading } from '@/components/site';
import { getHomePageModel } from '@/lib/content/view-models';

export const metadata: Metadata = {
  title: '选下一步',
  description: '比较几条可能的路：日常任务、15 分钟动作和一个需要继续核对的门槛。',
  alternates: { canonical: '/pathways' },
};

export default function PathwaysPage() {
  const model = getHomePageModel();
  return <div className="pathway-overview-page">
    <div className="page-container"><PageIntro eyebrow="WHAT'S NEXT / 下一步，边走边想" title="你可能在想的几条路" description="未来太大，先给自己 15 分钟。看看一条路每天在做什么，试一个小动作，再决定要不要继续了解。"><Link className="button button-primary" href="/pathways/explore">我还没想好，先做双路径实验 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/pathways/employment#career-resources">找就业与实习资源 <span aria-hidden="true">↗</span></Link></PageIntro>{model.editorialReviewDue ? <div className="review-notice"><strong>内容待复核</strong><span>部分方向资料已到复核日期，行动前请再核对详情中的官方来源。</span><Link className="text-link" href="/sources">查看来源 ↗</Link></div> : null}</div>
    <section className="section pathway-overview-cards"><div className="page-container"><SectionHeading eyebrow="TRY A DIRECTION / 给好奇心一次试跑" title="看日常、试一步、找差距" description="先用这些线索认识方向。资格、录取与就业条件，请继续查看详情和官方说明。" /><div className="pathway-overview-grid">{model.pathways.map((pathway) => <article className={`pathway-overview-card pathway-kind-${pathway.kind}`} key={pathway.id}><div className="pathway-overview-card-top"><span className="pathway-kind-label">{pathway.title}</span><span className="pathway-overview-index" aria-hidden="true">↳</span></div><h2>{pathway.question}</h2><dl><div><dt>平常在做什么</dt><dd>{pathway.dailyTask}</dd></div><div><dt>15 分钟先试</dt><dd>{pathway.defaultAction.title}</dd></div><div><dt>通常还要补什么</dt><dd>{pathway.additionalGate}</dd></div></dl><Link className="text-link" href={pathway.href}>往这条路多走一步 <span aria-hidden="true">↗</span></Link></article>)}</div></div></section>
    <section className="section pathway-overview-next"><div className="page-container"><div className="callout"><p><strong>还没想好，也很好。</strong>从两条路各试一个小动作，记下过程和感受，看看自己更想继续哪一件事。</p><Link className="text-link" href="/pathways/explore">打开双路径实验 <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
