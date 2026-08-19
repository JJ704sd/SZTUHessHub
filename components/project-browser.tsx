'use client';

import Link from 'next/link';
import type { ProjectCatalogItem, RelationLink } from '@/lib/content/view-models';
import { projectIntents, type ProjectIntent } from '@/lib/content/project-intents';
import { clearLegacyProjectFilters, filterProjectCatalog, removeLegacyProjectFilter, type ParsedLegacyProjectFilters, type ProjectSearchParams } from '@/lib/content/filters';
import { Badge, StatusBadge } from '@/components/ui/primitives';

const intentCopy: Record<ProjectIntent, { label: string; feedback: string; order: string[] }> = {
  'quick-look': { label: '我先看 10 分钟', feedback: '这是 10 分钟导览；完整实践仍要按项目页标注的时间完成。', order: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
  'data-ai': { label: '我想碰数据 / AI', feedback: '先看数据、特征和结果解释会做什么；三个项目仍然都可以比较。', order: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
  sensor: { label: '我想动手接传感器', feedback: '先看传感—采样—告警；完整实践约 2 小时，优先使用仿真或低压台架。', order: ['project-sensor-alarm-prototype', 'project-signal-feature-notebook', 'project-material-test-matrix'] },
  portfolio: { label: '我想做一份能展示的作品', feedback: '三个项目都会留下作品记录；先比较时间、媒介和你愿意讲清楚的过程。', order: ['project-signal-feature-notebook', 'project-material-test-matrix', 'project-sensor-alarm-prototype'] },
};

type Props = {
  projects: ProjectCatalogItem[];
  filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] };
  legacyFilters: ParsedLegacyProjectFilters;
  searchParams: ProjectSearchParams;
  intent?: ProjectIntent;
  invalidIntent?: boolean;
};

function labelForStatus(status: ProjectCatalogItem['resourceHealth']['status']) {
  return { available: '资源可用', degraded: '有替代入口', unverified: '待人工核验', unavailable: '暂不可开始' }[status];
}

export function ProjectBrowser({ projects, filters, legacyFilters, searchParams, intent, invalidIntent = false }: Props) {
  const hasLegacyConditions = legacyFilters.valid.length > 0 || legacyFilters.invalid.length > 0;
  const legacyResults = filterProjectCatalog(projects, legacyFilters.values);
  const ordered = intent && legacyFilters.valid.length === 0
    ? [...projects].sort((left, right) => intentCopy[intent].order.indexOf(left.id) - intentCopy[intent].order.indexOf(right.id))
    : legacyResults;
  const projectLabels = (ids: string[], options: RelationLink[]) => ids.map((id) => options.find((item) => item.id === id)?.label).filter(Boolean) as string[];

  return <>
    {hasLegacyConditions ? <section className="legacy-filter-notice" role="status" aria-label="旧项目链接条件"><div><p className="eyebrow">兼容旧链接</p><strong>{legacyFilters.valid.length ? '正在使用旧筛选链接' : '筛选或意图值已经无法识别'}</strong><div className="condition-list">{legacyFilters.valid.map((condition) => <span className="condition-pill" key={condition.key}><span>{condition.label}</span><Link href={removeLegacyProjectFilter(searchParams, condition.key)} aria-label={`移除旧链接条件：${condition.label}`}>×</Link></span>)}</div>{legacyFilters.invalid.length > 0 ? <p className="invalid-condition-message">已忽略无效条件：{legacyFilters.invalid.map((condition) => `${condition.key}=${condition.value}`).join('、')}。页面不会静默清空。</p> : null}</div><Link className="clear-button" href={clearLegacyProjectFilters()}>关闭并看全部</Link></section> : null}
    {invalidIntent ? <p className="legacy-filter-notice" role="status">筛选或意图值已经无法识别，现已保留全部项目供你比较。</p> : null}

    <nav className="intent-picker" aria-label="按现在想做的事选择项目">{projectIntents.map((item) => <Link key={item} href={`/projects?intent=${item}#project-list`} className={intent === item && legacyFilters.valid.length === 0 ? 'intent-link is-active' : 'intent-link'} aria-current={intent === item && legacyFilters.valid.length === 0 ? 'page' : undefined}>{intentCopy[item].label}</Link>)}</nav>
    <p className="intent-feedback">{legacyFilters.valid.length ? `旧链接找到 ${ordered.length} 个项目；兼容期内继续按原条件展示。` : intent ? intentCopy[intent].feedback : '先选一句最像你现在想法的话。它只改变顺序，不会替你隐藏其他项目。'}</p>

    {ordered.length > 0 ? <div className="project-list release-b-project-list">{ordered.map((project, index) => {
      const majorLabels = projectLabels(project.majorIds, filters.major);
      return <article className={index === 0 && legacyFilters.valid.length === 0 ? 'project-list-card is-featured' : 'project-list-card'} key={project.id}>
        <div className="project-list-visual"><img src={project.visualAsset.src} width={project.visualAsset.width} height={project.visualAsset.height} alt={project.visualAsset.alt} loading={index === 0 ? 'eager' : 'lazy'} /></div>
        <div className="project-list-body"><div className="card-topline"><Badge tone={project.mode === 'cross-major' ? 'amber' : 'teal'}>{project.mode === 'cross-major' ? '双专业协作' : majorLabels[0] ?? '单人体验'}</Badge><span className="card-kicker">{project.viewpoint}</span></div><h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2><p className="project-card-line"><strong>适合谁</strong>{project.cardSummary}</p><p className="project-card-line"><strong>会留下</strong>{project.outputSummary}</p><dl className="project-meta-grid"><div><dt>时长</dt><dd>{project.durationLabel}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisiteSummary}</dd></div><div><dt>现在能否开始</dt><dd><StatusBadge status={project.resourceHealth.status} label={labelForStatus(project.resourceHealth.status)} /></dd></div></dl><div className="project-card-action"><span>{project.resourceHealth.note ?? '打开前先核对资源状态。'}</span><Link className="button button-secondary" href={`/projects/${project.slug}`}>看看今天怎么开始 <span aria-hidden="true">→</span></Link></div></div>
      </article>;
    })}</div> : <div className="empty-state"><h2>旧筛选暂时没有匹配项目</h2><p>这些条件有效，但组合后没有项目。清除旧条件即可回到全部项目。</p><Link className="button button-secondary" href={clearLegacyProjectFilters()}>回到全部项目</Link></div>}
  </>;
}
