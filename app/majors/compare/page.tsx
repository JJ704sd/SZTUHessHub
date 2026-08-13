import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, PageIntro, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '双专业对照',
  description: '比较智能医学工程与生物医学工程的共同底座、课程 DNA、同题双解与协作接口。',
  alternates: { canonical: '/majors/compare' },
};

export default function MajorComparePage() {
  const majorLinks = siteData.majors.map((major) => ({ id: major.id, slug: major.slug }));
  return <div className="page-container">
    <PageIntro eyebrow={`核心垂直切片 · ${siteConfig.currentCohort} 级`} title="共同底座之上，两种工程透镜怎样接在一起？" description="这不是难度排名，也不是替你选专业。它只把培养方案反映出的侧重翻译成学生能继续追问的课程、任务和协作接口。"><Link className="button button-primary" href="#dual-lens">直接看同题双解 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/capabilities">再看 {siteData.capabilities.length} 类能力</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="01 / 共同底座" title="两个专业都需要把问题变成可验证的工程任务" description="共同学习数学与自然科学、生命健康、编程与电子、信号系统、实验研究和工程责任；差别从任务侧重开始。" /><FoundationTable majors={siteData.majors} /></section>
    <section className="detail-block"><SectionHeading eyebrow="02 / 侧重对照" title="看任务怎么变，不看标签谁更强" /><div className="transfer-band"><div className="transfer-box"><Badge tone="blue">智能医学工程</Badge><h3>从信息与智能系统侧拆解问题</h3><p>{siteData.majors[0]?.focus.join(' · ')}</p></div><div className="transfer-arrow" aria-hidden="true">↔</div><div className="transfer-box"><Badge tone="teal">生物医学工程</Badge><h3>从器械、材料与检测侧拆解问题</h3><p>{siteData.majors[1]?.focus.join(' · ')}</p></div></div><div className="callout"><p>同一项能力可以由不同课程证据形成。进入新场景时，还要补领域知识、工具链、评价方式与安全责任，HseeHub 不把“学过”写成“直接胜任”。</p></div></section>
    <section className="detail-block" id="dual-lens"><SectionHeading eyebrow="03 / 同题双解" title="同一问题，分别贡献什么，在哪里交接？" description="先看共同目标，再看两种视角的输入、输出和接口。" /><div className="dual-grid">{siteData.dualLensCases.map((item) => <DualLensCard key={item.id} item={item} majorLinks={majorLinks} />)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="04 / 下一步" title="从对照进入你想继续验证的方向" /><div className="card-grid card-grid-3"><article className="side-card"><strong>想知道课程在形成什么</strong><p>按 {siteData.capabilities.length} 类能力查看课程证据、典型任务和场景差异。</p><ArrowLink href="/capabilities">浏览能力与课程</ArrowLink></article><article className="side-card"><strong>想做一个小成果</strong><p>先看时间、先修、工具、产物和数据许可，再决定是否打开外部资源。</p><ArrowLink href="/projects">挑一张体验卡</ArrowLink></article><article className="side-card"><strong>想看应用边界</strong><p>比较医疗健康与非医疗场景的共用能力和额外门槛。</p><ArrowLink href="/scenarios">浏览发展场景</ArrowLink></article></div></section>
  </div>;
}
