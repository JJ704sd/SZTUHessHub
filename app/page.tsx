import Link from 'next/link';
import { siteData } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { ArrowLink, Badge, CapabilityCard, DualLensCard, FAQList, FoundationTable, LearningStory, MajorProfileCard, PageIntro, ProjectCapsuleCard, ScenarioCard, SectionHeading, SourceLine, StatStrip } from '@/components/site';

export default function HomePage() {
  const majorMap = new Map(siteData.majors.map((major) => [major.id, major]));
  const sourceMap = new Map(siteData.sources.map((source) => [source.id, source]));

  return (
    <>
      <section className="hero">
        <div className="page-container hero-grid">
          <div>
            <p className="eyebrow">健康工程 · 双专业 × 跨行业</p>
            <h1>{siteData.siteMeta.tagline}</h1>
            <p className="hero-lede">{siteData.siteMeta.description}</p>
            <div className="hero-actions"><Link className="button button-primary" href="/majors/compare">5 分钟看懂两个专业 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/projects">今天先试一个项目</Link></div>
          </div>
          <aside className="hero-note" aria-label="首版内容边界"><span className="hero-note-mark" aria-hidden="true">↗</span><div><strong>先说人话，再给正式来源</strong><span>默认展示 {siteConfig.currentCohort} 级内容；课程、能力、场景和项目都标注版本、来源与最后核验时间。</span></div></aside>
        </div>
        <div className="page-container"><StatStrip items={[{ value: String(siteData.majors.length), label: '同院工程专业' }, { value: String(siteData.capabilities.length), label: '类可迁移能力' }, { value: String(siteData.projects.length), label: '张首发体验卡' }]} /></div>
      </section>

      <section className="section" id="majors">
        <div className="page-container">
          <SectionHeading eyebrow="01 / 先把专业看懂" title="两个专业从不同工程侧面，服务同一类生命健康问题" description="共同底座不是起点的终点。下面先看培养方案反映出的侧重，再看它们如何在一个工程问题里交接。" action={<ArrowLink href="/majors">进入学院与专业</ArrowLink>} />
          <div className="card-grid card-grid-2">{siteData.majors.map((major) => <MajorProfileCard key={major.id} major={major} />)}</div>
        </div>
      </section>

      <section className="section section-tint" id="foundation">
        <div className="page-container foundation-wrap">
          <div className="foundation-callout"><p className="eyebrow">共同底座 · 不做排名</p><h2>先问“共同解决什么”，再问“各自更强调什么”。</h2><p>学分多少不等于难度高低。课程差异只用来解释工程任务与协作接口，不替学生选择专业。</p></div>
          <FoundationTable majors={siteData.majors} />
        </div>
      </section>

      <section className="section" id="dual-lens">
        <div className="page-container">
          <SectionHeading eyebrow="02 / 同题双解" title="同一个问题，两个专业为什么会给出不同但可以协作的答案？" description="每个案例都把角色、输入、输出、交接接口、共同产物和验收方法放在一起，而不是两段互不相干的专业介绍。" action={<ArrowLink href="/majors/compare#dual-lens">看完整对照</ArrowLink>} />
          <div className="dual-grid">{siteData.dualLensCases.map((item) => <DualLensCard key={item.id} item={item} majorMap={majorMap} />)}</div>
        </div>
      </section>

      <section className="section section-tint" id="capability-map">
        <div className="page-container">
          <SectionHeading eyebrow="03 / 能力不是行业标签" title={`${siteData.capabilities.length} 类能力，把课程连接到工程任务与真实场景`} description="每类能力都同时展示两个专业的课程证据、一个健康样例和一个跨行业样例；“学过”不等于“已经掌握”。" action={<ArrowLink href="/capabilities">浏览能力与课程</ArrowLink>} />
          <div className="card-grid card-grid-4">{siteData.capabilities.map((capability, index) => <CapabilityCard key={capability.id} capability={capability} index={index} majorMap={majorMap} />)}</div>
          <div className="transfer-band section-gap-top"><div className="transfer-box"><h3>共用方法</h3><p>例如：采集信号、理解数据、建立模型、验证结果、说明责任边界。</p></div><div className="transfer-arrow" aria-hidden="true">→</div><div className="transfer-box"><h3>新增门槛</h3><p>进入新场景仍要补领域知识、工具链、评价方法、标准与安全责任。</p></div></div>
        </div>
      </section>

      <section className="section" id="learning-story">
        <div className="page-container">
          <SectionHeading eyebrow="04 / 四年故事" title="课程不是终点，能力会在任务与作品里变得可证明" description="先建立共同底座，再通过专业侧重、工程实践和项目证据逐渐找到自己想继续验证的方向。" />
          <LearningStory major={siteData.majors[0]} />
        </div>
      </section>

      <section className="section section-tint" id="projects">
        <div className="page-container">
          <SectionHeading eyebrow="05 / 今天先试一个" title="打开外部工具之前，先知道需要什么、花多久、最后得到什么" description="首版不在站内运行模型，也不采集真实患者数据。体验卡负责解释、筛选和安全导览。" action={<ArrowLink href="/projects">查看全部体验卡</ArrowLink>} />
          <div className="project-grid">{siteData.projects.map((project) => <ProjectCapsuleCard key={project.id} project={project} majorMap={majorMap} />)}</div>
        </div>
      </section>

      <section className="section" id="scenarios">
        <div className="page-container">
          <SectionHeading eyebrow="06 / 能力迁移" title="医疗健康只是起点，方法会在不同约束下重新长出形状" description="每个场景都说明共用能力与额外门槛，不把跨行业迁移写成零成本通行证。" action={<ArrowLink href="/scenarios">浏览发展场景</ArrowLink>} />
          <div className="card-grid card-grid-3">{siteData.scenarios.map((scenario, index) => <ScenarioCard key={scenario.id} scenario={scenario} index={index} />)}</div>
        </div>
      </section>

      <section className="section section-tint" id="faq">
        <div className="page-container page-container-narrow">
          <SectionHeading eyebrow="07 / 学生常问" title="先回答会影响下一步的问题" description="正式课程名、学分和版本放在来源里；首页先让人能继续往下走。" action={<ArrowLink href="/majors/faq">查看全部 FAQ</ArrowLink>} />
          <FAQList items={siteData.faqs.slice(0, 4)} />
          <div className="source-line source-line-spaced"><span className="source-dot" aria-hidden="true" /><span>当前内容基线：{siteConfig.currentCohort} 级培养方案与学院公开介绍</span><Link className="text-link subtle-link" href="/sources">查看来源登记 <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </>
  );
}
