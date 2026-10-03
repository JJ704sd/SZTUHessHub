import Link from 'next/link';
import { getCareerGuide } from '@/lib/content/career-guide';
import { getPracticeGuides } from '@/lib/content/practice-guides';
import { CareerWorkedExamples } from './practice-guide';
import styles from './career-guide.module.css';

type Guide = ReturnType<typeof getCareerGuide>;

function RoleFirstStep({ role }: { role: Guide['roles'][number] }) {
  const practice = getPracticeGuides().capabilities.find((item) => item.capabilityId === role.capabilityIds[0])!;
  return <div className={styles.firstStep}><span>还没有项目？约 {practice.minutes} 分钟先试</span><h4>{practice.title}</h4><p>留下：{practice.output}</p><Link href={practice.href}>打开三步练习 <span aria-hidden="true">↗</span></Link></div>;
}

const stageTargets: Record<string, string> = {
  roles: '#career-roles', evidence: '#career-evidence', opportunities: '#career-resources', application: '#career-application', review: '#career-review',
};

export function CareerJourney({ guide }: { guide: Guide }) {
  return <section className={styles.journey} id="career-journey" aria-labelledby="career-journey-title">
    <div className={styles.heading}><p className="eyebrow">YOUR NEXT MOVE / 从你现在的位置开始</p><h2 id="career-journey-title">不用一次准备好，先往前走一格。</h2><p>医工、软件与 AI 并重。先挑工作任务，再把学习记录整理成能讲清楚的作品。</p></div>
    <ol className={styles.steps}>{guide.stages.map((stage, index) => <li key={stage.id}>
      <a href={stageTargets[stage.id]}><span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span><h3>{stage.title}</h3><p>{stage.description}</p><span className={styles.stepOutput}>留下：{stage.output}</span><span className={styles.arrow} aria-hidden="true">↗</span></a>
      <details className={styles.stageActions}><summary>这一格先做什么</summary><ul>{stage.actions.map((action) => <li key={action}>{action}</li>)}</ul></details>
    </li>)}</ol>
    <p className={styles.meta}>内容整理：<time dateTime={guide.updatedAt}>{guide.updatedAt}</time>{guide.reviewDue ? ' · 准备指南已到复核日期，请结合新的岗位说明阅读。' : null}</p>
  </section>;
}

export function CareerRoles({ guide }: { guide: Guide }) {
  return <section className={styles.section} id="career-roles" aria-labelledby="career-roles-title">
    <div className={styles.heading}><p className="eyebrow">01 / FIND YOUR KIND OF WORK</p><h2 id="career-roles-title">先挑工作任务，再看岗位名称。</h2><p>下面是四种练习方向。准备建议用来找差距；卡片里的官方样例说明某个具体岗位的要求。</p></div>
    <div className={styles.roles}>{guide.roles.map((role, index) => <article className={styles.role} key={role.id} id={`career-role-${role.id}`}>
      <div className={styles.roleTop}><span>ROLE / {String(index + 1).padStart(2, '0')}</span><span aria-hidden="true">↗</span></div>
      <h3>{role.title}</h3><p className={styles.summary}>{role.summary}</p>
      <div className={styles.keywords}><span>试着搜</span>{role.searchKeywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
      <RoleFirstStep role={role} />
      <div className={styles.roleLinks}><h4>可以从这些能力开始</h4>{role.capabilities.map((capability) => <Link key={capability.id} href={`/capabilities/${capability.slug}`}>{capability.name}<span aria-hidden="true">↗</span></Link>)}</div>
      <div className={styles.evidenceLinks}><h4>给自己留下一份作品</h4>{role.projects.map(({ project, evidenceFocus, nextExperiment }) => <div key={project.id}><Link href={`/projects/${project.slug}`}>{project.title}<span aria-hidden="true">↗</span></Link><p>{evidenceFocus}</p><small>再往前一步：{nextExperiment}</small></div>)}</div>
      <details className={styles.roleDetail}><summary>展开任务、准备重点与面试自查 <span aria-hidden="true">＋</span></summary><div className={styles.detailContent}>
        <h4>你会接触的任务</h4><ul>{role.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
        <h4>准备时先检查这几件事</h4><ul>{role.readiness.map((item) => <li key={item}>{item}</li>)}</ul>
        <h4>试着用自己的作品回答</h4><ol>{role.interviewQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
        <h4>官方岗位样例</h4>{role.sources.map((source) => <div className={styles.source} key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <span aria-hidden="true">↗</span></a><p>{source.note}</p><small>查看于 {source.checkedAt} · 样例可能随招聘批次调整</small></div>)}
      </div></details>
      <div className={styles.resourceLinks}><span>继续找机会</span>{role.resources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} <span aria-hidden="true">↗</span></a>)}</div>
    </article>)}</div>
  </section>;
}

export function CareerEvidence({ guide }: { guide: Guide }) {
  const stage = guide.stages.find((item) => item.id === 'evidence')!;
  return <section className={styles.section} id="career-evidence" aria-labelledby="career-evidence-title">
    <div className={styles.evidencePanel}><div><p className="eyebrow">02 / SHOW YOUR WORK</p><h2 id="career-evidence-title">一份作品，先讲清楚四件事。</h2><p>任务是什么、你做了什么、怎样验证、还有什么限制。课程练习也能认真整理，按实际完成的范围来写。</p><Link className="text-link" href="/projects">挑一个小项目继续做 <span aria-hidden="true">↗</span></Link></div>
      <ol>{stage.actions.map((action) => <li key={action}>{action}</li>)}</ol>
    </div>
  </section>;
}

export function CareerApplication({ guide }: { guide: Guide }) {
  const applicationStage = guide.stages.find((stage) => stage.id === 'application')!;
  const reviewStage = guide.stages.find((stage) => stage.id === 'review')!;
  return <>
    <section className={styles.section} id="career-application" aria-labelledby="career-application-title">
      <div className={styles.heading}><p className="eyebrow">04 / GET READY TO APPLY</p><h2 id="career-application-title">投递之前，把故事和安排准备好。</h2><p>{applicationStage.output}</p></div>
      <div className={styles.applicationGrid}>
        <article><span>01 / RESUME</span><h3>把项目写进简历</h3><ol>{guide.application.resumePrompts.map((item) => <li key={item}>{item}</li>)}</ol></article>
        <article><span>02 / INTERNSHIP</span><h3>把实习安排问清楚</h3><ul>{guide.application.internshipChecks.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><span>03 / INTERVIEW</span><h3>为一次面试做准备</h3><ol>{guide.application.interviewSteps.map((item) => <li key={item}>{item}</li>)}</ol></article>
      </div>
      <CareerWorkedExamples />
      <div className={styles.download}><p>把岗位对照、项目经历和面试记录写在同一份准备单里。</p><a className="button button-primary" href="/career-application-kit.txt" download>下载求职准备单 <span aria-hidden="true">↓</span></a></div>
    </section>
    <section className={styles.section} id="career-review" aria-labelledby="career-review-title"><div className={styles.review}>
      <div><p className="eyebrow">05 / LEARN FROM THE LOOP</p><h2 id="career-review-title">每一次投递，都留下一点新线索。</h2><p>{reviewStage.description}</p><strong>这一轮留下：{reviewStage.output}</strong><Link className="text-link" href="/pathways/explore">想换个方向？做一次双路径实验 <span aria-hidden="true">↗</span></Link></div>
      <ol>{guide.application.followUpSteps.map((item) => <li key={item}>{item}</li>)}</ol>
    </div></section>
  </>;
}

export function CareerConnections({ kind, id }: { kind: 'capability' | 'project'; id: string }) {
  const roles = getCareerGuide().roles.filter((role) => kind === 'capability' ? role.capabilities.some((capability) => capability.id === id) : role.projects.some(({ project }) => project.id === id));
  if (roles.length === 0) return null;
  return <section className={`detail-block ${styles.connections}`} aria-labelledby="career-connections-title"><div className={styles.heading}><p className="eyebrow">NEXT / 带到求职里试一试</p><h2 id="career-connections-title">{kind === 'project' ? '这份作品，可以从哪些工作任务继续了解？' : '这项能力，可以用在哪些工作任务里？'}</h2><p>关联说明练习与任务之间的联系。点进去看还需要补什么，以及怎样讲清自己的证据。</p></div><div className={styles.connectionGrid}>{roles.map((role) => <Link key={role.id} href={role.href}><strong>{role.title}</strong><span>{kind === 'project' ? role.projects.find(({ project }) => project.id === id)!.evidenceFocus : role.summary}</span><small>看准备方向与面试自查 <span aria-hidden="true">↗</span></small></Link>)}</div></section>;
}
