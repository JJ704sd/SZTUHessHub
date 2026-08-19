import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SectionHeading } from '@/components/site';
import { getHomePageModel } from '@/lib/content/view-models';

export const metadata: Metadata = {
  title: '还没想好从哪里开始',
  description: '用已有资产、双路径短实验和复盘问题形成一到两条候选发展路径。',
  alternates: { canonical: '/pathways/explore' },
};

export default function PathwayExplorePage() {
  const model = getHomePageModel();
  return <div className="page-container pathway-explore-page">
    <PageIntro eyebrow="未定方向 · 独立工具页" title="还没想好，也可以先走一小步。" description="这里不测出你适合什么，也不把暂时的选择写入服务器。用一周双路径实验和一份空白复盘单，留下可观察的线索。"><Link className="button button-primary" href="#two-path-experiment">开始一周双路径实验 <span aria-hidden="true">↓</span></Link><a className="button button-secondary" href="/pathway-review-template.txt" download>下载空白复盘单</a></PageIntro>

    <section className="detail-block" id="two-path-experiment"><SectionHeading eyebrow="01 / 先留下两条候选路" title="不做单选题，先挑两条愿意观察的路" description="从下面五条里选两条写在纸上或本地文档中。站点不保存你的选择。" /><div className="pathway-explore-choice-list">{model.pathways.map((pathway) => <article className="pathway-explore-choice" key={pathway.id}><span className={`pathway-kind-label pathway-kind-${pathway.kind}`}>{pathway.title}</span><p>{pathway.question}</p><span>最小行动：{pathway.defaultAction.title}</span><Link className="text-link" href={pathway.href}>先看详情 <span aria-hidden="true">↗</span></Link></article>)}</div></section>

    <section className="detail-block"><SectionHeading eyebrow="02 / 一周双路径实验" title="让两条路都做一次小任务" description="同一周内分别完成两个 15 分钟到 7 天的低成本行动，观察你愿意反复做什么、哪里最需要补门槛。" /><div className="pathway-experiment-grid"><article><span className="pathway-experiment-number">A</span><h3>我愿意做的任务</h3><ul><li>这条路每天真正要解决什么问题？</li><li>我愿意重复哪一项任务？</li><li>我在哪一步开始失去兴趣或需要帮助？</li></ul></article><article><span className="pathway-experiment-number">B</span><h3>我留下的证据</h3><ul><li>我实际完成了什么产出？</li><li>它能证明我做过什么，不能证明什么？</li><li>下一次会缩小范围、换路还是补能力？</li></ul></article></div></section>

    <section className="detail-block"><SectionHeading eyebrow="03 / 已有证据盘点" title="先看手里已经有的，再决定新投入" description="只记录你愿意在本地保存的摘要，不上传成绩、简历、证件、申请材料或个人画像。" /><div className="pathway-inventory"><label htmlFor="inventory-artifact">我已经做过的一个课程/项目产物</label><textarea id="inventory-artifact" className="pathway-writing-line" aria-label="本地填写区" placeholder="写下名称、输入、输出、过程和限制……" rows={3} /><label htmlFor="inventory-gap">它还不能证明什么</label><textarea id="inventory-gap" className="pathway-writing-line" aria-label="本地填写区" placeholder="写下资格、经验、结果或合规方面的缺口……" rows={3} /></div></section>

    <section className="detail-block"><SectionHeading eyebrow="04 / 访谈问题模板" title="把问题带给教师、校友或从业者" description="访谈是了解任务的方式，不是收集未经授权的个人故事，也不替代官方资格答复。" /><ol className="pathway-interview-list"><li>你每周真正花时间解决的三类任务是什么？</li><li>新人最容易低估的知识、工具或责任是什么？</li><li>什么样的学习产物能帮助你判断对方做过什么？</li><li>什么信号出现时，你会建议对方暂停或换一条路？</li><li>哪些条件必须回到单位、机构或主管部门官方入口确认？</li></ol></section>

    <section className="detail-block" id="explore-review"><SectionHeading eyebrow="05 / 30 天后复盘" title="继续、组合、更换，或者暂时不决定" description="复盘结果可以留在本地复盘单中，不需要登录。选择的变化不是失败，而是新的证据。" /><div className="pathway-review-grid"><article><strong>继续</strong><p>我愿意持续做这类任务，缺口也有可行的补法。</p></article><article><strong>组合</strong><p>两条路共享一部分能力和产物，我想保留两种可能。</p></article><article><strong>更换</strong><p>短实验让我发现任务或成本不适合现在，换一条路再试。</p></article></div><div className="callout"><p><strong>下一步：</strong>回到 <Link className="text-link" href="/pathways">五类路径总览</Link>，或者从 <Link className="text-link" href="/majors">专业、能力和项目</Link> 继续建立证据。</p></div></section>
  </div>;
}
