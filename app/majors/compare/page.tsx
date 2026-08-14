import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, DualLensCard, MajorQuickCompare, PageIntro, SectionHeading } from '@/components/site';
import { TrackedLink } from '@/components/tracked-link';

export const metadata: Metadata = {
  title: '双专业对照',
  description: '比较智能医学工程与生物医学工程的共同底座、课程 DNA、同题双解与协作接口。',
  alternates: siteConfig.isProduction ? { canonical: '/majors/compare' } : undefined,
};

export default function MajorComparePage() {
  return <div className="page-container">
    <PageIntro eyebrow={`核心垂直切片 · ${siteConfig.currentCohort} 级`} title="共同底座之上，两种工程透镜怎样接在一起？" description="这不是难度排名，也不是替你选专业。它只把培养方案反映出的侧重翻译成学生能继续追问的课程、任务和协作接口。"><Link className="button button-secondary" href="#dual-lens">直接看同题双解 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/capabilities">再看 {siteData.capabilities.length} 类能力 <span aria-hidden="true">→</span></Link></PageIntro>
    <section className="compare-goals" aria-labelledby="compare-goals-title"><h2 id="compare-goals-title">5 分钟后你能回答</h2><ul className="goal-list"><li>两个专业有哪些共同底座？</li><li>每个专业更常从哪种工程侧重拆解问题？</li><li>一个同题项目里，输入、输出和接口如何交接？</li></ul></section>

    <section className="detail-block"><SectionHeading eyebrow="01 / 共同底座" title="先建立共同语言，再看两侧差异" description="两份方案都涉及数理自然科学、生命健康、编程与电子、信号系统、实验研究和工程责任；共同底座不是专业排名。" /><div className="foundation-chips">{siteData.majors[0]?.foundation.map((item) => <span key={item}>{item}</span>)}</div></section>

    <section className="detail-block"><SectionHeading eyebrow="02 / 侧重对照" title="用同一组字段看任务怎么变" description="相同字段、相同顺序和相同视觉权重；软件、电子、数据、材料与器械都可能跨专业协作。" /><div className="card-grid card-grid-2">{siteData.majors.map((major) => <MajorQuickCompare key={major.id} major={major} input={major.foundation.slice(0, 2).join('、')} task={major.focus.slice(0, 2).join('、')} output={major.courseEvidence[0]?.detail ?? major.summary} />)}</div><div className="callout"><p>学过某门课不等于已经掌握。进入新场景还要补领域知识、工具链、评价方式和安全责任。</p></div></section>

    <section className="detail-block" id="dual-lens"><SectionHeading eyebrow="03 / 同题双解" title="同一个问题，分别贡献什么，在哪里交接？" description="先看一个代表案例的输入、输出、接口、共同产物和验收；第二个案例保留在同一条阅读路径中。" /><div className="dual-grid">{siteData.dualLensCases.map((item, index) => index === 0 ? <DualLensCard key={item.id} item={item} /> : <details className="dual-case-disclosure" key={item.id}><summary>再看：{item.title}</summary><div className="dual-case-disclosure-body"><DualLensCard item={item} /></div></details>)}</div></section>

    <section className="detail-block compare-next"><SectionHeading eyebrow="04 / 下一步" title="把理解变成一个可以继续验证的小成果" description="主路径先挑一个项目；能力和场景是次级入口。" /><div className="next-step-rail"><TrackedLink className="button button-primary" href="/projects" event={{ name: 'next_step_select', from: 'compare', target: 'project' }}>挑一个项目 <span aria-hidden="true">→</span></TrackedLink><ArrowLink href="/capabilities">从课程进入能力地图</ArrowLink><ArrowLink href="/scenarios">看能力迁移到哪些场景</ArrowLink></div></section>
  </div>;
}
