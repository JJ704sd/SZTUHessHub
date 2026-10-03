import type { EmploymentPathway } from '@/lib/content/schema';
import styles from './career-resources.module.css';

const categories = [
  { id: 'platform', index: '01', title: '先找机会', description: '学校信息、招聘专场与实习平台，从熟悉的入口开始。', mark: '↗' },
  { id: 'medical', index: '02', title: '医工方向', description: '看看医疗设备、影像与工程团队在做什么。', mark: '+' },
  { id: 'technology', index: '03', title: '软件、AI 与工程', description: '把编程、建模和测试能力带到更多行业。', mark: '⌘' },
  { id: 'preparation', index: '04', title: '准备笔试与面试', description: '围绕目标岗位练习，给自己的项目一个清楚的讲法。', mark: '✳' },
] as const;

export function CareerResources({ catalog }: { catalog: EmploymentPathway['resourceCatalog'] }) {
  const reviewDue = catalog.reviewDueAt < new Date().toISOString().slice(0, 10);

  return <section id="career-resources" className={styles.resources} aria-labelledby="career-resources-title">
    <div className={styles.intro}>
      <div><p className="eyebrow">CAREER KIT / 带着作品，去找机会</p><h2 id="career-resources-title">就业与实习，从这里接着走。</h2><p>找机会、看企业、准备申请。一次选两三个入口，把感兴趣的岗位留下来。</p></div>
      <div className={styles.count}><strong>{catalog.items.length}</strong><span>个资源入口</span></div>
    </div>
    <nav className={styles.guideLinks} aria-label="求职准备导航"><a href="#career-journey">还没想好怎么准备？先看行动路线 ↗</a><a href="#career-worked-examples">想把作品写进简历？看填写示例 ↗</a></nav>
    <nav className={styles.categories} aria-label="就业实习资源分类">
      {categories.map((category) => <a key={category.id} href={`#career-${category.id}`}><span aria-hidden="true">{category.mark}</span>{category.title}<small>{catalog.items.filter((item) => item.category === category.id).length}</small></a>)}
    </nav>
    <p className={styles.note}>整理于 <time dateTime={catalog.updatedAt}>{catalog.updatedAt}</time> · 招聘批次、岗位要求与申请方式以原站为准。{reviewDue ? '这份目录已到复核日期，请重新核对入口。' : null}</p>

    {categories.map((category) => <section id={`career-${category.id}`} className={styles.group} key={category.id} aria-labelledby={`career-${category.id}-title`}>
      <div className={styles.groupHeading}><span aria-hidden="true">{category.index}</span><div><h3 id={`career-${category.id}-title`}>{category.title}</h3><p>{category.description}</p></div></div>
      <div className={styles.grid}>{catalog.items.filter((item) => item.category === category.id).map((resource) => <article className={styles.card} key={resource.id}>
        <div className={styles.tags}>{resource.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <h4>{resource.title}</h4><p className={styles.description}>{resource.description}</p>
        <p className={styles.access}>{resource.accessNote}</p>
        <a href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`打开资源：${resource.title}（新窗口）`}><span>打开资源</span><span aria-hidden="true">↗</span></a>
      </article>)}</div>
    </section>)}

  </section>;
}
