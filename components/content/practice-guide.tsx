import Link from 'next/link';
import { getPracticeGuides } from '@/lib/content/practice-guides';
import type { Scenario } from '@/lib/content/schema';
import styles from './practice-guide.module.css';

type Guides = ReturnType<typeof getPracticeGuides>;

function PracticeStamp() {
  const guide = getPracticeGuides();
  return <p className={styles.meta}>编辑练习整理于 <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>{guide.reviewDue ? ' · 已到复核日期，请结合当前任务调整。' : null}</p>;
}

export function CapabilityWorkshop({ practice }: { practice: Guides['capabilities'][number] }) {
  return <section className={`detail-block ${styles.workshop}`} id="capability-practice" aria-labelledby="capability-practice-title">
    <div className={styles.heading}><p className="eyebrow">TRY IT / 约 {practice.minutes} 分钟的练习预算</p><h2 id="capability-practice-title">{practice.title}</h2><p>先做一份小记录，看看自己是否愿意继续追问。完成时间因基础而异。</p></div>
    <div className={styles.workshopGrid}>
      <div className={styles.task}><h3>从这些材料开始</h3><p>{practice.input}</p><ol>{practice.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className={styles.output}><strong>这一轮留下</strong><p>{practice.output}</p></div></div>
      <aside className={styles.checks}><h3>写完以后，自己核对</h3><ul>{practice.checks.map((check) => <li key={check}>{check}</li>)}</ul><Link className="text-link" href={`/projects/${practice.project.slug}#project-evidence-example`}>看看这份记录怎样继续整理 <span aria-hidden="true">↗</span></Link></aside>
    </div>
    <div className={styles.transfer}><h3>换一个场景，再追问两件事</h3><ol>{practice.transferQuestions.map((question) => <li key={question}>{question}</li>)}</ol></div>
    <PracticeStamp />
  </section>;
}

export function ProjectEvidenceExample({ example }: { example: Guides['projects'][number] }) {
  return <section className={`detail-block ${styles.example}`} id="project-evidence-example" aria-labelledby="project-evidence-example-title">
    <div className={styles.heading}><p className="eyebrow">SHOW YOUR WORK / 先看一份怎样写</p><h2 id="project-evidence-example-title">{example.exampleTitle}</h2><p>{example.context}</p></div>
    <div className={styles.exampleGrid}><div><h3>示例里可以对照什么</h3><ul>{example.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div><div className={styles.handoff}><h3>换成自己的记录时</h3><p>保留输入、步骤、实际结果和个人贡献。还没执行的步骤标成计划，让另一个人知道哪些内容可以复查。</p><div className={styles.actions}><a className="button button-primary" href={example.exampleHref} download>下载填写示例 <span aria-hidden="true">↓</span></a><a className="button button-secondary" href={example.project.artifactTemplate.href} download>下载空白记录模板 <span aria-hidden="true">↓</span></a></div><Link className="text-link" href={`/pathways/employment#career-story-${example.project.slug}`}>把这份记录讲给面试官听 <span aria-hidden="true">↗</span></Link></div></div>
    <PracticeStamp />
  </section>;
}

export function CareerWorkedExamples() {
  const guide = getPracticeGuides();
  return <section className={`detail-block ${styles.stories}`} id="career-worked-examples" aria-labelledby="career-worked-examples-title">
    <div className={styles.heading}><p className="eyebrow">MAKE IT CONCRETE / 从记录到表达</p><h2 id="career-worked-examples-title">只有一段课程练习，也可以认真讲清楚。</h2><p>下面是编辑示范。先对照证据，再按自己实际完成的部分改写；一段能解释清楚的经历就可以作为起点。</p></div>
    <div className={styles.storyGrid}>{guide.projects.map((example) => <article id={`career-story-${example.project.slug}`} key={example.projectId} className={styles.story}>
      <p className={styles.label}>编辑示范 · {example.project.data.kind === 'synthetic' ? '合成数据练习' : '教学练习'}</p><h3>{example.exampleTitle}</h3><p>{example.context}</p>
      <details><summary>展开记录、简历表达与面试追问 <span aria-hidden="true">＋</span></summary><div className={styles.storyBody}><h4>先拿出这些证据</h4><ul>{example.evidence.map((item) => <li key={item}>{item}</li>)}</ul><h4>实际完成后，可以怎样表达</h4><ol>{example.resumeBullets.map((item) => <li key={item}>{item}</li>)}</ol><h4>请同学继续追问</h4><ol>{example.interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ol></div></details>
      <div className={styles.storyLinks}><a href={example.exampleHref} download>下载完整填写示例 ↓</a><Link href={`/projects/${example.project.slug}#project-evidence-example`}>回到项目整理作品 ↗</Link></div>
    </article>)}</div>
    <PracticeStamp />
  </section>;
}

export function ScenarioPractice({ scenario }: { scenario: Scenario }) {
  const guide = getPracticeGuides();
  const practices = scenario.sharedCapabilities.slice(0, 2).map((id) => guide.capabilities.find((practice) => practice.capabilityId === id)!);
  return <section className={`detail-block ${styles.scenario}`} id="scenario-practice" aria-labelledby="scenario-practice-title"><div className={styles.heading}><p className="eyebrow">START SMALL / 把场景问题落到纸上</p><h2 id="scenario-practice-title">先选一份小记录，看看方法怎样用。</h2><p>从这个场景共用的能力开始。用练习中的合成或假设情境熟悉方法，再回到本页核对场景条件。</p></div><div className={styles.practiceCards}>{practices.map((practice) => <Link href={practice.href} key={practice.capabilityId}><span>约 {practice.minutes} 分钟 · {practice.capability.name}</span><h3>{practice.title}</h3><p>留下：{practice.output}</p><strong>打开步骤与自查 ↗</strong></Link>)}</div></section>;
}
