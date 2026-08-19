'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/content';
import type { ProjectResourceState } from '@/lib/content/project-resources';
import { Badge } from '@/components/site';
import { projectIntents, type ProjectIntent } from '@/lib/content/project-intents';

type LegacyFilters = { major?: string; capability?: string; scenario?: string; viewpoint?: string; duration?: string };

const intentCopy: Record<ProjectIntent, { label: string; feedback: string; order: string[] }> = {
  'quick-look': { label: '我先看 10 分钟', feedback: '先把合成信号分类放在前面。这是 10 分钟导览；完整实践约 90 分钟。', order: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
  'data-ai': { label: '我想碰数据 / AI', feedback: '先看数据、特征和结果解释会做什么；三个项目仍然都可以比较。', order: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'] },
  sensor: { label: '我想动手接传感器', feedback: '先看传感—采样—告警。优先使用仿真或低压台架，完整实践约 2 小时。', order: ['project-sensor-alarm-prototype', 'project-signal-feature-notebook', 'project-material-test-matrix'] },
  portfolio: { label: '我想做一份能展示的作品', feedback: '三个项目都会留下作品记录；先比较时间、媒介和你愿意讲清楚的过程。', order: ['project-signal-feature-notebook', 'project-material-test-matrix', 'project-sensor-alarm-prototype'] },
};

type Props = { projects: Project[]; resourceStates: Record<string, ProjectResourceState>; initialIntent?: ProjectIntent; legacyFilters?: LegacyFilters; legacyNotice?: 'active' | 'invalid' };

function matchesLegacy(project: Project, filters: LegacyFilters) {
  return (!filters.major || project.majorIds.includes(filters.major))
    && (!filters.capability || project.capabilityIds.includes(filters.capability))
    && (!filters.scenario || project.scenarioIds.includes(filters.scenario))
    && (!filters.viewpoint || project.viewpoint === filters.viewpoint)
    && (!filters.duration || project.durationBands.includes(filters.duration));
}

export function ProjectBrowser({ projects, resourceStates, initialIntent, legacyFilters = {}, legacyNotice }: Props) {
  const [intent, setIntent] = useState<ProjectIntent | undefined>(initialIntent);
  const [showLegacy, setShowLegacy] = useState(Boolean(legacyNotice));
  const [useLegacy, setUseLegacy] = useState(legacyNotice === 'active');
  const visibleProjects = useMemo(() => {
    if (useLegacy) return projects.filter((project) => matchesLegacy(project, legacyFilters));
    if (!intent) return projects;
    const order = intentCopy[intent].order;
    return [...projects].sort((left, right) => order.indexOf(left.id) - order.indexOf(right.id));
  }, [intent, legacyFilters, projects, useLegacy]);

  function chooseIntent(nextIntent: ProjectIntent) {
    setIntent(nextIntent); setUseLegacy(false); setShowLegacy(false);
    window.history.replaceState(null, '', `/projects?intent=${nextIntent}`);
  }
  function clearCompatibility() {
    setUseLegacy(false); setShowLegacy(false); setIntent(undefined);
    window.history.replaceState(null, '', '/projects');
  }

  return <>
    {showLegacy ? <div className="legacy-filter-notice" role="status"><div><strong>{legacyNotice === 'active' ? '正在使用旧筛选链接' : '这个链接里的筛选或意图值已经无法识别'}</strong><span>{legacyNotice === 'active' ? '结果仍按原条件展示；你也可以切换到新的学生意图入口。' : '为了不把页面静默清空，现已展示全部项目。'}</span></div><button type="button" className="clear-button" onClick={clearCompatibility}>关闭并看全部</button></div> : null}
    <nav className="intent-picker" aria-label="按现在想做的事选择项目">{projectIntents.map((item) => <Link key={item} href={`/projects?intent=${item}`} className={intent === item && !useLegacy ? 'intent-link is-active' : 'intent-link'} aria-current={intent === item && !useLegacy ? 'page' : undefined} onClick={(event) => { event.preventDefault(); chooseIntent(item); }}>{intentCopy[item].label}</Link>)}</nav>
    <p className="intent-feedback" aria-live="polite">{useLegacy ? `旧链接找到 ${visibleProjects.length} 个项目。兼容期内仍按原条件展示。` : intent ? intentCopy[intent].feedback : '先选一句最像你现在想法的话。它只改变顺序，不会替你隐藏其他项目。'}</p>
    {visibleProjects.length > 0 ? <div className="project-list release-b-project-list">{visibleProjects.map((project, index) => {
      const status = resourceStates[project.id]; const preview = project.previewAssets[0];
      return <article className={index === 0 && !useLegacy ? 'project-list-card is-featured' : 'project-list-card'} key={project.id}><div className="project-list-visual"><img src={preview.src} alt={preview.alt} width="560" height="360" loading={index === 0 ? 'eager' : 'lazy'} /></div><div className="project-list-body"><div className="card-topline"><Badge tone={project.majorIds.length > 1 ? 'amber' : 'teal'}>{project.kicker}</Badge><span className="card-kicker">{project.viewpoint}</span></div><h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2><p className="project-card-line"><strong>适合谁</strong>{project.suitableFor}</p><p className="project-card-line"><strong>会留下</strong>{project.expectedOutput}</p><dl className="project-meta-grid"><div><dt>时长</dt><dd>{project.duration}</dd></div><div><dt>最低基础</dt><dd>{project.prerequisites[0]}</dd></div><div><dt>现在能否开始</dt><dd className={`resource-state resource-state-${status.key}`}>{status.label}</dd></div></dl><div className="project-card-action"><span>{status.description}</span><Link className="button button-secondary" href={`/projects/${project.slug}`}>看看今天怎么开始 <span aria-hidden="true">→</span></Link></div></div></article>;
    })}</div> : <div className="empty-state"><h2>旧筛选暂时没有匹配项目</h2><p>兼容链接仍被正确解析；你可以关闭旧筛选，回到三个项目。</p><button className="button button-secondary" type="button" onClick={clearCompatibility}>回到全部项目</button></div>}
  </>;
}
