import type { Metadata } from 'next';
import { contentClaims, siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { PageIntro, SectionHeading, SourceLine } from '@/components/site';

const claimTypeLabels = { official: '官方事实', translated: '译述判断', example: '示例说明' } as const;
const reviewStatusLabels = { draft: '待复核', reviewed: '已复核', expired: '已过期' } as const;

export const metadata: Metadata = {
  title: '来源与版本',
  description: '查看 HseeHub 首版培养方案、学院介绍与项目来源的版本、范围和最后核验时间。',
  alternates: siteConfig.isProduction ? { canonical: '/sources' } : undefined,
};

export default function SourcesPage() {
  return <div className="page-container">
    <PageIntro eyebrow="内容事实源 · 可追溯" title="先说人话，再把依据放在这里" description="HseeHub 首版内容以 Git 管理的版本化内容为事实源。课程、学分、模块、能力、场景和项目都保留来源、适用范围和最后核验时间。" />
    <section className="detail-block"><SectionHeading eyebrow="当前登记" title="每个来源都说明它支持什么" /><div className="source-list">{siteData.sources.map((source) => <article className="source-card" key={source.id}><div><h3>{source.title}</h3><p>{source.scope} · {source.version} · 最后核验：{source.lastVerified}</p><p><span className="badge badge-muted">{source.kind}</span></p></div><a className="text-link" href={source.url} target="_blank" rel="noreferrer">打开来源 <span aria-hidden="true">↗</span></a></article>)}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="关键事实登记" title="官方事实、译述判断与示例分开标注" description="每条登记保留来源、owner 和下一次复核期限；待确认字段会明确显示，不用占位信息伪装成已审核。" /><div className="claim-list">{contentClaims.map((claim) => { const source = siteData.sources.find((item) => item.id === claim.sourceId); return <article className="claim-row" key={claim.id}><div><strong>{claimTypeLabels[claim.claimType]}</strong><span>{claim.id}</span><span>{source?.title ?? claim.sourceId}{claim.sourceLocator ? ` · ${claim.sourceLocator}` : ''}</span></div><div><span className="badge badge-muted">{reviewStatusLabels[claim.reviewStatus]}</span><span>owner：{claim.ownerId}</span><span>复核截止：{claim.reviewDueAt}</span><span>{claim.reviewedAt ? `reviewedAt：${claim.reviewedAt}` : 'reviewedAt：待登记'}</span></div></article>; })}</div></section>
    <section className="detail-block"><SectionHeading eyebrow="版本边界" title={`${siteConfig.currentCohort} 是当前主叙事，旧版本不覆盖它`} /><div className="callout"><p>首版默认展示两个 {siteConfig.currentCohort} 级培养方案；历史版本只有在准备好准确内容后才从独立入口开放。正式课程安排、学分与教务通知以学校当年发布为准。</p></div><SourceLine source={siteData.sources[0]} label="内容登记" /></section>
  </div>;
}
