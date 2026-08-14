import Link from 'next/link';
import type { ProjectCatalogItem, RelationLink } from '@/lib/content/view-models';
import { clearLegacyProjectFilters, filterProjectCatalog, removeLegacyProjectFilter, type ParsedLegacyProjectFilters, type ProjectSearchParams } from '@/lib/content/filters';
import { Badge, StatusBadge } from '@/components/ui/primitives';
import { TrackedLink } from '@/components/tracked-link';

type Props = {
  projects: ProjectCatalogItem[];
  filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] };
  legacyFilters: ParsedLegacyProjectFilters;
  searchParams: ProjectSearchParams;
};

function labelForStatus(status: ProjectCatalogItem['resourceHealth']['status']) {
  return { available: '资源可用', degraded: '资源有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[status];
}

export function ProjectBrowser({ projects, filters, legacyFilters, searchParams }: Props) {
  const filtered = filterProjectCatalog(projects, legacyFilters.values);
  const hasLegacyConditions = legacyFilters.valid.length > 0 || legacyFilters.invalid.length > 0;
  const projectLabels = (ids: string[], options: RelationLink[]) => ids.map((id) => options.find((item) => item.id === id)?.label).filter(Boolean) as string[];

  return <>
    {hasLegacyConditions ? <section className="legacy-filter-summary" aria-label="旧项目链接条件"><div><p className="eyebrow">兼容旧链接</p><strong>已应用的条件只读显示，可逐项移除</strong><div className="condition-list">{legacyFilters.valid.map((condition) => <span className="condition-pill" key={condition.key}><span>{condition.label}</span><Link href={removeLegacyProjectFilter(searchParams, condition.key)} aria-label={`移除旧链接条件：${condition.label}`}>×</Link></span>)}</div>{legacyFilters.invalid.length > 0 ? <p className="invalid-condition-message" role="status" aria-live="polite">已忽略无效旧链接条件：{legacyFilters.invalid.map((condition) => `${condition.key}=${condition.value}`).join('、')}。页面仍保留可用项目。</p> : null}</div><Link className="clear-button" href={clearLegacyProjectFilters()}>清除全部</Link></section> : null}

    <div className="result-summary" aria-live="polite"><strong>{filtered.length}</strong> 张体验卡 {legacyFilters.valid.length > 0 ? '符合已应用条件' : '可供选择'}</div>
    {filtered.length > 0 ? <div className="project-list">{filtered.map((project) => {
      const majorLabels = projectLabels(project.majorIds, filters.major);
      const capabilityLabels = projectLabels(project.capabilityIds, filters.capability);
      return <article className="project-list-card" key={project.id}>
        <div className="project-list-visual"><img src={project.visualAsset.src} width={project.visualAsset.width} height={project.visualAsset.height} alt={project.visualAsset.alt} loading="lazy" /><span>{project.visualAsset.alt}</span></div>
        <div className="project-list-content"><div className="card-topline"><Badge tone={project.mode === 'cross-major' ? 'amber' : 'teal'}>{project.mode === 'cross-major' ? '双专业协作' : '单人体验'}</Badge><span className="card-kicker">{project.durationLabel}</span></div><h2><TrackedLink href={`/projects/${project.slug}`} event={{ name: 'project_open', projectId: project.id, source: 'projects' }}>{project.title}</TrackedLink></h2><p>{project.cardSummary}</p><div className="tag-row">{majorLabels.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}{capabilityLabels.slice(0, 2).map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><div className="project-signal-row"><span>基础：{project.prerequisiteSummary}</span><span>产出：{project.outputSummary}</span><span>{project.dataStatus}</span></div></div>
        <div className="project-list-side"><StatusBadge status={project.resourceHealth.status} label={labelForStatus(project.resourceHealth.status)} /><span className="project-viewpoint">{project.viewpoint}</span><span>数据：{project.dataSensitivity === 'none' ? '无敏感信息' : project.dataSensitivity}</span><TrackedLink className="button button-secondary" href={`/projects/${project.slug}`} event={{ name: 'project_open', projectId: project.id, source: 'projects' }}>{project.primaryAction.label} <span aria-hidden="true">→</span></TrackedLink></div>
      </article>;
    })}</div> : <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌁</span><h2>当前条件没有匹配的体验卡</h2><p>这些条件都有效，但组合后没有项目；清除旧链接条件即可回到全部项目。</p><Link className="button button-secondary" href={clearLegacyProjectFilters()}>回到全部项目</Link></div>}
  </>;
}
