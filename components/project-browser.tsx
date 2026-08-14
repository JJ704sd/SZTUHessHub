import Link from 'next/link';
import type { Capability, Major, Project, Scenario } from '@/lib/content';
import { Badge } from '@/components/site';
import { TrackedLink } from '@/components/tracked-link';
import { filterProjects, projectFilterSummaryHref, removeProjectFilter, type ParsedProjectFilters, type ProjectSearchParams } from '@/lib/project-filters';

type Props = {
  projects: Project[];
  majors: Major[];
  capabilities: Capability[];
  scenarios: Scenario[];
  parsedFilters: ParsedProjectFilters;
  searchParams: ProjectSearchParams;
};

export function ProjectBrowser({ projects, majors, capabilities, scenarios, parsedFilters, searchParams }: Props) {
  const filtered = filterProjects(projects, parsedFilters.values);
  const majorMap = new Map(majors.map((item) => [item.id, item.shortName]));
  const capabilityMap = new Map(capabilities.map((item) => [item.id, item.shortName]));
  const scenarioMap = new Map(scenarios.map((item) => [item.id, item.name]));
  const hasLegacyConditions = parsedFilters.valid.length > 0 || parsedFilters.invalid.length > 0;

  return <>
    {hasLegacyConditions ? <section className="legacy-filter-summary" aria-label="旧项目链接条件"><div><p className="eyebrow">兼容旧链接</p><strong>已应用的条件只读显示，可逐项移除</strong><div className="condition-list">{parsedFilters.valid.map((condition) => <span className="condition-pill" key={condition.key}><span>{condition.label}</span><Link href={removeProjectFilter(searchParams, condition.key)} aria-label={`移除旧链接条件：${condition.label}`}>×</Link></span>)}</div>{parsedFilters.invalid.length > 0 ? <p className="invalid-condition-message" role="status" aria-live="polite">已忽略无效旧链接条件：{parsedFilters.invalid.map((condition) => `${condition.key}=${condition.value}`).join('、')}。页面仍保留可用项目。</p> : null}</div><Link className="clear-button" href={projectFilterSummaryHref()}>清除全部</Link></section> : null}

    <div className="result-summary" aria-live="polite"><strong>{filtered.length}</strong> 张体验卡 {parsedFilters.valid.length > 0 ? '符合已应用条件' : '可供选择'}</div>
    {filtered.length > 0 ? <div className="project-list">{filtered.map((project) => {
      const projectMajors = project.majorIds.map((id) => majorMap.get(id)).filter(Boolean);
      const projectCapabilities = project.capabilityIds.map((id) => capabilityMap.get(id)).filter(Boolean);
      const projectScenarios = project.scenarioIds.map((id) => scenarioMap.get(id)).filter(Boolean);
      return <article className="project-list-card" key={project.id}><div><div className="card-topline"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><span className="card-kicker">{project.duration}</span></div><h2><TrackedLink href={`/projects/${project.slug}`} event={{ name: 'project_open', projectId: project.id, source: 'projects' }}>{project.title}</TrackedLink></h2><p>{project.summary}</p><div className="tag-row">{projectMajors.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}{projectCapabilities.slice(0, 2).map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><p className="list-detail"><span>场景</span>{projectScenarios.join('、')}</p></div><div className="project-list-side"><span className="project-viewpoint">{project.viewpoint}</span><span>适合：{project.suitableFor}</span><span>先修：{project.prerequisites.join('；')}</span><span>产出：{project.expectedOutput}</span><span>数据边界：{project.dataAccess}</span><TrackedLink className="button button-secondary" href={`/projects/${project.slug}`} event={{ name: 'project_open', projectId: project.id, source: 'projects' }}>查看体验卡 <span aria-hidden="true">→</span></TrackedLink></div></article>;
    })}</div> : <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌁</span><h2>当前条件没有匹配的体验卡</h2><p>这些条件都有效，但组合后没有项目；清除旧链接条件即可回到全部项目。</p><Link className="button button-secondary" href={projectFilterSummaryHref()}>回到全部项目</Link></div>}
  </>;
}
