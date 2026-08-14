import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { PageIntro, SectionHeading } from '@/components/site';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '关于本站',
  description: '了解 HseeHub 的首版定位、内容边界和后续扩展原则。',
  alternates: siteConfig.isProduction ? { canonical: '/about' } : undefined,
};

export default function AboutPage() {
  return <div className="page-container"><PageIntro eyebrow="关于 HseeHub · 首版" title="一张帮助学生继续追问的工程地图" description="HseeHub 不是学院宣传页、专业优劣排行榜、医疗建议站或招聘系统。它先把两个工程专业的共同底座、不同侧重和协作关系讲清楚，再把课程连接到能力、任务、项目和场景。" /><section className="detail-block"><SectionHeading eyebrow="我们先做什么" title="让学生在 5 分钟内看懂两个专业，在 10 分钟内找到一个可以尝试的小项目" /><div className="card-grid card-grid-3"><article className="side-card"><strong>看懂专业</strong><p>共同底座、课程 DNA、选修模块和四年学习故事。</p></article><article className="side-card"><strong>理解迁移</strong><p>{siteData.capabilities.length} 类可迁移能力，连接健康与非健康场景的不同约束。</p></article><article className="side-card"><strong>形成证据</strong><p>{siteData.projects.length} 张体验卡，先看成本、数据许可、产物与边界，再打开外部工具。</p></article></div></section><section className="detail-block"><SectionHeading eyebrow="首版不做什么" title="不提前堆后台功能" description="只有真实需求出现并有人维护时，才考虑下一阶段能力。" /><ul className="detail-list"><li>不做登录、个人中心、收藏、进度、社区、评论和投稿。</li><li>不做职位抓取、企业排名、薪资预测或专业选择结论。</li><li>不在站内执行任意代码、运行模型或接入真实患者数据。</li><li>不创建没有真实内容支撑的空路由。</li></ul></section><section className="detail-block"><SectionHeading eyebrow="从这里继续" title="回到内容主线" /><div className="hero-actions"><Link className="button button-primary" href="/majors/compare">先看双专业对照 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/sources">查看来源与版本</Link></div></section></div>;
}
