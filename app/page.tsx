import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, ExplorationLink, FAQList, MajorQuickCompare, ProjectCapsuleCard, SectionHeading, TaskEntry } from '@/components/site';
import { TaskAreaViewed } from '@/components/task-area-viewed';

export default function HomePage() {
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  const primarySource = siteData.sources.find((source) => source.id === siteData.majors[0]?.sourceId);

  return (
    <>
      <TaskAreaViewed />
      <section className="section home-module home-task-module" data-home-module="task-entry" id="home-tasks">
        <div className="page-container">
          <p className="eyebrow">健康工程 · 双专业 · 可迁移能力</p>
          <h1>{siteData.siteMeta.tagline}</h1>
          <p className="hero-lede">{siteData.siteMeta.description}</p>
          <div className="task-entry-grid">
            <TaskEntry href="/majors/compare" title="比较两个专业" description="看共同底座、不同侧重和协作接口" primary event={{ name: 'home_task_select', taskId: 'compare', surface: 'task-grid' }} />
            <TaskEntry href="/capabilities" title="看课程能做什么" description={`从课程进入 ${siteData.capabilities.length} 类能力`} event={{ name: 'home_task_select', taskId: 'capabilities', surface: 'task-grid' }} />
            <TaskEntry href="/projects" title="先试一个小项目" description="按时间、先修和产出做选择" event={{ name: 'home_task_select', taskId: 'project', surface: 'task-grid' }} />
          </div>
          <div className="home-meta"><span>{siteConfig.currentCohort} 级 · 最近核验 {siteConfig.contentBaseline}</span><ArrowLink href="/sources">查看来源</ArrowLink></div>
        </div>
      </section>

      <section className="section section-tint home-module" data-home-module="quick-compare" id="home-compare">
        <div className="page-container">
          <SectionHeading eyebrow="01 / 快速对照" title="共同底座相同，工程侧重不同" description="学分说明培养结构，不表达难度或专业优劣。先看同一组字段，再进入同题双解。" />
          <div className="foundation-strip"><strong>共同底座</strong><span>{siteData.majors[0]?.foundation.slice(0, 4).join(' · ')}</span></div>
          <div className="card-grid card-grid-2">{siteData.majors.map((major) => <MajorQuickCompare key={major.id} major={major} input={major.foundation.slice(0, 2).join('、')} task={major.focus.slice(0, 2).join('、')} output={major.courseEvidence[0]?.detail ?? major.summary} />)}</div>
          <div className="module-action"><ArrowLink href="/majors/compare#dual-lens">查看同题双解</ArrowLink></div>
        </div>
      </section>

      <section className="section home-module" data-home-module="projects" id="home-projects">
        <div className="page-container">
          <SectionHeading eyebrow="02 / 今天可以做" title="三个现有项目，先看成本与边界" description="不筛选、不轮播；每张卡都先说明方向、时长、适合谁、产出和数据边界。" />
          <div className="project-grid home-project-grid">{siteData.projects.map((project) => <ProjectCapsuleCard key={project.id} project={project} majorMap={majorMap} />)}</div>
        </div>
      </section>

      <section className="section section-tint home-module" data-home-module="explore" id="home-explore">
        <div className="page-container">
          <SectionHeading eyebrow="03 / 继续探索" title="从一个意图继续走，不必一次读完整站" description="能力、场景、FAQ 和来源承担深度浏览；首页只保留能帮助下一步的入口。" />
          <div className="exploration-grid"><ExplorationLink href="/capabilities" title="能力地图" description="看课程正在形成什么能力" /><ExplorationLink href="/scenarios" title="去向场景" description="看共用能力与新增门槛" /><ExplorationLink href="/sources" title="来源与边界" description="查版本、许可与核验日期" /></div>
          <div className="home-faq"><SectionHeading eyebrow="学生常问" title="先回答会影响下一步的问题" action={<ArrowLink href="/majors/faq">查看全部 FAQ</ArrowLink>} /><FAQList items={siteData.faqs.slice(0, 2)} /></div>
          {primarySource ? <div className="home-source"><span>主要依据：{primarySource.title} · {primarySource.version} · 核验于 {primarySource.lastVerified}</span><ArrowLink href="/sources">查看完整登记</ArrowLink></div> : null}
        </div>
      </section>
    </>
  );
}
