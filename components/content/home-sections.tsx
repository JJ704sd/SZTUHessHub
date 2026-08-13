import Link from 'next/link';
import type { HomePageModel, ProjectCatalogItem } from '@/lib/content/view-models';
import { Badge, StatusBadge } from '@/components/ui/primitives';

export function HomeTaskLauncher({ model }: { model: HomePageModel }) {
  return <section className="home-launch">
    <div className="page-container home-launch-inner">
      <div className="home-launch-copy"><p className="eyebrow">健康工程 · 双专业 × 跨行业</p><h1>先看懂能做什么，再决定从哪里开始</h1><p className="home-explanation">{model.explanatoryText}</p></div>
      <div className="task-grid" aria-label="学生任务入口">{model.tasks.map((task, index) => <Link className={index === 0 ? 'task-card task-card-primary' : 'task-card'} href={task.href} key={task.id}><span className="task-icon" aria-hidden="true">{task.icon}</span><span><strong>{task.label}</strong><small>{task.summary}</small></span><span className="task-arrow" aria-hidden="true">→</span></Link>)}</div>
      <p className="home-trust"><span>{model.trust.cohort} 级内容</span><span>{model.trust.sourceLabel}</span><span>{model.trust.boundary}</span></p>
    </div>
  </section>;
}

export function HomeMajorCompare({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-compare" id="home-compare"><div className="page-container"><SectionKicker number="01" label="双专业一屏对照" title="共同底座相同，工程侧重不同，也可以接在一起" action={{ href: '/majors/compare', label: '进入完整对照' }} />
    <div className="foundation-strip"><span className="foundation-strip-label">共同底座</span>{model.sharedFoundation.map((item) => <span className="relation-chip" key={item}>{item}</span>)}</div>
    <div className="home-major-grid">{model.majors.map((major, index) => <article className="home-major-card" key={major.id}><div className="card-topline"><Badge tone={index === 0 ? 'blue' : 'teal'}>{major.navigationLabel}</Badge><span className="card-kicker">{major.shortName}</span></div><h3>{major.name}</h3><p>{major.cardSummary}</p><ul className="compact-list">{major.focus.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul><Link className="text-link" href={`/majors/${major.slug}`}>查看专业侧重 <span aria-hidden="true">↗</span></Link></article>)}</div>
    <div className="collaboration-preview"><div><p className="eyebrow">精选协作接口</p><h3>{model.collaboration.title}</h3><p>{model.collaboration.summary}</p><span className="collaboration-artifact">共同产物：{model.collaboration.artifact}</span></div><Link className="button button-secondary" href={`/majors/compare#${model.collaboration.caseSlug}`}>查看输入与验收 <span aria-hidden="true">→</span></Link></div>
  </div></section>;
}

export function HomeCapabilityShortcuts({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-capabilities" id="home-capabilities"><div className="page-container"><SectionKicker number="02" label="能力捷径" title="课程证据 → 可证明的能力 → 项目/场景" action={{ href: '/capabilities', label: '浏览全部能力' }} /><div className="capability-shortcut-grid">{model.capabilities.map((capability, index) => <Link className="capability-shortcut" href={`/capabilities/${capability.slug}`} key={capability.id}><span className="shortcut-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{capability.navigationLabel}</strong><small>{capability.taskSummary}</small></span><span aria-hidden="true">↗</span></Link>)}</div></div></section>;
}

export function HomeProjectPreviews({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-projects" id="home-projects"><div className="page-container"><SectionKicker number="03" label="今天先试一个" title="先看时长、基础、产出和状态，再打开外部工具" action={{ href: '/projects', label: '比较全部体验卡' }} /><div className="home-project-grid">{model.projects.map((project) => <HomeProjectPreview key={project.id} project={project} />)}</div></div></section>;
}

function HomeProjectPreview({ project }: { project: ProjectCatalogItem }) {
  const statusLabel = { available: '资源可用', degraded: '有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[project.resourceHealth.status];
  return <article className="home-project-card"><div className="home-project-visual"><img src={project.visualAsset.src} width={project.visualAsset.width} height={project.visualAsset.height} alt={project.visualAsset.alt} loading="lazy" /><span>{project.visualAsset.alt}</span></div><div className="home-project-body"><div className="card-topline"><Badge tone={project.mode === 'cross-major' ? 'amber' : 'teal'}>{project.mode === 'cross-major' ? '双专业协作' : '单人体验'}</Badge><span className="card-kicker">{project.durationLabel}</span></div><h3>{project.title}</h3><p>{project.cardSummary}</p><div className="project-fact-line"><span>基础</span><strong>{project.prerequisiteSummary}</strong></div><div className="project-fact-line"><span>产出</span><strong>{project.outputSummary}</strong></div><div className="project-card-footer"><StatusBadge status={project.resourceHealth.status} label={statusLabel} /><Link className="text-link" href={`/projects/${project.slug}`}>查看体验卡 <span aria-hidden="true">↗</span></Link></div></div></article>;
}

export function HomeExplore({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-explore" id="home-explore"><div className="page-container"><SectionKicker number="04" label="场景与继续探索" title="同一项能力，换个场景就会遇到新的门槛" action={{ href: '/scenarios', label: '浏览发展场景' }} /><div className="scenario-shortcut-grid">{model.scenarios.map((scenario) => <Link className="scenario-shortcut" href={`/scenarios/${scenario.slug}`} key={scenario.id}><strong>{scenario.navigationLabel}</strong><span>{scenario.taskSummary}</span><span aria-hidden="true">↗</span></Link>)}</div><div className="home-explore-footer"><details className="home-faq"><summary>{model.faq.question}<span aria-hidden="true">＋</span></summary><p>先进入 FAQ 查看通俗解释、版本依据和安全边界。</p></details><Link className="text-link" href="/sources">查看来源与版本 <span aria-hidden="true">↗</span></Link></div></div></section>;
}

function SectionKicker({ number, label, title, action }: { number: string; label: string; title: string; action: { href: string; label: string } }) {
  return <div className="home-section-heading"><div><p className="eyebrow">{number} / {label}</p><h2>{title}</h2></div><Link className="text-link" href={action.href}>{action.label} <span aria-hidden="true">↗</span></Link></div>;
}
