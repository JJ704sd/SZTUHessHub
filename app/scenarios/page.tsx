import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { PageIntro, ScenarioCard, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '发展场景',
  description: '比较健康、AI、软件、电子物联、机器人制造与环境城市等场景的共用能力和新增门槛。',
  alternates: { canonical: '/scenarios' },
};

export default function ScenariosPage() {
  return <div className="page-container"><PageIntro eyebrow="能力迁移 · 场景不是岗位榜单" title="同一项能力，在不同问题里会遇到不同约束" description="从医疗健康出发，也可以看到 AI/数据、软件系统、电子物联、机器人/制造和环境/城市/公共技术。每张卡都同时说明共用能力与额外门槛。"><Link className="button button-primary" href="#scenario-list">浏览 {siteData.scenarios.length} 类场景 <span aria-hidden="true">↓</span></Link><Link className="button button-secondary" href="/capabilities">回到能力地图</Link></PageIntro>
    <section className="detail-block" id="scenario-list"><SectionHeading eyebrow="场景总览" title="不按行业热度排序，只按问题和能力关系来读" description="场景卡是学习导航，不是企业推荐、岗位保证或职业预测。" /><div className="card-grid card-grid-3">{siteData.scenarios.map((scenario, index) => <ScenarioCard key={scenario.id} scenario={scenario} index={index} />)}</div></section>
    <section className="detail-block"><div className="callout"><p><strong>迁移提醒：</strong>图像、传感、控制、数据和设计方法可以复用，但输入/输出、错误成本、评价方式、法规与环境责任会改变。看见“共用能力”后，要继续看“新增门槛”。</p></div></section>
  </div>;
}
