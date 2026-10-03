import type { Metadata } from 'next';
import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { PageIntro, SectionHeading } from '@/components/site';

export const metadata: Metadata = {
  title: '关于 HseeHub',
  description: '给健康工程学生的探索空间：认识专业、动手实践，把好奇心变成自己的下一步。',
  alternates: siteConfig.isProduction ? { canonical: '/about' } : undefined,
};

export default function AboutPage() {
  return <div className="page-container"><PageIntro eyebrow="HELLO, HSEEHUB / 给好奇的你" title="让好奇心，有个开始的地方。" description="HseeHub 是给健康工程学生的探索空间。从两个专业的日常任务出发，把课程、能力和小项目连起来。你可以带着问题逛一逛，也可以选个起点，亲手做一点。" /><section className="detail-block"><SectionHeading eyebrow="MAKE IT YOURS / 按你的节奏来" title="先看一看，再试一试，最后留下点什么" /><div className="card-grid card-grid-3"><article className="side-card"><strong>认识两个专业</strong><p>用同一个工程问题，看看两个专业分别从哪里入手、怎样一起完成任务。</p></article><article className="side-card"><strong>挑个小项目</strong><p>{siteData.projects.length} 个项目都写清了时长、基础、预期成果与资源状态，方便你找到合适的起点。</p></article><article className="side-card"><strong>留下一份自己的记录</strong><p>记下问题、尝试、结果和还没解决的地方。下一次探索，就从这里接着走。</p></article></div></section><section className="detail-block"><SectionHeading eyebrow="READ THE NOTES / 开始前，了解这些" title="资料有出处，实践有边界" /><ul className="detail-list"><li>课程与学分请结合适用年级、来源和核验状态阅读；正式要求以学校当前文件为准。</li><li>能力与路径介绍帮助你认识方向，不作能力认证、医疗诊断或个人录取、就业资格判断。</li><li>项目提供步骤与资源，代码和模型需在自己的工具中运行；请勿使用真实患者数据。</li></ul></section><section className="detail-block"><SectionHeading eyebrow="LET'S BEGIN / 从这里出发" title="选一个让你想继续的问题" /><div className="hero-actions"><Link className="button button-primary" href="/majors/compare">先看两个专业 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/projects?intent=quick-look">挑一个小项目</Link><Link className="button button-secondary" href="/sources">查看来源与更新</Link></div></section></div>;
}
