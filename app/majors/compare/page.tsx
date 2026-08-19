import type { Metadata } from 'next';
import Link from 'next/link';
import { getMajorComparisonPageModel } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, PageIntro, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '两个专业怎样一起解决问题',
  description: '从共同工程基础、真实任务与协作接口，看懂智能医学工程和生物医学工程分别先做什么、怎样交接。',
  alternates: siteConfig.isProduction ? { canonical: '/majors/compare' } : undefined,
};

export default function MajorComparePage() {
  const model = getMajorComparisonPageModel();
  const majorLinks = model.majors.map((major) => ({ id: major.id, slug: major.slug }));
  return <div className="page-container">
    <PageIntro eyebrow={`两个专业 · ${siteConfig.currentCohort} 级课程依据`} title="面对同一道健康工程问题，两边会先做什么？" description="先看共同的工程基础，再看两种视角怎样拆任务、交付结果并接在一起。这不是难度排名，也不替你作选择。"><Link className="button button-primary" href="#dual-lens">看一次真实问题拆解 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/capabilities">再看 {model.capabilities.length} 类能力</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="先看共同点" title="两个专业都要把问题变成可验证的工程任务" description="共同学习数学与自然科学、生命健康、编程与电子、信号系统、实验研究和工程责任；差别从任务侧重开始。" /><FoundationTable majors={model.majors} /></section>
    <section className="detail-block"><SectionHeading eyebrow="再看任务侧重" title="同一目标，两边通常从哪里开始？" /><div className="transfer-band"><div className="transfer-box"><Badge tone="blue">{model.majors[0]?.shortName}</Badge><h3>从信息与智能系统侧拆解问题</h3><p>{model.majors[0]?.primaryFocus.join(' · ')}</p></div><div className="transfer-arrow" aria-hidden="true">↔</div><div className="transfer-box"><Badge tone="teal">{model.majors[1]?.shortName}</Badge><h3>从器械、材料与检测侧拆解问题</h3><p>{model.majors[1]?.primaryFocus.join(' · ')}</p></div></div><div className="callout"><p>同一项能力可以由不同课程证据形成。进入新场景时，还要补领域知识、工具链、评价方式与安全责任，HseeHub 不把“学过”写成“直接胜任”。</p></div></section>
    <section className="detail-block" id="dual-lens"><SectionHeading eyebrow="同一道题" title="分别做出什么，又在哪里交接？" description="从共同目标出发，再看两种视角的输入、输出和接口。" /><div className="dual-grid">{model.dualLensCases.map((item) => <DualLensCard key={item.id} item={item} majorLinks={majorLinks} />)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="接着验证" title="选一个你还想亲手确认的问题" /><div className="card-grid card-grid-3"><article className="side-card"><strong>想知道课程在形成什么</strong><p>按 {model.capabilities.length} 类能力查看课程证据、典型任务和场景差异。</p><ArrowLink href="/capabilities">浏览能力与课程</ArrowLink></article><article className="side-card"><strong>想做一个小成果</strong><p>先看时间、先修、工具、产物和数据许可，再决定是否打开外部资源。</p><ArrowLink href="/projects">挑一个小项目</ArrowLink></article><article className="side-card"><strong>想看应用边界</strong><p>比较医疗健康与非医疗场景的共用能力和额外门槛。</p><ArrowLink href="/scenarios">浏览发展场景</ArrowLink></article></div></section>
  </div>;
}
