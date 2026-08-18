import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { PageIntro, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '关于本站',
  description: '了解 HseeHub 的首版定位、内容边界和后续扩展原则。',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <div className="page-container"><PageIntro eyebrow="关于 HseeHub · Release A" title="打开就能先做一点的健康工程探索桌面" description="HseeHub 不是学院宣传页、专业优劣排行榜、医疗建议站或招聘系统。它先把两个专业的共同底座、不同任务和协作接口讲清楚，再把课程连接到能力、项目和下一步。" /><section className="detail-block"><SectionHeading eyebrow="我们先做什么" title="先让你找到一个入口，再决定要不要继续" /><div className="card-grid card-grid-3"><article className="side-card"><strong>看懂专业</strong><p>用同一个工程问题比较两个专业会先处理什么。</p></article><article className="side-card"><strong>做个项目</strong><p>{siteData.projects.length} 张体验卡先写清时长、基础、产物、资源状态和停止条件。</p></article><article className="side-card"><strong>留下记录</strong><p>把问题、过程、结果和限制放在一份可复核的产物里，再按需要改写方向。</p></article></div></section><section className="detail-block"><SectionHeading eyebrow="Release A 不做什么" title="先不堆个人与社区功能" description="只有真实需求出现并有人维护时，才考虑下一阶段能力。" /><ul className="detail-list"><li>不做登录、个人中心、最近浏览、收藏、进度、社区、评论和投稿。</li><li>不做职位抓取、企业排名、薪资预测或个体资格结论。</li><li>不在站内执行任意代码、运行模型或接入真实患者数据。</li><li>不创建没有真实内容支撑的空路由，也不伪造学生引语或活跃数据。</li></ul></section><section className="detail-block"><SectionHeading eyebrow="从这里继续" title="回到探索主线" /><div className="hero-actions"><Link className="button button-primary" href="/majors/compare">先看两个专业 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/projects">挑一个小项目</Link><Link className="button button-secondary" href="/sources">查看来源与版本</Link></div></section></div>;
}
