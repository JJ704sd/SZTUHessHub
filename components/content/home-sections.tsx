import Link from 'next/link';
import { ArrowLink, DualLensCard, FAQList, ProjectCapsuleCard, SectionHeading, SourceLine } from '@/components/site';
import type { HomePageModel } from '@/lib/content/view-models';
import { siteData } from '@/lib/content';

export function HomeTaskLaunchpad({ model }: { model: HomePageModel }) {
  const firstProject = model.featuredProjects[0];
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));

  return (
    <section className="home-launch section-first" aria-labelledby="home-launch-title">
      <div className="page-container home-launch-grid">
        <div className="home-launch-copy">
          <p className="eyebrow">HseeHub / 健康工程探索桌面</p>
          <h1 id="home-launch-title">今天想先弄明白什么？</h1>
          <p className="home-launch-lede">先看一个真实任务，或者动手试一次。不用今天就决定未来：看懂两个专业，留下一个小成果，再决定下一步。</p>
          <nav className="home-task-list" aria-label="开始探索">
            {model.taskEntries.map((entry) => (
              <Link className={entry.primary ? 'home-task-entry is-primary' : 'home-task-entry'} href={entry.href} key={entry.id}>
                <span className="home-task-index" aria-hidden="true">{entry.id === 'compare' ? '01' : entry.id === 'project' ? '02' : '03'}</span>
                <span><strong>{entry.label}</strong><small>{entry.summary}</small></span>
                <span className="home-task-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </div>
        {firstProject ? <div className="home-launch-project"><div className="home-section-kicker"><span>现在就能试</span><span>首发项目</span></div><ProjectCapsuleCard project={firstProject} majorMap={majorMap} /></div> : null}
      </div>
    </section>
  );
}

export function HomeFeaturedProjects({ model }: { model: HomePageModel }) {
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  return (
    <section className="home-section home-projects" aria-labelledby="home-projects-title">
      <div className="page-container">
        <SectionHeading eyebrow="B / 这周可以做" title="挑一个小项目，先看能留下什么" titleId="home-projects-title" description="三张卡都先写清楚适合谁、会留下什么、需要多久和入口状态。完整步骤、许可和停止条件在详情里。" action={<ArrowLink href="/projects">查看全部项目</ArrowLink>} />
        <div className="home-project-grid">{model.featuredProjects.map((project) => <ProjectCapsuleCard key={project.id} project={project} majorMap={majorMap} />)}</div>
      </div>
    </section>
  );
}

export function HomeDualMajorCase({ model }: { model: HomePageModel }) {
  if (!model.featuredDualLensCase) return null;
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  return (
    <section className="home-section home-dual-case" aria-labelledby="home-dual-title">
      <div className="page-container">
        <SectionHeading eyebrow="C / 同一个问题，两种做法" title="差异不是二选一，项目要把接口接起来" titleId="home-dual-title" description="先看两个专业各自会处理什么，再看输入、输出和共同验收怎样交接。" action={<ArrowLink href="/majors/compare#dual-lens">看两个案例</ArrowLink>} />
        <DualLensCard item={model.featuredDualLensCase} majorMap={majorMap} />
      </div>
    </section>
  );
}

export function HomeArtifactPaths({ model }: { model: HomePageModel }) {
  const project = model.featuredProjects.find((item) => item.slug === model.evidence.artifact.projectSlug);
  const preferred = ['path-employment', 'path-domestic-postgraduate', 'path-independent-work'];
  const preferredTransformations = preferred.map((id) => model.evidence.transformations.find((item) => item.pathwayId === id)).filter(Boolean);
  const transformations = (preferredTransformations.length >= 2 ? preferredTransformations : model.evidence.transformations.slice(0, 3)) as HomePageModel['evidence']['transformations'];
  if (transformations.length === 0) return null;
  const pathwayMap = new Map(model.pathways.map((pathway) => [pathway.id, pathway]));

  return (
    <section className="home-section home-artifact" aria-labelledby="home-artifact-title">
      <div className="page-container">
        <SectionHeading eyebrow="D / 做完能带去哪" title="同一份小成果，可以换三种说法" titleId="home-artifact-title" description="作品先说明问题、过程、结果和限制，再按目标方向改写重点；它不是录取、录用或资格结论。" action={<ArrowLink href="/pathways">看看几条可能的路</ArrowLink>} />
        <div className="home-artifact-layout">
          <article className="home-artifact-card">
            <span className="home-artifact-mark" aria-hidden="true">↳</span>
            <p className="eyebrow">一份可复核的项目记录</p>
            <h3 id="featured-artifact-title">{model.evidence.artifact.title}</h3>
            <p>{model.evidence.artifact.description}</p>
            {project ? <><span className="home-artifact-source">来自：{project.title}</span><Link className="text-link" href={`/projects/${project.slug}#artifact-template`}>看产物模板 <span aria-hidden="true">↗</span></Link></> : null}
          </article>
          <div className="home-artifact-paths">
            {transformations.map((transformation) => {
              const pathway = pathwayMap.get(transformation.pathwayId);
              if (!pathway) return null;
              return <article className="home-artifact-path" key={transformation.pathwayId}><div><strong>{pathway.title}</strong><span>{transformation.evidenceUse[0]}</span></div><p>{transformation.truthfulFraming}</p><Link className="text-link subtle-link" href={pathway.href}>看这条路怎么继续 <span aria-hidden="true">↗</span></Link></article>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFaq({ model }: { model: HomePageModel }) {
  return (
    <section className="home-section home-faq" aria-labelledby="home-faq-title">
      <div className="page-container home-faq-inner">
        <SectionHeading eyebrow="E / 同学常问" title="先回答会影响下一步的问题" titleId="home-faq-title" description="以下是编辑部整理的常见问题，不是未经授权的学生原话。" action={<ArrowLink href="/majors/faq">查看全部 FAQ</ArrowLink>} />
        <FAQList items={model.faqs} />
        <div className="home-faq-source"><SourceLine source={siteData.sources[0]} label="事实基线" /></div>
      </div>
    </section>
  );
}
