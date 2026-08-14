import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { CapabilityCard, PageIntro, SectionHeading, TextEquivalentList } from '@/components/site';

export const metadata: Metadata = {
  title: '能力与课程',
  description: `浏览 ${siteData.capabilities.length} 类可迁移能力，以及专业、课程、工程任务与跨行业场景之间的关系。`,
  alternates: siteConfig.isProduction ? { canonical: '/capabilities' } : undefined,
};

export default function CapabilitiesPage() {
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  return <div className="page-container"><PageIntro eyebrow="能力地图 · 课程只是起点" title={`${siteData.capabilities.length} 类能力，把“学什么”连接到“能做什么”`} description="每类能力都给出两个专业的课程证据、典型工程任务、健康样例和跨行业样例。它们是解释性导览，不代表已经掌握，也不作岗位匹配。"><Link className="button button-primary" href="#capability-list">浏览 {siteData.capabilities.length} 类能力 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/projects">直接挑一个项目</Link></PageIntro>
    <section className="detail-block" id="capability-list"><SectionHeading eyebrow="主干关系" title="专业版本 → 课程 → 能力 → 工程任务 → 场景" description="用文字列表保留关系图等价信息；按任一节点继续跳转，不让你停在孤立标签上。" /><div className="card-grid card-grid-4">{siteData.capabilities.map((capability, index) => <CapabilityCard key={capability.id} capability={capability} index={index} majorMap={majorMap} />)}</div><TextEquivalentList capabilities={siteData.capabilities} /></section>
    <section className="detail-block"><SectionHeading eyebrow="迁移要诚实" title="同一方法可以迁移，但约束不会自动消失" /><div className="transfer-band"><div className="transfer-box"><h3>我已有的基础</h3><p>课程和实践提供问题理解、数据/信号处理、建模、设计、测试或工程协作的部分证据。</p></div><div className="transfer-arrow" aria-hidden="true">→</div><div className="transfer-box"><h3>目标场景还要补什么</h3><p>领域知识、数据分布、评价标准、工具链、法规/安全、环境影响与可复现的作品证据。</p></div></div></section>
    <section className="detail-block"><SectionHeading eyebrow="继续浏览" title="从能力回到课程或项目" /><div className="card-grid card-grid-3"><article className="side-card"><strong>按专业查看证据</strong><p>比较两个 {siteConfig.currentCohort} 级方案如何形成相近或不同的能力侧重。</p><Link className="text-link" href="/majors/compare">进入双专业对照 <span aria-hidden="true">→</span></Link></article><article className="side-card"><strong>按场景看差异</strong><p>比较医疗健康与 AI、软件、电子、机器人、环境等场景的新增门槛。</p><Link className="text-link" href="/scenarios">进入场景地图 <span aria-hidden="true">→</span></Link></article><article className="side-card"><strong>用项目形成证据</strong><p>先看预计时长、工具、数据许可、产物和验证方法，再决定下一步。</p><Link className="text-link" href="/projects">进入项目探索 <span aria-hidden="true">→</span></Link></article></div></section>
  </div>;
}
