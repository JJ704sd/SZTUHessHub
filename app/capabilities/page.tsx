import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { CapabilityCard, PageIntro, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '能力与课程',
  description: `浏览 ${siteData.capabilities.length} 类可迁移能力，以及专业、课程、工程任务与跨行业场景之间的关系。`,
  alternates: siteConfig.isProduction ? { canonical: '/capabilities' } : undefined,
};

export default function CapabilitiesPage() {
  return <div className="page-container"><PageIntro eyebrow="SKILL ATLAS / 课程之外，还能做什么" title={`${siteData.capabilities.length} 类能力，把“学什么”连接到“能做什么”`} description="处理信号、建立模型、设计系统……从一个想做的任务出发，找找相关课程，再看看同一套方法还能用在哪里。这里提供探索线索，不代表能力认证或岗位匹配。"><Link className="button button-primary" href="#capability-list">浏览 {siteData.capabilities.length} 类能力 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/projects">直接挑一个项目</Link></PageIntro>
    <section className="detail-block" id="capability-list"><SectionHeading eyebrow="CONNECT THE DOTS / 把知识连起来" title="你学过的知识，会在哪个问题里派上用场？" description="每类能力都有一份约 15 分钟的短练习：准备材料、试三步、留下一份记录，再对照自查。" /><div className="card-grid card-grid-4">{siteData.capabilities.map((capability, index) => <CapabilityCard key={capability.id} capability={capability} index={index} />)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="TAKE IT FURTHER / 换个场景试试" title="方法可以带走，新场景还要重新认识" /><div className="transfer-band"><div className="transfer-box"><h3>带上已有的基础</h3><p>理解问题、处理数据与信号、建模、设计、测试、协作——课程和实践会留下这些能力的部分证据。</p></div><div className="transfer-arrow" aria-hidden="true">→</div><div className="transfer-box"><h3>补上新场景的要求</h3><p>继续了解领域知识、数据特点、评价标准与工具，也要确认法规、安全和环境要求，用可复现的作品检验方法。</p></div></div></section>
    <section className="detail-block"><SectionHeading eyebrow="YOUR NEXT MOVE / 接着探索" title="把一个感兴趣的方向，变成下一步" /><div className="card-grid card-grid-3"><article className="side-card"><strong>回到课程里找线索</strong><p>看看两个 {siteConfig.currentCohort} 级培养方案怎样搭起基础，又各自侧重什么。</p><Link className="text-link" href="/majors">对照两个专业 <span aria-hidden="true">↗</span></Link></article><article className="side-card"><strong>去别的场景看看</strong><p>从医疗健康走向 AI、软件、电子、机器人或环境，看看还需要补什么。</p><Link className="text-link" href="/scenarios">打开场景地图 <span aria-hidden="true">↗</span></Link></article><article className="side-card"><strong>亲手做一个小成果</strong><p>看好时长、工具、数据许可和验证方法，就可以选一个合适的起点。</p><Link className="text-link" href="/projects">去挑一个项目 <span aria-hidden="true">↗</span></Link></article></div></section>
  </div>;
}
