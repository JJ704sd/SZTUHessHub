import Link from 'next/link';
import type { HomePageModel } from '@/lib/content/view-models';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { siteConfig } from '@/lib/site-config';
import styles from './home-sections.module.css';

function ExploreIcon({ kind }: { kind: 'compare' | 'experiment' | 'direction' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'compare' ? <><path d="M12 5v15M3 4l9 2 9-2v14l-9 2-9-2z" /><path d="m6 8 3 .7M6 12l3 .7m6-4 3-.7m-3 4 3-.7" /></> : kind === 'experiment' ? <><path d="M9 3h6m-5 0v6L4 19a1.4 1.4 0 0 0 1.2 2h13.6A1.4 1.4 0 0 0 20 19L14 9V3M8 14h8" /><path d="M10 17h.01M14 18h.01" /></> : <><circle cx="12" cy="12" r="9" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5z" /></>}
  </svg>;
}

function ExperimentVisual() {
  return <div className={styles.experimentVisual} aria-hidden="true">
    <div className={styles.visualTop}><span><i /> IDEAS IN MOTION</span><span>H / LAB — 001</span></div>
    <div className={styles.orbitArt}>
      <svg viewBox="0 0 460 290" fill="none">
        <g className={styles.orbits}><ellipse cx="230" cy="140" rx="150" ry="52" transform="rotate(-32 230 140)" /><ellipse cx="230" cy="140" rx="150" ry="52" transform="rotate(32 230 140)" /><ellipse cx="230" cy="140" rx="150" ry="52" transform="rotate(90 230 140)" /></g>
        <g className={styles.orbitNodes}><circle cx="110" cy="68" r="9" /><circle cx="352" cy="212" r="7" /><circle cx="230" cy="290" r="5" /><circle cx="344" cy="63" r="5" /></g>
        <circle className={styles.coreHalo} cx="230" cy="140" r="62" /><circle className={styles.core} cx="230" cy="140" r="45" />
        <path className={styles.coreSignal} d="M199 142h14l7-18 10 34 10-39 9 23h13" />
      </svg>
      <span className={styles.artTag}>好奇心，不设限 ↗</span><span className={styles.artCaption}>BIO × CODE × DESIGN</span>
    </div>
    <div className={styles.signalPanel}><div><span>01 / 捕捉一个信号</span><span>→</span></div><svg viewBox="0 0 400 50" fill="none"><path className={styles.signalGrid} d="M0 25h400M50 0v50M100 0v50M150 0v50M200 0v50M250 0v50M300 0v50M350 0v50" /><path className={styles.signalLine} d="M0 27h25l8-3 7 6 9-8 9 5h28l7-6 7 10 8-25 10 39 10-28 9 10h37l8-4 8 7 8-8 9 5h32l8-5 8 10 8-25 10 38 10-28 9 10h37l8-4 8 7 8-8 9 5h30" /></svg><p>观察 → 动手 → 留下你的发现</p></div>
    <span className={styles.visualNote}>探索概念示意 · 非医学数据</span>
  </div>;
}

export function HomeTaskLaunchpad({ model }: { model: HomePageModel }) {
  return <section className={styles.launch} aria-labelledby="home-launch-title"><div className="page-container">
    <div className={styles.launchGrid}><div className={styles.launchCopy}>
      <p className={styles.welcome}><span /> 给健康工程学生的探索空间</p><p className={styles.heroIndex}>STAY CURIOUS. START SMALL.</p>
      <h1 id="home-launch-title" aria-label="今天先碰一个小问题。">今天先碰<br /><span>一个小问题。</span><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m24 3 4 14 13-6-8 12 12 6-15 1 1 15-8-12-11 10 5-15-14-4 15-4z" /></svg></h1>
      <p className={styles.lede}>专业还没看懂，方向还没想好？<br />没关系。从一个信号、一段代码、一次动手开始。</p>
      <div className={styles.heroFootnote}><span>保持好奇</span><span>允许试错</span><span>让想法落地</span></div>
    </div><ExperimentVisual /></div>
    <nav className={styles.taskList} aria-label="开始探索">{model.homeActions.map((action, index) => {
      const displayLabel = action.isPrimary && !action.directStart ? action.statusLabel : action.label;
      return <Link data-home-task-entry="true" data-home-action-id={action.id} data-home-action-status={action.status} data-home-action-direct-start={action.directStart} data-home-action-fallback={action.fallbackHref} className={action.isPrimary ? styles.primaryTask : styles.secondaryTask} href={action.href} aria-label={`${action.isPrimary ? '动手做个小项目，' : ''}${displayLabel}${action.isPrimary && !action.directStart ? '，将先查看项目状态' : ''}`} key={action.id}>
        <span className={styles.taskIcon}><ExploreIcon kind={index === 0 ? 'compare' : index === 1 ? 'experiment' : 'direction'} /></span><span className={styles.taskCopy}><strong>{action.isPrimary ? '动手做个小项目' : action.label}</strong><small>{action.isPrimary && !action.directStart ? displayLabel : action.summary}</small></span><span className={styles.taskArrow} aria-hidden="true">↗</span>
      </Link>;
    })}</nav>
    {model.editorialReviewDue ? <p className={styles.reviewNote}><span>待复核</span>部分内容已到复核日期，可先作探索参考。<Link href="/sources">查看来源与状态 ↗</Link></p> : null}
  </div></section>;
}

export function HomeDualMajorCase({ model }: { model: HomePageModel }) {
  const item = model.featuredDualLensCase;
  const compareAction = model.homeActions.find((action) => action.intent === 'compare');
  if (!item || !compareAction) return null;
  return <section className={styles.section} aria-labelledby="home-dual-title"><div className="page-container">
    <div className={styles.heading}><div><p className={styles.kicker}>01 / FIND YOUR ANGLE</p><h2 id="home-dual-title">同一个问题，<span>两种打开方式。</span></h2></div><Link href={compareAction.href}>认识两个专业 <span aria-hidden="true">↗</span></Link></div>
    <div className={styles.dualStrip}><div className={styles.sharedQuestion}><span className={styles.tinyLabel}>从这道题出发</span><h3>{item.problem}</h3><span className={styles.questionMark} aria-hidden="true">↳</span></div>
      {item.lenses.map((lens, index) => <article key={lens.majorId}><div className={styles.lensTop}><span className={styles.lensIcon}><ExploreIcon kind={index === 0 ? 'compare' : 'experiment'} /></span><span className={styles.tinyLabel}>{index === 0 ? 'DATA & INTELLIGENCE' : 'SYSTEMS & DESIGN'}</span></div><h3>{lens.label}</h3><p>{lens.role}</p></article>)}
      <p className={styles.shared}><span aria-hidden="true">↔</span><strong>一起完成</strong><span>{item.sharedArtifact}</span></p>
    </div>
  </div></section>;
}

export function HomeFeaturedProjects({ model }: { model: HomePageModel }) {
  const primaryAction = model.homeActions.find((action) => action.isPrimary);
  return <section className={`${styles.section} ${styles.projectsSection}`} aria-labelledby="home-projects-title"><div className="page-container">
    <div className={styles.heading}><div><p className={styles.kicker}>02 / LESS SCROLLING, MORE MAKING</p><h2 id="home-projects-title">灵感，从动手开始。</h2><p>三个小项目，挑一个你想弄明白的。</p></div><Link href="/projects?intent=quick-look">进入项目实验室 <span aria-hidden="true">↗</span></Link></div>
    <div className={styles.projectList}>{model.featuredProjects.map((project, index) => {
      const representative = project.id === primaryAction?.projectId;
      const external = getProjectResourceState(project);
      const actionHref = representative ? (primaryAction?.fallbackHref ?? project.primaryAction.href) : project.primaryAction.href;
      const actionLabel = representative ? (primaryAction?.fallbackLabel ?? project.primaryAction.label) : '先看怎么开始';
      const preview = project.previewAssets.find((asset) => asset.kind === 'project_output') ?? project.previewAssets[0];
      return <article data-home-project-entry="true" key={project.id}>
        <div className={styles.projectVisual}><div className={styles.projectVisualLabel}><span>EXPERIMENT / {String(index + 1).padStart(2, '0')}</span><span>{project.duration}</span></div>{preview ? <img src={preview.src} alt={preview.alt} width="720" height="460" loading="lazy" /> : <ExploreIcon kind="experiment" />}</div>
        <div className={styles.projectBody}><span className={styles.tinyLabel}>PROJECT / {String(index + 1).padStart(2, '0')}</span><h3>{project.title}</h3><p className={styles.projectOutput}>会留下：{project.expectedOutput}</p><div className={styles.projectFacts}><span>{project.prerequisites[0]}</span><span>外部资源：{external.label}</span></div><p className={styles.projectStatus}>内部起点：{representative ? `10 分钟 Starter（${primaryAction?.statusDetail ?? primaryAction?.statusLabel ?? '待复核'}）` : '开始说明'}</p><Link className={styles.rowAction} href={actionHref} aria-label={`${actionLabel}${representative && primaryAction && !primaryAction.directStart ? `，当前${primaryAction.statusLabel}` : ''}`}>{actionLabel}<span aria-hidden="true">↗</span></Link></div>
      </article>;
    })}</div>
  </div></section>;
}

export function HomeArtifactPaths({ model }: { model: HomePageModel }) {
  const primaryAction = model.homeActions.find((action) => action.isPrimary);
  const project = model.featuredProjects.find((item) => item.id === primaryAction?.projectId);
  const result = project?.previewAssets.find((asset) => asset.kind === 'project_output') ?? project?.previewAssets.at(-1);
  if (!project || !result) return null;
  return <section className={styles.section} aria-labelledby="home-artifact-title"><div className="page-container"><div className={styles.artifact}>
    <div className={styles.artifactCopy}><p className={styles.kicker}>03 / MAKE IT YOURS</p><h2 id="home-artifact-title">不止“我学过”，<br />还有<span>“这是我做的”。</span></h2><p>一张曲线，三行观察，一条限制。<br />让每一次小尝试，都有迹可循。</p><ol><li>观察：我看到了什么？</li><li>变化：哪个特征不一样了？</li><li>边界：它还不能说明什么？</li></ol><nav aria-label="作品后的下一步"><Link href="/pathways/employment#career-journey">从作品开始准备求职 ↗</Link><Link href="/pathways/domestic-postgraduate">继续读研 ↗</Link><Link href="/pathways/explore">还没决定 ↗</Link></nav></div>
    <figure className={styles.artifactPreview}><div className={styles.notebookBar}><span><i /><i /><i /></span><span>MY FIRST DISCOVERY</span><span>↗</span></div><img src={result.src} alt={result.alt} width="720" height="460" loading="lazy" /><figcaption><strong>一份小作品，也值得认真记录。</strong><span>固定合成信号 · 非真实学生作品或医学数据</span></figcaption></figure>
    <details className={styles.safetyNote}><summary>实验的数据与安全边界</summary><p>{project.safetyBoundary}</p></details>
  </div></div></section>;
}

export function HomeRecent({ model }: { model: HomePageModel }) {
  const primaryAction = model.homeActions.find((action) => action.isPrimary);
  return <section className={styles.trust} aria-labelledby="home-trust-title"><div className={`page-container ${styles.trustInner}`}>
    <div><p className={styles.kicker}>OPEN NOTES / 有据可查</p><h2 id="home-trust-title">好奇可以大胆，依据要讲清。</h2><p>“可达”和“已复核”分开记录。</p></div>
    <dl><div><dt>培养版本</dt><dd>{siteConfig.currentCohort} 级</dd></div><div><dt>内容基线</dt><dd>{siteConfig.contentBaseline}</dd></div><div><dt>代表 Starter</dt><dd>{primaryAction?.statusDetail ?? '待登记'}</dd></div></dl>
    <nav aria-label="来源与常见问题"><Link href="/sources">来源与边界 ↗</Link><Link href="/majors/faq">学生常问 ↗</Link></nav>
  </div></section>;
}
