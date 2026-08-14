import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageIntro, SectionHeading } from '@/components/site';
import { StarterWorksheet } from '@/components/starter-worksheet';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

const starterSlug = 'signal-feature-notebook';

export function generateStaticParams() { return [{ projectSlug: starterSlug }]; }

export function generateMetadata({ params }: { params: { projectSlug: string } }): Metadata {
  return { title: 'signal-feature-notebook · 10 分钟 starter', description: '无需账号、零安装的合成信号 starter。', alternates: siteConfig.isProduction ? { canonical: `/projects/${params.projectSlug}/starter` } : undefined };
}

function makeSignalPoints() {
  return Array.from({ length: 48 }, (_, index) => {
    const x = 8 + index * 8.6;
    const y = 68 - (Math.sin(index / 3) * 16 + Math.sin(index / 1.7) * 4 + (index % 7 === 0 ? 5 : 0));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export default function SignalFeatureStarterPage({ params }: { params: { projectSlug: string } }) {
  const project = siteData.projects.find((item) => item.slug === params.projectSlug);
  if (!project || project.slug !== starterSlug) notFound();
  const points = makeSignalPoints();
  return <div className="page-container starter-page"><PageIntro eyebrow="signal-feature-notebook · v0.1.0" title="两分钟看到第一条合成信号" description="新浏览器、无账号、零安装。先观察一条由站内生成的合成曲线，再用三行文字记录你的判断；这不是医学数据，也不是诊断工具。"><Link className="button button-secondary" href={`/projects/${project.slug}/resources`}>回到资源页 <span aria-hidden="true">→</span></Link></PageIntro>
    <section className="detail-block"><SectionHeading eyebrow="00–02 分钟 · 第一条有效操作" title="先读曲线，再说出一个观察" description="这张图已经用固定的合成信号参数生成。请找出一个高低变化或噪声位置，并把它写进下面的观察框。" /><figure className="starter-chart"><svg viewBox="0 0 420 86" role="img" aria-labelledby="signal-chart-title signal-chart-description"><title id="signal-chart-title">合成信号曲线</title><desc id="signal-chart-description">一条带有周期变化和轻微噪声的合成时序信号。</desc><line className="chart-axis" x1="8" y1="68" x2="412" y2="68" /><polyline className="chart-line" points={points} fill="none" /></svg><figcaption>固定示例：synthetic-signal-a · 不含个人或健康信息 · 可直接截图保存</figcaption></figure><div className="starter-first-action"><strong>第一条有效操作：</strong>写下“我在曲线上看到……”并指出一个位置或变化。</div></section>
    <section className="detail-block"><SectionHeading eyebrow="02–10 分钟 · 最小产出" title="把观察变成可复核的三行记录" description="保存一张曲线截图和三行观察：信号形状、一个特征变化、一个不能外推的结论。" /><StarterWorksheet projectId={project.id} /></section>
    <section className="detail-block"><div className="callout"><p><strong>安全边界：</strong>本 starter 只练习合成信号的观察、特征和局限记录；不要上传真实患者数据，也不要把一次图形或指标解释成医学结论。</p></div></section>
  </div>;
}
