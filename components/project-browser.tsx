'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProjectCatalogItem, RelationLink } from '@/lib/content/view-models';
import { filterProjectCatalog, type ProjectFilterState } from '@/lib/content/filters';
import { Badge, StatusBadge } from '@/components/ui/primitives';

type FilterKey = 'major' | 'capability' | 'scenario' | 'viewpoint' | 'duration';
type FilterState = ProjectFilterState;

type Props = {
  projects: ProjectCatalogItem[];
  filters: { major: RelationLink[]; capability: RelationLink[]; scenario: RelationLink[]; viewpoint: string[]; duration: string[] };
  initialFilters?: Partial<FilterState>;
};

const emptyFilters: FilterState = { major: 'all', capability: 'all', scenario: 'all', viewpoint: 'all', duration: 'all' };
const defaultInitialFilters: Partial<FilterState> = {};

function filtersFromLocation(): FilterState {
  if (typeof window === 'undefined') return emptyFilters;
  const params = new URLSearchParams(window.location.search);
  return {
    major: params.get('major') ?? 'all',
    capability: params.get('capability') ?? 'all',
    scenario: params.get('scenario') ?? 'all',
    viewpoint: params.get('viewpoint') ?? 'all',
    duration: params.get('duration') ?? 'all',
  };
}

function labelForStatus(status: ProjectCatalogItem['resourceHealth']['status']) {
  return { available: '资源可用', degraded: '资源有替代入口', unverified: '待人工核验', unavailable: '资源暂不可用' }[status];
}

export function ProjectBrowser({ projects, filters, initialFilters = defaultInitialFilters }: Props) {
  const [selected, setSelected] = useState<FilterState>({ ...emptyFilters, ...initialFilters });
  useEffect(() => {
    if (Object.keys(initialFilters).length === 0) setSelected(filtersFromLocation());
  }, [initialFilters]);
  const activeCount = Object.values(selected).filter((value) => value !== 'all').length;
  const filtered = useMemo(() => filterProjectCatalog(projects, selected), [projects, selected]);

  function updateUrl(next: FilterState) {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value !== 'all') params.set(key, value); });
    window.history.replaceState(null, '', params.toString() ? `/projects?${params.toString()}` : '/projects');
  }

  function setFilter(key: FilterKey, value: string) {
    const next = { ...selected, [key]: value };
    setSelected(next);
    updateUrl(next);
  }

  function clearFilters() {
    setSelected(emptyFilters);
    updateUrl(emptyFilters);
  }

  const projectLabels = (ids: string[], options: RelationLink[]) => ids.map((id) => options.find((item) => item.id === id)?.label).filter(Boolean) as string[];

  return <>
    <div className="project-controls" aria-label="项目快捷筛选">
      <div className="quick-filter-heading"><div><p className="eyebrow">结果优先</p><strong>先比较 3 张体验卡，再按需缩小范围</strong></div>{activeCount > 0 ? <button className="clear-button" type="button" onClick={clearFilters}>清除 {activeCount} 个条件</button> : null}</div>
      <div className="quick-filter-grid">
        <label className="filter-control" htmlFor="filter-duration"><span>预计时长</span><select id="filter-duration" value={selected.duration} onChange={(event) => setFilter('duration', event.target.value)}><option value="all">全部时长</option>{filters.duration.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="filter-control" htmlFor="filter-viewpoint"><span>项目视角</span><select id="filter-viewpoint" value={selected.viewpoint} onChange={(event) => setFilter('viewpoint', event.target.value)}><option value="all">全部视角</option>{filters.viewpoint.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <details className="advanced-filters" open={activeCount > 0 && (selected.major !== 'all' || selected.capability !== 'all' || selected.scenario !== 'all')}>
        <summary>更多筛选 <span aria-hidden="true">＋</span></summary>
        <div className="filter-grid">
          <label className="filter-control" htmlFor="filter-major"><span>专业透镜</span><select id="filter-major" value={selected.major} onChange={(event) => setFilter('major', event.target.value)}><option value="all">全部专业</option>{filters.major.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-capability"><span>能力</span><select id="filter-capability" value={selected.capability} onChange={(event) => setFilter('capability', event.target.value)}><option value="all">全部能力</option>{filters.capability.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-scenario"><span>场景</span><select id="filter-scenario" value={selected.scenario} onChange={(event) => setFilter('scenario', event.target.value)}><option value="all">全部场景</option>{filters.scenario.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
      </details>
    </div>

    <div className="active-filter-row" role="region" aria-label="已选筛选条件">{(Object.entries(selected) as Array<[FilterKey, string]>).filter(([, value]) => value !== 'all').map(([key, value]) => <button className="filter-chip" type="button" key={key} onClick={() => setFilter(key, 'all')}><span>{value}</span><span aria-hidden="true">×</span><span className="sr-only">移除</span></button>)}</div>
    <div className="result-summary" aria-live="polite"><strong>{filtered.length}</strong> 张体验卡 {activeCount > 0 ? '符合当前条件' : '可供选择'}</div>
    {filtered.length > 0 ? <div className="project-list">{filtered.map((project) => {
      const majorLabels = projectLabels(project.majorIds, filters.major);
      const capabilityLabels = projectLabels(project.capabilityIds, filters.capability);
      return <article className="project-list-card" key={project.id}>
        <div className="project-list-visual"><img src={project.visualAsset.src} width={project.visualAsset.width} height={project.visualAsset.height} alt={project.visualAsset.alt} loading="lazy" /><span>{project.visualAsset.alt}</span></div>
        <div className="project-list-content"><div className="card-topline"><Badge tone={project.mode === 'cross-major' ? 'amber' : 'teal'}>{project.mode === 'cross-major' ? '双专业协作' : '单人体验'}</Badge><span className="card-kicker">{project.durationLabel}</span></div><h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2><p>{project.cardSummary}</p><div className="tag-row">{majorLabels.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}{capabilityLabels.slice(0, 2).map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><div className="project-signal-row"><span>基础：{project.prerequisiteSummary}</span><span>产出：{project.outputSummary}</span><span>{project.dataStatus}</span></div></div>
        <div className="project-list-side"><StatusBadge status={project.resourceHealth.status} label={labelForStatus(project.resourceHealth.status)} /><span className="project-viewpoint">{project.viewpoint}</span><span>数据：{project.dataSensitivity === 'none' ? '无敏感信息' : project.dataSensitivity}</span><Link className="button button-secondary" href={`/projects/${project.slug}`}>{project.primaryAction.label} <span aria-hidden="true">→</span></Link></div>
      </article>;
    })}</div> : <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌁</span><h2>暂时没有匹配的体验卡</h2><p>换一个条件，或者清除筛选回到全部项目。</p><button className="button button-secondary" type="button" onClick={clearFilters}>回到全部项目</button></div>}
  </>;
}
