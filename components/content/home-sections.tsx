import Link from 'next/link';
import type { HomePageModel, ProjectCatalogItem } from '@/lib/content/view-models';
import { TrustLine } from '@/components/content/trust-line';
import { Badge, StatusBadge } from '@/components/ui/primitives';

export function HomeTaskLauncher({ model }: { model: HomePageModel }) {
  return <section className="home-launch" data-home-module="task-entry">
    <div className="page-container home-launch-inner">
      <div className="home-launch-copy">
        <p className="eyebrow">健康工程 · 双专业 × 跨行业</p>
        <h1>先看懂能做什么，再决定从哪里开始</h1>
        <p className="home-explanation">{model.explanatoryText}</p>
      </div>
      <nav className="task-grid" aria-label="学生任务入口">
        {model.tasks.map((task) => <Link className={task.isPrimary ? 'task-card task-card-primary' : 'task-card'} href={task.href} key={task.id}>
          <span className="task-icon" aria-hidden="true">{task.icon}</span>
          <span><strong>{task.label}</strong><small>{task.summary}</small></span>
          <span className="task-arrow" aria-hidden="true">→</span>
        </Link>)}
      </nav>
      <TrustLine label={model.trust.sourceLabel} href={model.trust.evidenceHref} factStatus={model.trust.claimStatus} />
      <p className="home-trust-boundary">{model.trust.cohort} 级内容 · {model.trust.boundary}</p>
    </div>
  </section>;
}

export function HomeMajorCompare({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-compare" data-home-module="quick-compare" id="home-compare">
    <div className="page-container">
      <SectionKicker number="01" label="30 秒专业对比" title="共同底座相同，工程侧重不同，也可以接在一起" action={{ href: '/majors', label: '进入专业对比' }} />
      <div className="foundation-strip" aria-label="共同底座">
        <span className="foundation-strip-label">共同底座</span>
        {model.sharedFoundation.map((item) => <span className="relation-chip" key={item}>{item}</span>)}
      </div>
      <div className="major-compare-list" aria-label="两个专业相同维度对比">
        {model.majors.map((major) => <div className="major-compare-row" key={major.id}>
          <div className="major-compare-heading"><Badge tone={major.id === 'major-ime' ? 'blue' : 'teal'}>{major.shortName}</Badge><h3>{major.name}</h3></div>
          <div className="major-compare-cell"><span>重点任务</span><strong>{major.primaryFocus.join('；')}</strong></div>
          <div className="major-compare-cell"><span>代表课程</span><strong>{major.representativeCourses.join('；')}</strong></div>
          <div className="major-compare-evidence">
            <TrustLine label="重点任务" factStatus={major.claims[0]?.status} href={major.claims[0]?.evidenceHref} evidenceLabel={major.claims[0]?.evidence[0]?.title} />
            <TrustLine label="代表课程" factStatus={major.claims[1]?.status} href={major.claims[1]?.evidenceHref} evidenceLabel={major.claims[1]?.evidence[0]?.title} />
          </div>
        </div>)}
      </div>
      <div className="collaboration-preview">
        <div><p className="eyebrow">协作接口</p><h3>{model.collaboration.title}</h3><p>{model.collaboration.summary}</p><span className="collaboration-artifact">共同产物：{model.collaboration.artifact}</span></div>
        <Link className="button button-secondary" href={`/majors#${model.collaboration.caseSlug}`}>查看输入与验收 <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </section>;
}

export function HomeProjectPreviews({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-projects" data-home-module="projects" id="home-projects">
    <div className="page-container">
      <SectionKicker number="02" label="今天先试一个" title="先看时长、基础、产出和状态，再打开外部工具" action={{ href: '/projects', label: '比较全部项目' }} />
      <div className="home-project-grid">{model.projects.map((project) => <HomeProjectPreview key={project.id} project={project} />)}</div>
    </div>
  </section>;
}

function HomeProjectPreview({ project }: { project: ProjectCatalogItem }) {
  const statusLabel = { available: '资源可用', degraded: '有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[project.resourceHealth.status];
  return <article className="home-project-card">
    <div className="home-project-visual"><img src={project.visualAsset.src} width={project.visualAsset.width} height={project.visualAsset.height} alt={project.visualAsset.alt} loading="lazy" /><span>{project.visualAsset.alt}</span></div>
    <div className="home-project-body">
      <div className="card-topline"><Badge tone={project.mode === 'cross-major' ? 'amber' : 'teal'}>{project.mode === 'cross-major' ? '双专业协作' : '单人体验'}</Badge><span className="card-kicker">{project.durationLabel}</span></div>
      <h3>{project.title}</h3><p>{project.cardSummary}</p>
      <div className="project-fact-line"><span>基础</span><strong>{project.prerequisiteSummary}</strong></div>
      <div className="project-fact-line"><span>产出</span><strong>{project.outputSummary}</strong></div>
      <div className="project-card-footer"><StatusBadge status={project.resourceHealth.status} label={statusLabel} /><Link className="text-link" href={`/projects/${project.slug}`}>查看体验卡 <span aria-hidden="true">↗</span></Link></div>
      <TrustLine label="外部资源" linkStatus={project.resourceHealth.status} href={`/projects/${project.slug}/resources`} />
    </div>
  </article>;
}

export function HomeExplore({ model }: { model: HomePageModel }) {
  return <section className="home-section home-section-explore" data-home-module="explore" id="home-explore">
    <div className="page-container">
      <SectionKicker number="03" label="能力、场景与核验" title="先用三条能力关系继续追问，再按场景核对边界" action={{ href: '/capabilities', label: '浏览能力地图' }} />
      <div className="capability-relation-list" aria-label="首页能力入口">
        {model.capabilities.map((capability, index) => <Link className="capability-relation-row" href={`/capabilities/${capability.slug}`} key={capability.id}>
          <span className="shortcut-number">{String(index + 1).padStart(2, '0')}</span>
          <strong>{capability.navigationLabel}</strong>
          <span>{capability.taskSummary}</span>
          <span className="relation-arrow" aria-hidden="true">↗</span>
        </Link>)}
      </div>
      <div className="scenario-link-list" aria-label="首页场景入口">
        {model.scenarios.map((scenario) => <Link className="scenario-link-row" href={`/scenarios/${scenario.slug}`} key={scenario.id}><strong>{scenario.navigationLabel}</strong><span>{scenario.taskSummary}</span><span aria-hidden="true">↗</span></Link>)}
      </div>
      <p className="home-faq-link">常见问题、课程版本和完整证据统一从 <Link className="text-link" href="/majors/faq">FAQ</Link> 与 <Link className="text-link" href="/sources">来源登记</Link> 进入。</p>
    </div>
  </section>;
}

function SectionKicker({ number, label, title, action }: { number: string; label: string; title: string; action: { href: string; label: string } }) {
  return <div className="home-section-heading"><div><p className="eyebrow">{number} / {label}</p><h2>{title}</h2></div><Link className="text-link" href={action.href}>{action.label} <span aria-hidden="true">↗</span></Link></div>;
}
