import type { Metadata } from 'next';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { FAQList, PageIntro, SourceLine } from '@/components/site';

export const metadata: Metadata = {
  title: '学生常问',
  description: '用通俗语言回答两个专业的共同底座、差异、学习方式与跨行业能力迁移问题。',
  alternates: siteConfig.isProduction ? { canonical: '/majors/faq' } : undefined,
};

export default function MajorsFaqPage() {
  return <div className="page-container"><PageIntro eyebrow="学生常问 · 不替你做专业选择" title="把影响下一步的问题，先问清楚" description="答案以公开培养方案与学院资料为依据；如果你需要正式课程安排、学分或通知，请回到来源登记和学校正式入口。" /><section className="detail-block reading-column-narrow"><FAQList items={siteData.faqs} /><div className="source-block-spaced"><SourceLine source={siteData.sources.find((source) => source.id === siteData.faqs[0]?.sourceId)} label="FAQ 依据" /></div></section></div>;
}
