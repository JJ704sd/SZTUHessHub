import Link from 'next/link';
import type { Major } from '@/lib/content/schema';
import styles from './curriculum-navigator.module.css';

export function CurriculumNavigator({ majors, compact = false }: { majors: Major[]; compact?: boolean }) {
  return <section className={styles.navigator} aria-labelledby="curriculum-navigation-title" id="learning-map">
    <div className={styles.heading}>
      <div><p className="eyebrow">从培养方案找到学习入口</p><h2 id="curriculum-navigation-title">课程不是清单，是解决问题的工具。</h2></div>
      <Link href={compact ? '/majors#learning-map' : '/capabilities'}>{compact ? '展开学习目录' : '连接到能力地图'} →</Link>
    </div>
    <p className={styles.note}>按已登记的培养内容整理。以下阶段是学习导览，不是官方学期排课；具体修读要求以对应年级正式方案为准。</p>
    <div className={styles.tracks}>{majors.map((major) => <article className={styles.track} key={major.id}>
      <header><p>{major.cohort} 级 · 学习路线</p><h3>{major.name}</h3><p>{major.cardSummary}</p></header>
      {compact ? <div className={styles.overview}><p>{major.representativeCourses.join(' / ')}</p><Link href={`/majors/${major.slug}/curriculum/${major.cohort}`}>查看课程与版本 →</Link></div> : <>
        <ol className={styles.stages}>{major.learningStory.map((stage) => <li key={stage.stage}><span aria-hidden="true">{stage.stage}</span><div><h4>{stage.title}</h4><p>{stage.summary}</p></div></li>)}</ol>
        <details open><summary>课程 → 能力：学完能做什么</summary><div className={styles.courses}>{major.courseEvidence.map((item) => <div key={item.course}><h4>{item.course}</h4><p>{item.detail}</p></div>)}</div></details>
        <details><summary>展开专业选修方向</summary><ul>{major.electives.map((item) => <li key={item}>{item}</li>)}</ul></details>
        <footer><Link href={`/majors/${major.slug}/curriculum/${major.cohort}`}>课程与版本 →</Link><Link href={`/sources#${major.sourceId}`}>查看依据 →</Link></footer>
      </>}
    </article>)}</div>
    {!compact && <nav className={styles.next} aria-label="课程学习后的行动"><span>把课程带到一个小任务里</span><Link href="/projects?intent=quick-look">挑一个项目 →</Link><Link href="/pathways">看看下一步方向 →</Link></nav>}
  </section>;
}
