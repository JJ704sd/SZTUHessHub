import Link from 'next/link';
import { ArrowLink, Badge, DualLensCard, FAQList, SectionHeading } from '@/components/site';
import type { HomePageModel } from '@/lib/content/view-models';
import { getProjectResourceState } from '@/lib/content/project-resources';
import { siteData, type Project } from '@/lib/content';

function ProjectTeaser({ project }: { project: Project }) {
  const asset = project.previewAssets[0];
  return <article className="home-project-teaser"><div className="home-project-teaser-visual"><img src={asset.src} alt={asset.alt} width="560" height="360" /></div><div><span className="eyebrow">今天可以先看</span><h2>{project.title}</h2><p className="teaser-time">10 分钟预览 · 约 90 分钟实践</p><p><strong>会留下：</strong>{project.expectedOutput}</p><Link className="text-link" href={`/projects/${project.slug}`}>看看今天怎么开始 <span aria-hidden="true">→</span></Link></div></article>;
}

export function HomeTaskLaunchpad({ model }: { model: HomePageModel }) {
  const firstProject = model.featuredProjects[0];
  return <section className="home-launch release-b-home-launch" aria-labelledby="home-launch-title"><div className="page-container home-launch-grid"><div className="home-launch-copy"><p className="eyebrow">给健康工程学生的探索桌面</p><h1 id="home-launch-title">先别急着选。动手试一次。</h1><p className="home-launch-lede">看懂两个专业在做什么，挑一个小项目，留下一份别人能看懂你做过什么的作品。</p><nav className="home-task-list" aria-label="开始探索">{model.taskEntries.map((entry) => <Link className={entry.primary ? 'home-task-entry is-primary' : 'home-task-entry'} href={entry.id === 'project' ? '/projects?intent=quick-look' : entry.href} key={entry.id}><span><strong>{entry.id === 'compare' ? '两个专业到底差在哪' : entry.id === 'project' ? '给我一个能马上试的项目' : '我还没想好，从这里开始'}</strong><small>{entry.summary}</small></span><span className="home-task-arrow" aria-hidden="true">→</span></Link>)}</nav></div>{firstProject ? <ProjectTeaser project={firstProject} /> : null}</div></section>;
}

function ProjectFacts({ project }: { project: Project }) {
  const state = getProjectResourceState(project);
  return <dl className="project-meta-grid"><div><dt>时长</dt><dd>{project.duration}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisites[0]}</dd></div><div><dt>现在能否开始</dt><dd className={`resource-state resource-state-${state.key}`}>{state.label}</dd></div></dl>;
}

export function HomeFeaturedProjects({ model }: { model: HomePageModel }) {
  const [featured, ...compact] = model.featuredProjects;
  if (!featured) return null;
  const asset = featured.previewAssets[0];
  return <section className="home-section home-projects" aria-labelledby="home-projects-title"><div className="page-container"><SectionHeading eyebrow="今天先试一个" title="先看会做出什么，再决定要不要开始" titleId="home-projects-title" description="一个重点项目和两个紧凑条目。每项只保留影响决定的时间、基础、产物和真实资源状态。" action={<ArrowLink href="/projects">按意图比较全部</ArrowLink>} /><div className="home-featured-projects"><article className="home-feature-project"><img src={asset.src} alt={asset.alt} width="720" height="460" loading="lazy" /><div><Badge tone="teal">{featured.kicker}</Badge><h3>{featured.title}</h3><p>{featured.suitableFor}</p><p><strong>会留下：</strong>{featured.expectedOutput}</p><ProjectFacts project={featured} /><Link className="button button-primary" href={`/projects/${featured.slug}`}>看看今天怎么开始 <span aria-hidden="true">→</span></Link></div></article><div className="home-compact-projects">{compact.map((project) => { const preview = project.previewAssets[0]; const state = getProjectResourceState(project); return <article className="home-compact-project" key={project.id}><img src={preview.src} alt="" width="180" height="120" loading="lazy" /><div><span className="eyebrow">{project.viewpoint}</span><h3>{project.title}</h3><p>{project.duration} · {project.expectedOutput}</p><span className={`resource-state resource-state-${state.key}`}>{state.label}</span><Link className="text-link" href={`/projects/${project.slug}`}>看看怎么开始 <span aria-hidden="true">→</span></Link></div></article>; })}</div></div></div></section>;
}

export function HomeDualMajorCase({ model }: { model: HomePageModel }) {
  if (!model.featuredDualLensCase) return null;
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  return <section className="home-section home-dual-case" aria-labelledby="home-dual-title"><div className="page-container"><SectionHeading eyebrow="同一道题，两种工程视角" title="两边各做什么，最后怎么接起来" titleId="home-dual-title" description={`共同目标：${model.featuredDualLensCase.sharedGoal}`} action={<ArrowLink href="/majors/compare#dual-lens">看完整专业对照</ArrowLink>} /><DualLensCard item={model.featuredDualLensCase} majorMap={majorMap} /></div></section>;
}

export function HomeArtifactPaths({ model }: { model: HomePageModel }) {
  const project = model.featuredProjects.find((item) => item.slug === model.evidence.artifact.projectSlug);
  if (!project) return null;
  const result = project.previewAssets.find((asset) => asset.kind === 'project_output') ?? project.previewAssets.at(-1)!;
  const pathwayMap = new Map(model.pathways.map((pathway) => [pathway.id, pathway]));
  const transformations = model.evidence.transformations.slice(0, 3);
  return <section className="home-section home-artifact" aria-labelledby="home-artifact-title"><div className="page-container"><SectionHeading eyebrow="做完以后，你会留下什么" title="一份别人能看懂你做过什么的记录" titleId="home-artifact-title" description="先展示作品本身，再看它如何诚实地改写成下一步证据。" /><div className="home-artifact-release-b"><figure><img src={result.src} alt={result.alt} width="720" height="460" loading="lazy" /><figcaption>基于本站项目步骤生成的确定性预览，不代表真实学生参与。</figcaption></figure><div><dl className="artifact-annotations"><div><dt>问题</dt><dd>{project.summary}</dd></div><div><dt>输入</dt><dd>{project.dataSource}</dd></div><div><dt>做法</dt><dd>{project.steps.slice(0, 2).join('；')}</dd></div><div><dt>结果</dt><dd>{project.expectedOutput}</dd></div><div><dt>限制</dt><dd>{project.boundary}</dd></div></dl><div className="home-artifact-rewrites">{transformations.map((item) => { const pathway = pathwayMap.get(item.pathwayId); return pathway ? <article key={item.pathwayId}><strong>{pathway.title}</strong><p>{item.truthfulFraming}</p><Link className="text-link" href={pathway.href}>看怎么继续 <span aria-hidden="true">→</span></Link></article> : null; })}</div></div></div></div></section>;
}

export function HomeRecent({ model }: { model: HomePageModel }) {
  return <section className="home-section home-recent" aria-labelledby="home-recent-title"><div className="page-container"><SectionHeading eyebrow="最近整理了这些" title="真实更新和会影响下一步的问题" titleId="home-recent-title" description="更新只记录可追溯的内容变化；来源与边界继续放在需要核对的位置。" action={<ArrowLink href="/sources">依据与更新时间</ArrowLink>} />{model.updates.length ? <div className="home-update-list">{model.updates.map((update) => <article key={update.id}><time dateTime={update.publishedAt}>{update.publishedAt}</time><div><strong>{update.entityTitle}</strong><p>{update.summary}</p><Link className="text-link" href={update.href}>查看变化影响的页面 <span aria-hidden="true">→</span></Link></div></article>)}</div> : null}<div className="home-faq-compact"><FAQList items={model.faqs} /><Link className="text-link" href="/majors/faq">查看全部 FAQ <span aria-hidden="true">→</span></Link></div></div></section>;
}
