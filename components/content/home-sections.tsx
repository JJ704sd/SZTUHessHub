import Link from 'next/link';
import type { HomePageModel } from '@/lib/content/view-models';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { siteConfig } from '@/lib/site-config';
import styles from './home-sections.module.css';

const starterHref = '/projects/signal-feature-notebook/starter';

export function HomeTaskLaunchpad({ model }: { model: HomePageModel }) {
  const project = model.featuredProjects.find((item) => item.slug === 'signal-feature-notebook');
  const preview = project?.previewAssets.find((asset) => asset.kind === 'project_output') ?? project?.previewAssets[0];
  return <section className={styles.launch} aria-labelledby="home-launch-title"><div className={`page-container ${styles.launchGrid}`}><div><p className="eyebrow">给健康工程学生的低风险实验桌</p><h1 id="home-launch-title">今天先碰一个小问题。</h1><p className={styles.lede}>不用先选专业，也不用先装环境。看懂差异，或花 10 分钟试一次。</p><nav className={styles.taskList} aria-label="开始探索"><Link data-home-task-entry="true" className={styles.secondaryTask} href="/majors/compare#dual-lens"><span><strong>看两个专业怎么分工</strong><small>用同一道题看两种工程视角</small></span><span aria-hidden="true">→</span></Link><Link data-home-task-entry="true" className={styles.primaryTask} href={starterHref}><span><strong>做一次 10 分钟 Starter</strong><small>无账号、零安装、只用合成信号</small></span><span aria-hidden="true">→</span></Link><Link data-home-task-entry="true" className={styles.secondaryTask} href="/pathways/explore"><span><strong>我还没想好</strong><small>用两条短任务做一周比较</small></span><span aria-hidden="true">→</span></Link></nav></div>{preview ? <figure className={styles.resultPreview}><img src={preview.src} alt={preview.alt} width="720" height="460" /><figcaption><strong>做完会留下：曲线与三行观察</strong><span>10 分钟 · 可本地保存 · 不含真实健康数据</span><small>确定性合成预览，不代表真实学生参与。</small></figcaption></figure> : null}</div></section>;
}

export function HomeDualMajorCase({ model }: { model: HomePageModel }) {
  const item = model.featuredDualLensCase;
  if (!item) return null;
  return <section className={styles.section} aria-labelledby="home-dual-title"><div className="page-container"><div className={styles.heading}><div><p className="eyebrow">30 秒看懂专业侧重</p><h2 id="home-dual-title">同一道题，两边主要负责什么</h2><p>共同问题：{item.problem}</p></div><Link href="/majors/compare#dual-lens">看完整分工与接口 →</Link></div><div className={styles.dualStrip}>{item.lenses.map((lens) => <article key={lens.majorId}><strong>{lens.label}</strong><p>{lens.role}</p></article>)}<p className={styles.shared}><strong>共同产物：</strong>{item.sharedArtifact}</p></div></div></section>;
}

export function HomeFeaturedProjects({ model }: { model: HomePageModel }) {
  return <section className={styles.section} aria-labelledby="home-projects-title"><div className="page-container"><div className={styles.heading}><div><p className="eyebrow">挑一个能完成的小项目</p><h2 id="home-projects-title">三个任务，只保留影响开始的事实</h2></div><Link href="/projects?intent=quick-look">看全部小项目 →</Link></div><div className={styles.projectList}>{model.featuredProjects.map((project) => { const representative = project.slug === 'signal-feature-notebook'; const external = getProjectResourceState(project); return <article data-home-project-entry="true" key={project.id}><div><h3>{project.title}</h3><p>{project.duration} · {project.prerequisites[0]} · 会留下 {project.expectedOutput}</p><span>内部起点：{representative ? '10 分钟 Starter（待人工复核）' : '只有开始说明'} · 外部资源：{external.label}</span></div><Link className={representative ? 'button button-primary' : styles.rowAction} href={representative ? starterHref : `/projects/${project.slug}`}>{representative ? '直接做 10 分钟 Starter' : '先看怎么开始'} <span aria-hidden="true">→</span></Link></article>; })}</div></div></section>;
}

export function HomeArtifactPaths({ model }: { model: HomePageModel }) {
  const project = model.featuredProjects.find((item) => item.slug === 'signal-feature-notebook');
  const result = project?.previewAssets.find((asset) => asset.kind === 'project_output') ?? project?.previewAssets.at(-1);
  if (!project || !result) return null;
  return <section className={styles.section} aria-labelledby="home-artifact-title"><div className="page-container"><div className={styles.heading}><div><p className="eyebrow">做完会留下什么</p><h2 id="home-artifact-title">一张曲线、三行观察和一条限制</h2></div></div><div className={styles.artifact}><figure><img src={result.src} alt={result.alt} width="720" height="460" loading="lazy" /><figcaption>固定合成信号，不代表真实学生参与或医学数据。</figcaption></figure><div><ol><li>我看到了什么形状或噪声。</li><li>哪个特征发生了变化。</li><li>这个结果不能外推成什么结论。</li></ol><p><strong>安全边界：</strong>{project.safetyBoundary}</p><nav aria-label="作品后的下一步"><Link href="/pathways/employment">做工程相关工作</Link><Link href="/pathways/domestic-postgraduate">继续读研</Link><Link href="/pathways/explore">还没决定，做双路径实验</Link></nav></div></div></div></section>;
}

export function HomeRecent({ model }: { model: HomePageModel }) {
  const representative = model.featuredProjects.find((item) => item.slug === 'signal-feature-notebook');
  return <section className={styles.trust} aria-labelledby="home-trust-title"><div className="page-container"><div><p className="eyebrow">依据与最近核验</p><h2 id="home-trust-title">把“可达”和“已复核”分开说</h2></div><dl><div><dt>培养版本</dt><dd>{siteConfig.currentCohort} 级</dd></div><div><dt>内容基线</dt><dd>{siteConfig.contentBaseline}</dd></div><div><dt>代表 Starter</dt><dd>{representative ? '机器可达 · 人工与许可待复核' : '待登记'}</dd></div></dl><p><Link href="/sources">看来源与边界 →</Link><Link href="/majors/faq">看学生常问 →</Link></p></div></section>;
}
