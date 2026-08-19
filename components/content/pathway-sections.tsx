import Link from 'next/link';
import type { Capability, Project, Scenario } from '@/lib/content';
import type { PathwayEvidenceView } from '@/lib/content/repository';
import type { EvidenceTransformation, Pathway, PathwayAction, PathwayKind } from '@/lib/content/schema';
import type { HomePageModel, PathwayActionView, PathwaySummaryView } from '@/lib/content/view-models';

const kindLabels: Record<PathwayKind, string> = {
  employment: '做工程相关工作',
  'domestic-postgraduate': '继续读研',
  'public-service': '公共服务',
  'overseas-study': '海外继续学习',
  'independent-work': '独立项目与服务',
};

const factStatusLabels = {
  verified: '事实已登记',
  review_due: '事实待复核',
  disputed: '事实有争议',
  unverified: '事实待核验',
} as const;

const linkStatusLabels = {
  available: '入口可用',
  degraded: '入口降级',
  unavailable: '入口不可用',
  unverified: '入口待核验',
} as const;

const horizonLabels: Record<PathwayAction['horizon'], string> = {
  '15-minutes': '15 分钟看懂',
  '7-days': '7 天试路',
  '30-days': '30 天做证据',
  semester: '一学期复盘',
};

export function StartModeLaunchpad({ model }: { model: HomePageModel }) {
  return (
    <section className="pathway-home-module pathway-home-launch" data-home-module="start-mode" aria-labelledby="home-start-title">
      <div className="page-container">
        <div className="pathway-launch-copy">
          <p className="eyebrow">发展选择启动台 · 不用一次决定</p>
          <h1 id="home-start-title">下一步很多，先从你手里的线索开始。</h1>
          <p>选一种开始方式，把已有能力、待补门槛和最小行动摆到一起。</p>
        </div>
        <div className="start-mode-list" aria-label="三种开始方式">
          {model.startModes.map((mode, index) => (
            <Link className={`start-mode-card start-mode-card-${index + 1}`} href={mode.href} key={mode.id}>
              <span className="start-mode-index" aria-hidden="true">0{index + 1}</span>
              <span className="start-mode-content"><strong>{mode.label}</strong><span>{mode.summary}</span></span>
              <span className="start-mode-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <Link className="pathway-secondary-entry" href="/majors/compare">我还在选专业？先回到双专业对照 <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

export function PathwayPicker({ pathways, heading = true }: { pathways: PathwaySummaryView[]; heading?: boolean }) {
  return (
    <section className="pathway-home-module pathway-picker-module" data-home-module="pathway-picker" aria-labelledby="pathway-picker-title">
      <div className="page-container">
        {heading ? <div className="pathway-section-heading"><div><p className="eyebrow">02 / 你可能在想的几条路</p><h2 id="pathway-picker-title">先看每天真正要做的事，再决定要不要继续。</h2><p>这些路不是单选题。你可以保留一条主路，也可以让同一个项目为不同方向留下不同记录。</p></div><Link className="text-link" href="/pathways">查看选下一步 <span aria-hidden="true">↗</span></Link></div> : null}
        <div className="pathway-picker-list">
          {pathways.map((pathway, index) => <PathwayPickerRow pathway={pathway} index={index} key={pathway.id} />)}
        </div>
      </div>
    </section>
  );
}

function PathwayPickerRow({ pathway, index }: { pathway: PathwaySummaryView; index: number }) {
  return (
    <article className={`pathway-picker-row pathway-kind-${pathway.kind}`}>
      <div className="pathway-picker-marker"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="pathway-line" aria-hidden="true" /></div>
      <div className="pathway-picker-main">
        <div className="pathway-picker-title"><span className="pathway-kind-label">{kindLabels[pathway.kind]}</span><h3>{pathway.title}</h3><p>{pathway.question}</p></div>
        <div className="pathway-picker-facts">
          <div><span>平时在做什么</span><strong>{pathway.dailyTask}</strong></div>
          <div><span>你可能已经有</span><strong>{pathway.reusableAssets.join('；')}</strong></div>
          <div><span>通常还要补</span><strong>{pathway.additionalGate}</strong></div>
          <div><span>先试这一步</span><strong>{pathway.defaultAction.title}</strong></div>
        </div>
      </div>
      <Link className="pathway-row-action" href={pathway.href}>查看这条路 <span aria-hidden="true">↗</span></Link>
    </article>
  );
}

export function EvidenceCrossroads({ model }: { model: HomePageModel }) {
  return (
    <section className="pathway-home-module evidence-crossroads-module" data-home-module="evidence-crossroads" aria-labelledby="evidence-crossroads-title">
      <div className="page-container">
        <div className="pathway-section-heading"><div><p className="eyebrow">03 / 证据路口</p><h2 id="evidence-crossroads-title">同一个作品，换条路也不用从零开始。</h2><p>一份事实底稿可以服务不同方向，但每条路能证明的事情不同；关联不等于符合资格或会有结果。</p></div><Link className="text-link" href={`/projects/${model.evidence.artifact.projectSlug}`}>打开项目体验卡 <span aria-hidden="true">↗</span></Link></div>
        <div className="evidence-crossroads-layout">
          <article className="evidence-artifact-panel">
            <span className="evidence-artifact-kicker">已有产物</span>
            <h3>{model.evidence.artifact.title}</h3>
            <p>{model.evidence.artifact.description}</p>
            <div className="evidence-artifact-path"><span>同一份底稿</span><span className="evidence-route-dot" aria-hidden="true" /><span>五种证据语言</span></div>
            <Link className="text-link" href={`/projects/${model.evidence.artifact.projectSlug}`}>查看产出与边界 <span aria-hidden="true">↗</span></Link>
          </article>
          <div className="evidence-transform-list" aria-label="同一产物的不同方向改写">
            {model.evidence.transformations.map((transformation) => <article className="evidence-transform-row" key={transformation.pathwayId}><div><span className="evidence-transform-path">{transformation.pathwayTitle}</span><strong>{transformation.evidenceUse.join('；')}</strong></div><p>仍不能证明：{transformation.missingProof.join('；')}</p></article>)}
          </div>
          <TrustRail trust={model.trust} />
        </div>
      </div>
    </section>
  );
}

export function ActionLadder({ model }: { model: HomePageModel }) {
  return (
    <section className="pathway-home-module action-ladder-module" data-home-module="action-ladder" aria-labelledby="action-ladder-title">
      <div className="page-container">
        <div className="pathway-section-heading"><div><p className="eyebrow">04 / 最小行动</p><h2 id="action-ladder-title">别先押半年，先走到下一格。</h2><p>行动是探索任务，不构成报名、申请、投递、资格判断或真实商业交易。</p></div><Link className="text-link" href="/pathways/explore">还没想好？做一周双路径实验 <span aria-hidden="true">↗</span></Link></div>
        <ol className="pathway-action-ladder">
          {model.actionLadder.map((rung, index) => <li className="pathway-action-rung" key={rung.horizon}><span className="pathway-rung-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div className="pathway-rung-content"><span className="pathway-rung-horizon">{rung.label}</span><div className="pathway-rung-items">{rung.actions.map((action) => <div className="pathway-rung-item" key={action.pathwayTitle}><strong>{action.pathwayTitle}</strong><span>{action.title}</span><small>产出：{action.output}</small></div>)}</div></div></li>)}
        </ol>
        <div className="pathway-home-context-links">{model.contextLinks.map((link) => <Link className="text-link" href={link.href} key={link.href}>{link.label} <span aria-hidden="true">↗</span></Link>)}</div>
      </div>
    </section>
  );
}

export function TrustRail({ trust }: { trust: HomePageModel['trust'] }) {
  return (
    <aside className="trust-rail" aria-label="路径来源与边界">
      <div className="trust-rail-heading"><span className="trust-rail-mark" aria-hidden="true">↗</span><div><strong>去哪核对</strong><span>稳定官方入口，不展示未经维护的“最新信息”。</span></div></div>
      <div className="trust-rail-status"><span className={`trust-status trust-status-${trust.factStatus}`}>事实：{factStatusLabels[trust.factStatus]}</span><span className="trust-status trust-status-unverified">链接：{linkStatusLabels[trust.linkStatuses[0]?.status ?? 'unverified']}</span></div>
      <ul className="trust-rail-sources">{trust.sources.slice(0, 2).map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} <span aria-hidden="true">↗</span></a><small>{source.authorityTier ? `${source.authorityTier} 级来源 · ` : ''}{source.version} · 适用范围：{source.scope}</small></li>)}</ul>
      <p className="trust-rail-boundary">内容基于 {trust.sources[0]?.lastVerified ?? '已登记'} 核验记录；周期、地区、机构和个人条件仍需回到官方原文。</p>
    </aside>
  );
}

export function PathwayDetailSections({ pathway, capabilities, projects, scenarios, transformations, evidence }: { pathway: Pathway; capabilities: Capability[]; projects: Project[]; scenarios: Scenario[]; transformations: EvidenceTransformation[]; evidence: PathwayEvidenceView }) {
  return <>
    <section className="detail-block pathway-detail-block"><div className="pathway-detail-grid"><div className="reading-column"><SectionTitle eyebrow="01 / 这条路在做什么" title={pathway.title} /><p>{pathway.summary}</p><div className="pathway-task-strip"><span>日常任务片段</span>{pathway.dailyTasks.map((task) => <strong key={task}>{task}</strong>)}</div>{pathway.kind === 'employment' ? <EmploymentExtension pathway={pathway} /> : null}{pathway.kind === 'domestic-postgraduate' ? <DomesticExtension pathway={pathway} /> : null}{pathway.kind === 'public-service' ? <PublicServiceExtension pathway={pathway} /> : null}{pathway.kind === 'overseas-study' ? <OverseasExtension pathway={pathway} /> : null}{pathway.kind === 'independent-work' ? <IndependentExtension pathway={pathway} /> : null}</div><aside className="pathway-detail-aside"><div className="pathway-boundary-card"><span>先别急着下结论</span><p>{pathway.eligibilityBoundary}</p><StatusLine evidence={evidence} /></div><div className="pathway-side-note"><strong>这不是结果承诺</strong><p>关联关系只说明可以从已有资产继续验证；不代表符合资格、一定录取、就业、收入或“最适合”。</p></div></aside></div></section>
    <section className="detail-block"><SectionTitle eyebrow="02 / 你已有的能力与证据" title="已有资产可以复用，但要换成这条路看得懂的证据" /><div className="pathway-relation-layout"><div className="pathway-relation-list">{capabilities.map((capability) => <Link className="pathway-relation-row" href={`/capabilities/${capability.slug}`} key={capability.id}><span>能力</span><strong>{capability.name}</strong><p>{capability.task}</p><span aria-hidden="true">↗</span></Link>)}</div><div className="pathway-assets-panel"><h3>可复用资产</h3><ul>{pathway.reusableAssets.map((asset) => <li key={asset}>{asset}</li>)}</ul><h3>需要新增的门槛</h3><ul>{pathway.additionalGates.map((gate) => <li key={gate}>{gate}</li>)}</ul></div></div></section>
    <section className="detail-block"><SectionTitle eyebrow="03 / 需要哪些证据" title="把兴趣变成可以检查的过程、产出和边界" /><div className="pathway-evidence-grid"><div className="pathway-checklist"><h3>证据清单</h3><ul>{pathway.evidenceChecklist.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="pathway-transformation-panel"><h3>把这份作品换一种说法</h3>{transformations.map((item) => <article key={item.sourceArtifactId}><strong>{item.truthfulFraming}</strong><p>可以提取：{item.evidenceUse.join('；')}</p><p>仍缺少：{item.missingProof.join('；')}</p></article>)}</div></div></section>
    <section className="detail-block"><SectionTitle eyebrow="04 / 时间与行动" title="先做最小实验，再决定要不要投入更长时间" /><p className="pathway-time-note">{pathway.timeConstraints.join('；')}</p><ActionCards actions={pathway.actions} /></section>
    <section className="detail-block"><SectionTitle eyebrow="05 / 相关入口" title="从能力、项目和场景继续核对" /><div className="pathway-related-grid"><div><h3>关联项目</h3>{projects.map((project) => <Link className="pathway-related-row" href={`/projects/${project.slug}`} key={project.id}><strong>{project.title}</strong><span>{project.expectedOutput}</span><span aria-hidden="true">↗</span></Link>)}</div><div><h3>关联场景</h3>{scenarios.map((scenario) => <Link className="pathway-related-row" href={`/scenarios/${scenario.slug}`} key={scenario.id}><strong>{scenario.name}</strong><span>{scenario.extraGate}</span><span aria-hidden="true">↗</span></Link>)}</div></div></section>
    <section className="detail-block"><OfficialSourcePanel evidence={evidence} /></section>
  </>;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="pathway-detail-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>; }

function StatusLine({ evidence }: { evidence: PathwayEvidenceView }) { return <div className="pathway-status-line"><span className={`trust-status trust-status-${evidence.claimStatus}`}>事实：{factStatusLabels[evidence.claimStatus]}</span><span className="trust-status trust-status-unverified">入口：{linkStatusLabels[evidence.linkStatuses[0]?.status ?? 'unverified']}</span></div>; }

function ActionCards({ actions }: { actions: PathwayAction[] }) {
  return <ol className="pathway-detail-actions">{actions.map((action) => <li className={`pathway-detail-action pathway-action-${action.horizon}`} key={action.id}><div className="pathway-action-topline"><span className="pathway-action-horizon">{horizonLabels[action.horizon]}</span><h3>{action.title}</h3></div><ol>{action.steps.map((step) => <li key={step}>{step}</li>)}</ol><dl className="pathway-action-facts"><div><dt>产出</dt><dd>{action.output}</dd></div><div><dt>停止条件</dt><dd>{action.stopCondition}</dd></div><div><dt>不能证明什么</dt><dd>{action.cannotProve}</dd></div><div><dt>下一档</dt><dd>{action.nextStep}</dd></div></dl></li>)}</ol>;
}

function OfficialSourcePanel({ evidence }: { evidence: PathwayEvidenceView }) {
  return <div className="pathway-source-panel"><SectionTitle eyebrow="06 / 要确认时去这里" title="稳定入口在这里，具体条件回到原文核对" /><p className="pathway-source-intro">不展示未经维护的截止日、当前政策或岗位清单；事实复核和链接可达是两条独立状态轴。</p><div className="pathway-source-list">{evidence.sources.map((source) => { const link = evidence.linkStatuses.find((item) => evidence.sources.some((entry) => entry.id === source.id) && item.url === source.url); return <article className="pathway-source-row" key={source.id}><div><span className="pathway-source-tier">{source.authorityTier ?? '未分级'} 级来源</span><h3>{source.title}</h3><p>{source.scope}</p><small>{source.version} · 最近核验：{source.lastVerified}</small></div><div><span className="trust-status trust-status-unverified">入口：{linkStatusLabels[link?.status ?? 'unverified']}</span><a className="text-link" href={source.url} target="_blank" rel="noreferrer">打开来源 <span aria-hidden="true">↗</span></a></div></article>; })}</div><StatusLine evidence={evidence} /></div>;
}

function EmploymentExtension({ pathway }: { pathway: Extract<Pathway, { kind: 'employment' }> }) { return <div className="pathway-extension"><h3>稳定岗位族预览</h3><div className="pathway-extension-list">{pathway.roleFamilies.map((family) => <article key={family.title}><strong>{family.title}</strong><p>{family.tasks.join('；')}</p><small>证据样例：{family.evidenceExample}</small></article>)}</div></div>; }
function DomesticExtension({ pathway }: { pathway: Extract<Pathway, { kind: 'domestic-postgraduate' }> }) { return <div className="pathway-extension"><h3>训练方式与方向样例</h3><p>{pathway.studyModes.join('；')}</p><div className="pathway-extension-list">{pathway.directionExamples.map((direction) => <article key={direction.title}><strong>{direction.title}</strong><p>{direction.trainingQuestion}</p><small>准备信号：{direction.preparationSignal}</small></article>)}</div></div>; }
function PublicServiceExtension({ pathway }: { pathway: Extract<Pathway, { kind: 'public-service' }> }) { return <div className="pathway-extension"><h3>读官方职位信息时的字段</h3><div className="pathway-field-list">{pathway.officialFieldChecklist.map((item) => <div key={item.field}><strong>{item.field}</strong><span>{item.question}</span></div>)}</div><p className="pathway-extension-note">范围：{pathway.serviceScopes.join('；')}</p></div>; }
function OverseasExtension({ pathway }: { pathway: Extract<Pathway, { kind: 'overseas-study' }> }) { return <div className="pathway-extension"><h3>项目类型与准备问题</h3><div className="pathway-extension-list">{pathway.programTypes.map((program) => <article key={program.title}><strong>{program.title}</strong><p>{program.trainingDifference}</p><small>核对：{program.verificationQuestion}</small></article>)}</div><p className="pathway-extension-note">准备问题：{pathway.preparationQuestions.join('；')}</p></div>; }
function IndependentExtension({ pathway }: { pathway: Extract<Pathway, { kind: 'independent-work' }> }) { return <div className="pathway-extension"><h3>低风险、可展示的服务切片</h3><div className="pathway-extension-list">{pathway.serviceSlices.map((service) => <article key={`${service.audience}-${service.problem}`}><strong>{service.audience}</strong><p>{service.problem} → {service.deliverable}</p><small>边界：{service.boundary}</small></article>)}</div><p className="pathway-extension-note">真实交易前核对：{pathway.complianceQuestions.join('；')}</p></div>; }
