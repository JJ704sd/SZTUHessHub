import type { Metadata } from 'next';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { PageIntro, SectionHeading, SourceLine } from '@/components/site';

export const metadata: Metadata = {
  title: '来源与版本',
  description: '查看 HseeHub 首版培养方案、学院介绍与项目来源的版本、范围和最后核验时间。',
  alternates: { canonical: '/sources' },
};

export default function SourcesPage() {
  return <div className="page-container"><PageIntro eyebrow="内容事实源 · 可追溯" title="先说人话，再把依据放在这里" description="HseeHub 首版内容以 Git 管理的版本化内容为事实源。课程、学分、模块、能力、场景和项目都保留来源、适用范围和最后核验时间。" /><section className="detail-block"><SectionHeading eyebrow="当前登记" title="每个来源都说明它支持什么" /><div className="source-list">{siteData.sources.map((source) => <article className="source-card" id={source.id} key={source.id}><div><h3>{source.title}</h3><p>{source.scope} · {source.version} · {source.accessScope} · 最后核验：{source.lastVerified}</p><p><span className="badge badge-muted">{source.kind}</span></p></div>{source.accessType === 'public_url' && source.url ? <a className="text-link" href={source.url} target="_blank" rel="noreferrer" aria-label={`打开来源：${source.title}`}>打开{source.title} <span aria-hidden="true">↗</span></a> : <span className="source-meta">校内正式文件 · 无公开入口</span>}</article>)}</div></section><section className="detail-block"><SectionHeading eyebrow="版本边界" title={`${siteConfig.currentCohort} 是当前主叙事，旧版本不覆盖它`} /><div className="callout"><p>首版默认展示两个 {siteConfig.currentCohort} 级培养方案；历史版本只有在准备好准确内容后才从独立入口开放。正式课程安排、学分与教务通知以学校当年发布为准。</p></div><SourceLine source={siteData.sources[0]} label="内容登记" /></section></div>;
}
