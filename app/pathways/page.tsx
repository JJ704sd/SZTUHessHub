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
    <div className="page-container"><PageIntro eyebrow="选下一步" title="你可能在想的几条路" description="先不比较哪条更好，只看每条路平常在解决什么问题、15 分钟能试什么，以及通常还要补什么。完整行动和需要确认的条件放在详情里。"><Link className="button button-primary" href="/pathways/explore">我还没想好，先做双路径实验 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/projects">先回到项目</Link></PageIntro></div>
    <section className="section pathway-overview-cards"><div className="page-container"><SectionHeading eyebrow="先看任务，再看门槛" title="每条路只先比较三件事" description="这些卡是导航摘要，不替你判断资格、录取、就业或其他结果。要下结论时，请回到详情和官方入口。" /><div className="pathway-overview-grid">{model.pathways.map((pathway) => <article className={`pathway-overview-card pathway-kind-${pathway.kind}`} key={pathway.id}><div className="pathway-overview-card-top"><span className="pathway-kind-label">{pathway.title}</span><span className="pathway-overview-index" aria-hidden="true">↳</span></div><h2>{pathway.question}</h2><dl><div><dt>平常在做什么</dt><dd>{pathway.dailyTask}</dd></div><div><dt>15 分钟先试</dt><dd>{pathway.defaultAction.title}</dd></div><div><dt>通常还要补什么</dt><dd>{pathway.additionalGate}</dd></div></dl><Link className="text-link" href={pathway.href}>进入这条路的详情 <span aria-hidden="true">↗</span></Link></article>)}</div></div></section>
    <section className="section pathway-overview-next"><div className="page-container"><div className="callout"><p><strong>还没想好：</strong>不必先选定一条。可以从两条路各做一个小动作，再用项目记录比较自己愿意继续什么。</p><Link className="text-link" href="/pathways/explore">打开双路径实验 <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
