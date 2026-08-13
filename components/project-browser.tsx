'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Major, Project, Scenario, Capability } from '@/lib/content';
import { Badge } from '@/components/site';

type Props = {
  projects: Project[];
  majors: Major[];
  capabilities: Capability[];
  scenarios: Scenario[];
  initialFilters?: { major?: string; capability?: string; scenario?: string; viewpoint?: string; duration?: string };
};

export function ProjectBrowser({ projects, majors, capabilities, scenarios, initialFilters = {} }: Props) {
  const [major, setMajor] = useState(initialFilters.major ?? 'all');
  const [capability, setCapability] = useState(initialFilters.capability ?? 'all');
  const [scenario, setScenario] = useState(initialFilters.scenario ?? 'all');
  const [viewpoint, setViewpoint] = useState(initialFilters.viewpoint ?? 'all');
  const [duration, setDuration] = useState(initialFilters.duration ?? 'all');

  const filtered = useMemo(() => projects.filter((project) => {
    const majorMatch = major === 'all' || project.majorIds.includes(major);
    const capabilityMatch = capability === 'all' || project.capabilityIds.includes(capability);
    const scenarioMatch = scenario === 'all' || project.scenarioIds.includes(scenario);
    const viewpointMatch = viewpoint === 'all' || project.viewpoint === viewpoint;
    const durationMatch = duration === 'all' || project.durationBands.includes(duration);
    return majorMatch && capabilityMatch && scenarioMatch && viewpointMatch && durationMatch;
  }), [capability, duration, major, projects, scenario, viewpoint]);

  const updateUrl = (next: { major?: string; capability?: string; scenario?: string; viewpoint?: string; duration?: string }) => {
    const params = new URLSearchParams();
    const values = { major, capability, scenario, viewpoint, duration, ...next };
    Object.entries(values).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
    window.history.replaceState(null, '', params.toString() ? `/projects?${params.toString()}` : '/projects');
  };

  const setFilter = (key: 'major' | 'capability' | 'scenario' | 'viewpoint' | 'duration', value: string) => {
    if (key === 'major') setMajor(value);
    if (key === 'capability') setCapability(value);
    if (key === 'scenario') setScenario(value);
    if (key === 'viewpoint') setViewpoint(value);
    if (key === 'duration') setDuration(value);
    updateUrl({ [key]: value });
  };

  function clearFilters() {
    setMajor('all'); setCapability('all'); setScenario('all'); setViewpoint('all'); setDuration('all');
    window.history.replaceState(null, '', '/projects');
  }

  const activeCount = [major, capability, scenario, viewpoint, duration].filter((value) => value !== 'all').length;

  return (
    <>
      <div className="filter-panel" aria-label="项目筛选">
        <div className="filter-panel-head"><div><p className="eyebrow">按你的下一步来找</p><strong>先看清成本，再决定要不要打开外部工具</strong></div>{activeCount > 0 ? <button className="clear-button" type="button" onClick={clearFilters}>清除 {activeCount} 个条件</button> : null}</div>
        <div className="filter-grid">
          <label className="filter-control" htmlFor="filter-major"><span>专业透镜</span><select id="filter-major" value={major} onChange={(event) => setFilter('major', event.target.value)}><option value="all">全部专业</option>{majors.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-capability"><span>能力</span><select id="filter-capability" value={capability} onChange={(event) => setFilter('capability', event.target.value)}><option value="all">全部能力</option>{capabilities.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-scenario"><span>场景</span><select id="filter-scenario" value={scenario} onChange={(event) => setFilter('scenario', event.target.value)}><option value="all">全部场景</option>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-viewpoint"><span>项目视角</span><select id="filter-viewpoint" value={viewpoint} onChange={(event) => setFilter('viewpoint', event.target.value)}><option value="all">全部视角</option>{Array.from(new Set(projects.map((item) => item.viewpoint))).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="filter-control" htmlFor="filter-duration"><span>预计时长</span><select id="filter-duration" value={duration} onChange={(event) => setFilter('duration', event.target.value)}><option value="all">全部时长</option>{Array.from(new Set(projects.flatMap((item) => item.durationBands))).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="result-summary" aria-live="polite"><strong>{filtered.length}</strong> 张体验卡 {activeCount > 0 ? '符合当前条件' : '可供选择'}</div>
      {filtered.length > 0 ? <div className="project-list">{filtered.map((project) => {
        const projectMajors = project.majorIds.map((id) => majors.find((item) => item.id === id)?.shortName).filter(Boolean);
        const projectCapabilities = project.capabilityIds.map((id) => capabilities.find((item) => item.id === id)?.shortName).filter(Boolean);
        const projectScenarios = project.scenarioIds.map((id) => scenarios.find((item) => item.id === id)?.name).filter(Boolean);
        return <article className="project-list-card" key={project.id}><div><div className="card-topline"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><span className="card-kicker">{project.duration}</span></div><h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2><p>{project.summary}</p><div className="tag-row">{projectMajors.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}{projectCapabilities.slice(0, 2).map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><p className="list-detail"><span>场景</span>{projectScenarios.join('、')}</p></div><div className="project-list-side"><span className="project-viewpoint">{project.viewpoint}</span><span>适合：{project.suitableFor}</span><span>产出：{project.expectedOutput}</span><Link className="button button-secondary" href={`/projects/${project.slug}`}>查看体验卡 <span aria-hidden="true">→</span></Link></div></article>;
      })}</div> : <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌁</span><h2>暂时没有匹配的体验卡</h2><p>换一个专业或时长条件，或者清除筛选回到全部项目。</p><button className="button button-secondary" type="button" onClick={clearFilters}>回到全部项目</button></div>}
    </>
  );
}
