import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Capability, DualLensCase, Major, Project, Scenario, Source } from '@/lib/content/schema';
import { siteConfig } from '@/lib/site-config';
import { Badge } from '@/components/ui/primitives';

export { Badge } from '@/components/ui/primitives';

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

export function ArrowLink({ href, children, subtle = false }: { href: string; children: ReactNode; subtle?: boolean }) {
  const external = /^https?:\/\//i.test(href);
  return <Link className={subtle ? 'text-link subtle-link' : 'text-link'} href={href}>{children}<span aria-hidden="true">{external ? '↗' : '→'}</span></Link>;
}

export function SourceLine({ source, label = '来源' }: { source?: Source; label?: string }) {
  if (!source) return null;
  return (
    <div className="source-line">
      <span className="source-dot" aria-hidden="true" />
      <span>{label}：{source.title}</span>
      <span className="source-meta">{source.version} · {source.accessType === 'public_url' ? '公开入口' : '校内正式文件 · 无公开入口'} · 核验于 {source.lastVerified}</span>
    </div>
  );
}

export function StatStrip({ items }: { items: Array<{ value: string; label: string }> }) {
  return <div className="stat-strip">{items.map((item) => <div className="stat-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>;
}

export function MajorProfileCard({ major }: { major: Major }) {
  return (
    <article className={`major-card major-card-${major.slug}`}>
      <div className="card-topline"><Badge tone={major.slug.includes('biomedical') ? 'teal' : 'blue'}>{major.eyebrow}</Badge><span className="card-kicker">{siteConfig.currentCohort} 级 · {major.credits} 学分</span></div>
      <h3>{major.name}</h3>
      <p className="card-summary">{major.summary}</p>
      <div className="focus-list" aria-label={`${major.name}培养侧重`}>
        {major.focus.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
      </div>
      <div className="card-footer"><span>{major.creditNote}</span><ArrowLink href={`/majors/${major.slug}`}>看懂这个专业</ArrowLink></div>
    </article>
  );
}

export function DualLensCard({ item, majorLinks = [] }: { item: DualLensCase; majorLinks?: Array<{ id: string; slug: string }> }) {
  const majorSlugById = new Map(majorLinks.map((major) => [major.id, major.slug]));
  return (
    <article className="dual-card" id={item.slug}>
      <div className="card-topline"><Badge tone="amber">同题双解</Badge><span className="card-kicker">{item.sharedGoal}</span></div>
      <h3>{item.title}</h3>
      <p className="card-summary">{item.problem}</p>
      <div className="lens-grid">
        {item.lenses.map((lens) => <div className="lens" key={lens.majorId}>
          <div className="lens-heading"><span className="lens-dot" aria-hidden="true" />{majorSlugById.has(lens.majorId) ? <Link href={`/majors/${majorSlugById.get(lens.majorId)}`}>{lens.label}</Link> : <strong>{lens.label}</strong>}</div>
          <p>{lens.contribution}</p>
          <span className="lens-role">角色：{lens.role}</span>
          <details className="lens-disclosure"><summary>展开输入、输出与接口 <span aria-hidden="true">＋</span></summary><dl className="lens-facts"><div><dt>输入</dt><dd>{lens.input}</dd></div><div><dt>输出</dt><dd>{lens.output}</dd></div><div><dt>接口</dt><dd>{lens.interface}</dd></div></dl></details>
        </div>)}
      </div>
      <div className="dual-footer"><div><span>共同产物：{item.sharedArtifact}</span><span>验收：{item.validation}</span></div><details className="risk-disclosure"><summary>查看风险边界</summary><p>{item.riskBoundary}</p></details><ArrowLink href={`/majors#${item.slug}`}>查看接口与验收</ArrowLink></div>
    </article>
  );
}

export function CapabilityCard({ capability, index }: { capability: Capability; index: number }) {
  return (
    <article className="capability-card">
      <div className="capability-number">0{index + 1}</div>
      <h3><Link href={`/capabilities/${capability.slug}`}>{capability.navigationLabel}</Link></h3>
      <p>{capability.cardSummary}</p>
      <div className="capability-task"><span>典型任务</span><strong>{capability.taskSummary}</strong></div>
      <div className="card-footer"><span>课程证据、项目和场景</span><ArrowLink href={`/capabilities/${capability.slug}`}>看课程与场景</ArrowLink></div>
    </article>
  );
}

export function ProjectCapsuleCard({ project, majorLabels }: { project: Project; majorLabels: string[] }) {
  return (
    <article className="project-card">
      <div className="project-visual" aria-hidden="true"><span>{project.viewpoint.slice(0, 2)}</span><i /><i /><i /></div>
      <div className="project-content">
        <div className="card-topline"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><span className="card-kicker">{project.duration}</span></div>
        <h3>{project.title}</h3>
        <p className="card-summary">{project.summary}</p>
        <div className="tag-row">{majorLabels.map((label) => <Badge key={label} tone="muted">{label}</Badge>)}<Badge tone="muted">{project.viewpoint}</Badge></div>
        <div className="project-meta"><span>适合：{project.suitableFor}</span><span>产出：{project.expectedOutput}</span></div>
        <div className="card-footer"><span className="status-ready">● 可先看清成本与边界</span><ArrowLink href={`/projects/${project.slug}`}>打开体验卡</ArrowLink></div>
      </div>
    </article>
  );
}

export function ScenarioCard({ scenario, index, capabilityLinks = [] }: { scenario: Scenario; index: number; capabilityLinks?: Array<{ id: string; slug: string; name: string }> }) {
  return (
    <article className="scenario-card">
      <div className="scenario-index">{String(index + 1).padStart(2, '0')}</div>
      <h3><Link href={`/scenarios/${scenario.slug}`}>{scenario.name}</Link></h3>
      <p>{scenario.cardSummary}</p>
      <div className="scenario-boundary"><strong>可迁移</strong><span>{capabilityLinks.slice(0, 1).map((item) => <Link key={item.id} href={`/capabilities/${item.slug}`}>{item.name}</Link>)}</span><strong>需补门槛</strong><span>{scenario.taskSummary}</span></div>
      <div className="scenario-bottom"><span>共用能力 {scenario.sharedCapabilities.length} 项</span><ArrowLink href={`/scenarios/${scenario.slug}`} subtle>看额外门槛</ArrowLink></div>
    </article>
  );
}

export function FAQList({ items }: { items: Array<{ id: string; question: string; answer: string }> }) {
  return <div className="faq-list">{items.map((item, index) => <details className="faq-item" key={item.id} open={index === 0}><summary><span>{item.question}</span><span className="faq-toggle" aria-hidden="true">+</span></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}</div>;
}

export function FoundationTable({ majors }: { majors: Major[] }) {
  const rows = [
    ['共同底座', '数理自然科学、生命健康、编程电子、信号系统、实验研究与工程责任'],
    [majors[0]?.shortName ?? '专业 A', majors[0]?.foundation.join(' · ') ?? ''],
    [majors[1]?.shortName ?? '专业 B', majors[1]?.foundation.join(' · ') ?? ''],
    ['课程结构', `${majors[0]?.credits ?? '—'} / ${majors[1]?.credits ?? '—'} 学分；差异是侧重，不是难度排名`],
  ];
  return <div className="comparison-table-wrap"><table className="comparison-table"><caption className="sr-only">两个专业共同底座与培养侧重对照</caption><thead><tr><th scope="col">先看什么</th><th scope="col">{siteConfig.currentCohort} 级导览</th></tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>;
}

export function LearningStory({ major }: { major: Major }) {
  return <ol className="learning-story">{major.learningStory.map((step, index) => <li key={step.stage}><span className="story-index">{index + 1}</span><div><span className="story-stage">{step.stage}</span><h3>{step.title}</h3><p>{step.summary}</p></div></li>)}</ol>;
}

export function TextEquivalentList({ capabilities }: { capabilities: Capability[] }) {
  return <ol className="text-equivalent-list">{capabilities.map((capability) => <li key={capability.id}><Link href={`/capabilities/${capability.slug}`}><strong>{capability.name}</strong><span>{capability.task}</span></Link></li>)}</ol>;
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro-description">{description}</p>{children ? <div className="page-intro-actions">{children}</div> : null}</section>;
}

export function FilterPill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={active ? 'filter-pill is-active' : 'filter-pill'}>{children}</span>;
}

export function SiteFooter({ capabilityCount = 8 }: { capabilityCount?: number }) {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="HseeHub 首页"><span className="brand-mark" aria-hidden="true">H</span><span className="brand-copy"><strong>HseeHub</strong><span>健康工程探索站</span></span></Link>
          <p>帮助学生看懂同院两个工程专业的共同底座、不同侧重和跨行业能力。内容是解释性导览，不替代正式培养方案或教务通知。</p>
        </div>
        <div className="footer-col"><strong>从这里开始</strong><Link href="/majors">5 分钟看懂两个专业</Link><Link href="/capabilities">{capabilityCount} 类可迁移能力</Link><Link href="/projects">今天先试一个项目</Link></div>
        <div className="footer-col"><strong>内容边界</strong><Link href="/sources">来源与版本</Link><Link href="/majors/faq">学生常问</Link><Link href="/about">关于本站</Link></div>
      </div>
      <div className="page-container footer-bottom"><span>默认内容版本：{siteConfig.currentCohort} 级 · 首版只读公开浏览</span><span>医疗内容仅供专业学习，不构成医疗建议</span></div>
    </footer>
  );
}
