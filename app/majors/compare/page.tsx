import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, FoundationTable, PageIntro, SectionHeading } from '@/components/site';
import { TrackedLink } from '@/components/tracked-link';

export const metadata: Metadata = {
  title: '双专业对照',
  description: '比较智能医学工程与生物医学工程的共同底座、课程 DNA、同题双解与协作接口。',
  alternates: siteConfig.isProduction ? { canonical: '/majors/compare' } : undefined,
};

export default function MajorComparePage() {
  const majorLinks = siteData.majors.map((major) => ({ id: major.id, slug: major.slug }));
  return <div className="page-container">
    <PageIntro eyebrow={`核心垂直切片 · ${siteConfig.currentCohort} 级`} title="共同底座之上，两种工程透镜怎样接在一起？" description="这不是难度排名，也不是替你选专业。它只把培养方案反映出的侧重翻译成学生能继续追问的课程、任务和协作接口。"><Link className="button button-primary" href="#dual-lens">直接看同题双解 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/capabilities">再看 {siteData.capabilities.length} 类能力</Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="01 / 共同底座" title="两个专业都需要把问题变成可验证的工程任务" description="共同学习数学与自然科学、生命健康、编程与电子、信号系统、实验研究和工程责任；差别从任务侧重开始。" /><FoundationTable majors={siteData.majors} /></section>
    <section className="detail-block"><SectionHeading eyebrow="02 / 侧重对照" title="看任务怎么变，不看标签谁更强" /><div className="transfer-band"><div className="transfer-box"><Badge tone="blue">智能医学工程</Badge><h3>从信息与智能系统侧拆解问题</h3><p>{siteData.majors[0]?.focus.join(' · ')}</p></div><div className="transfer-arrow" aria-hidden="true">↔</div><div className="transfer-box"><Badge tone="teal">生物医学工程</Badge><h3>从器械、材料与检测侧拆解问题</h3><p>{siteData.majors[1]?.focus.join(' · ')}</p></div></div><div className="callout"><p>同一项能力可以由不同课程证据形成。进入新场景时，还要补领域知识、工具链、评价方式与安全责任，HseeHub 不把“学过”写成“直接胜任”。</p></div></section>
    <section className="detail-block" id="dual-lens"><SectionHeading eyebrow="03 / 同题双解" title="同一问题，分别贡献什么，在哪里交接？" description="先看一个代表案例；第二个案例保留在同一阅读路径中，可按需展开。" /><div className="dual-grid">{siteData.dualLensCases.map((item, index) => index === 0 ? <DualLensCard key={item.id} item={item} majorLinks={majorLinks} /> : <details className="dual-case-disclosure" key={item.id}><summary>再看：{item.title}</summary><div className="dual-case-disclosure-body"><DualLensCard item={item} majorLinks={majorLinks} /></div></details>)}</div></section>
    <section className="detail-block compare-next"><SectionHeading eyebrow="04 / 下一步" title="把理解变成一个可以继续验证的小成果" description="主路径先挑一个项目；能力和场景是次级入口。" /><div className="next-step-rail"><TrackedLink className="button button-primary" href="/projects" event={{ name: 'next_step_select', from: 'compare', target: 'project' }}>挑一个项目 <span aria-hidden="true">→</span></TrackedLink><ArrowLink href="/capabilities">从课程进入能力地图</ArrowLink><ArrowLink href="/scenarios">看能力迁移到哪些场景</ArrowLink></div></section>
  </div>;
}
