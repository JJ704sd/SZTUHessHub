import Link from 'next/link';
import type { ReactNode } from 'react';
import { siteData, type Capability, type DualLensCase, type Major, type Project, type Scenario, type Source } from '@/lib/content';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { siteConfig } from '@/lib/site-config';

export function SectionHeading({ eyebrow, title, description, action, titleId }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; titleId?: string }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={titleId}>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

export function ArrowLink({ href, children, subtle = false }: { href: string; children: ReactNode; subtle?: boolean }) {
  return <Link className={subtle ? 'text-link subtle-link' : 'text-link'} href={href}>{children}<span aria-hidden="true">↗</span></Link>;
}

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'teal' | 'amber' | 'muted' | 'dark' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function SourceLine({ source, label = '来源' }: { source?: Source; label?: string }) {
  if (!source) return null;
  return (
    <div className="source-line">
      <span className="source-dot" aria-hidden="true" />
      <span>{label}：{source.title}</span>
      <span className="source-meta">{source.version} · 核验于 {source.lastVerified}{source.authorityTier ? ` · ${source.authorityTier} 级来源` : ''}</span>
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

export function DualLensCard({ item, majorMap }: { item: DualLensCase; majorMap: Map<string, Major> }) {
  const needsReview = item.reviewDueAt < new Date().toISOString().slice(0, 10);
  return (
    <article className="dual-card">
      <div className="card-topline"><Badge tone="amber">同题双解</Badge><span className="card-kicker">{item.sharedGoal}</span></div>
      <h3>{item.title}</h3>
      <p className="card-summary">{item.problem}</p>
      {needsReview ? <div className="review-notice" role="status"><strong>需要复核</strong><span>这条案例已过复核日期，开始引用前请重新核对来源与边界。</span></div> : null}
      <div className="lens-grid">
        {item.lenses.map((lens) => <div className="lens" key={lens.majorId}>
          <div className="lens-heading"><span className="lens-dot" aria-hidden="true" /><strong>{lens.label}</strong></div>
          <p>{lens.contribution}</p>
          <span className="lens-role">角色：{lens.role}</span>
          <dl className="lens-facts"><div><dt>输入</dt><dd>{lens.input}</dd></div><div><dt>输出</dt><dd>{lens.output}</dd></div><div><dt>接口</dt><dd>{lens.interface}</dd></div></dl>
        </div>)}
      </div>
      <div className="dual-footer"><div><span>共同产物：{item.sharedArtifact}</span><span>验收：{item.validation}</span><span>风险边界：{item.riskBoundary}</span></div><ArrowLink href={`/majors/compare#${item.slug}`}>查看接口与验收</ArrowLink></div>
    </article>
  );
}

export function CapabilityCard({ capability, index, majorMap }: { capability: Capability; index: number; majorMap: Map<string, Major> }) {
  return (
    <article className="capability-card">
      <div className="capability-number">0{index + 1}</div>
      <h3>{capability.name}</h3>
      <p>{capability.summary}</p>
      <div className="capability-task"><span>典型任务</span><strong>{capability.task}</strong></div>
      <div className="card-footer"><span>{capability.transferExample}</span><ArrowLink href={`/capabilities/${capability.slug}`}>看课程与场景</ArrowLink></div>
    </article>
  );
}

export function ProjectCapsuleCard({ project, majorMap }: { project: Project; majorMap: Map<string, Major> }) {
  const resourceState = getProjectResourceState(project);
  return (
    <article className="project-card">
      <div className="project-visual"><img src={project.preview.src} alt={project.preview.alt} width="560" height="360" /></div>
      <div className="project-content">
        <div className="card-topline"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><span className="card-kicker">{project.duration}</span></div>
        <h3>{project.title}</h3>
        <p className="project-card-line"><strong>适合谁</strong>{project.suitableFor}</p>
        <p className="project-card-line"><strong>会留下</strong>{project.expectedOutput}</p>
        <dl className="project-meta-grid"><div><dt>时长</dt><dd>{project.duration}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisites[0]}</dd></div><div><dt>资源</dt><dd className={`resource-state resource-state-${resourceState.key}`}><span aria-hidden="true">{resourceState.key === 'ready' ? '●' : resourceState.key === 'alternative' ? '↗' : '!'}</span>{resourceState.label}</dd></div></dl>
        <div className="card-footer"><span className={`resource-state resource-state-${resourceState.key}`} title={resourceState.description}>{resourceState.description}</span><ArrowLink href={`/projects/${project.slug}`}>看看怎么开始</ArrowLink></div>
      </div>
    </article>
  );
}

export function ScenarioCard({ scenario, index }: { scenario: Scenario; index: number }) {
  return (
    <article className="scenario-card">
      <div className="scenario-index">{String(index + 1).padStart(2, '0')}</div>
      <h3><Link href={`/scenarios/${scenario.slug}`}>{scenario.name}</Link></h3>
      <p>{scenario.summary}</p>
      <div className="scenario-bottom"><span>共用能力 {scenario.sharedCapabilities.length} 项</span><ArrowLink href={`/scenarios/${scenario.slug}`} subtle>看额外门槛</ArrowLink></div>
    </article>
  );
}

export function FAQList({ items }: { items: Array<{ id: string; question: string; answer: string; reviewDueAt?: string }> }) {
  const today = new Date().toISOString().slice(0, 10);
  return <div className="faq-list">{items.map((item, index) => <details className="faq-item" key={item.id} open={index === 0}><summary><span>{item.question}</span><span className="faq-toggle" aria-hidden="true">+</span></summary><div className="faq-answer">{item.reviewDueAt && item.reviewDueAt < today ? <div className="review-notice" role="status"><strong>需要复核</strong><span>这条回答已过复核日期，正式课程与通知请回到当前来源。</span></div> : null}<p>{item.answer}</p></div></details>)}</div>;
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

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="HseeHub 首页"><span className="brand-mark" aria-hidden="true">H</span><span className="brand-copy"><strong>HseeHub</strong><span>健康工程探索站</span></span></Link>
          <p>给健康工程学生的探索桌面：先看懂两个专业，试一个小项目，留下可复核的东西，再决定下一步。</p>
        </div>
        <div className="footer-col"><strong>从这里开始</strong><Link href="/majors/compare">5 分钟看懂两个专业</Link><Link href="/capabilities">{siteData.capabilities.length} 类可迁移能力</Link><Link href="/projects">今天先试一个项目</Link></div>
        <div className="footer-col"><strong>来源与边界</strong><Link href="/sources">来源、版本与核验</Link><Link href="/majors/faq">学生常问</Link><Link href="/about">关于本站</Link></div>
      </div>
      <div className="page-container footer-bottom"><span>默认内容版本：{siteConfig.currentCohort} 级 · 最近一次内容复核：{siteConfig.contentBaseline}</span><span>项目优先使用合成/公开数据；不处理真实患者数据</span></div>
    </footer>
  );
}
