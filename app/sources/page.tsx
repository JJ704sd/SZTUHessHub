import type { Metadata } from 'next';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { PageIntro, SectionHeading, SourceLine } from '@/components/site';
import claims from '@/content/claims.json';

export const metadata: Metadata = {
  title: '来源与版本',
  description: '查看 HseeHub 首版培养方案、学院介绍与项目来源的版本、范围和最后核验时间。',
  alternates: siteConfig.isProduction ? { canonical: '/sources' } : undefined,
};

export default function SourcesPage() {
  return <div className="page-container"><PageIntro eyebrow="内容事实源 · 可追溯" title="先说人话，再把依据放在这里" description="HseeHub 首版内容以 Git 管理的版本化内容为事实源。课程、学分、模块、能力、场景和项目都保留来源、适用范围和最后核验时间。" /><section className="detail-block"><SectionHeading eyebrow="当前登记" title="每个来源都说明它支持什么" /><div className="source-list">{siteData.sources.map((source) => <article className="source-card" key={source.id}><div><h3>{source.title}</h3><p>{source.scope} · {source.version} · 最后核验：{source.lastVerified}</p><p><span className="badge badge-muted">{source.kind}</span></p></div><a className="text-link" href={source.url} target="_blank" rel="noreferrer" aria-label={`打开来源：${source.title}`}>打开{source.title} <span aria-hidden="true">↗</span></a></article>)}</div></section><section className="detail-block"><SectionHeading eyebrow="P0 claim 登记" title="关键事实的来源、owner 与复核状态单独可见" description="draft 不等于已复核；在 owner 和复核证据补齐前，不把它当作生产发布通过。" /><div className="claim-list">{claims.map((claim) => <article className="claim-row" key={claim.id}><div><strong>{claim.text}</strong><span>{claim.claimType} · sourceId：{claim.sourceId} · {claim.sourceLocator}</span></div><span className="claim-status">{claim.reviewStatus} · owner：{claim.ownerId} · reviewedAt：待登记</span></article>)}</div></section><section className="detail-block"><SectionHeading eyebrow="版本边界" title={`${siteConfig.currentCohort} 是当前主叙事，旧版本不覆盖它`} /><div className="callout"><p>首版默认展示两个 {siteConfig.currentCohort} 级培养方案；历史版本只有在准备好准确内容后才从独立入口开放。正式课程安排、学分与教务通知以学校当年发布为准。</p></div><SourceLine source={siteData.sources[0]} label="内容登记" /></section></div>;
}
