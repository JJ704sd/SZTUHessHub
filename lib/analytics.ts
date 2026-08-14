export type AnalyticsEnvironment = 'development' | 'preview' | 'production';
export type AnalyticsEvent =
  | { name: 'task_area_viewed'; surface: 'home'; sessionId: string }
  | { name: 'home_task_select'; taskId: 'compare' | 'capabilities' | 'project'; surface: 'hero' | 'task-grid' }
  | { name: 'dual_lens_open'; caseId: string; source: 'home' | 'compare' }
  | { name: 'capability_open'; capabilityId: string; source: 'home' | 'compare' | 'capabilities' }
  | { name: 'next_step_select'; from: 'capability_detail' | 'compare' | 'project_detail' | 'scenario_detail'; target: 'capability' | 'project' | 'scenario' }
  | { name: 'project_open'; projectId: string; source: 'home' | 'projects' | 'capability' | 'scenario' }
  | { name: 'starter_begin'; projectId: string; resourceId: string }
  | { name: 'external_resource_open'; projectId: string; resourceId: string };

const allowedEventFields: Record<AnalyticsEvent['name'], string[]> = {
  task_area_viewed: ['name', 'surface', 'sessionId'],
  home_task_select: ['name', 'taskId', 'surface'],
  dual_lens_open: ['name', 'caseId', 'source'],
  capability_open: ['name', 'capabilityId', 'source'],
  next_step_select: ['name', 'from', 'target'],
  project_open: ['name', 'projectId', 'source'],
  starter_begin: ['name', 'projectId', 'resourceId'],
  external_resource_open: ['name', 'projectId', 'resourceId'],
};

export function analyticsEnvironment(): AnalyticsEnvironment {
  const value = process.env.NEXT_PUBLIC_HSEEHUB_ENV ?? process.env.HSEEHUB_ENV;
  return value === 'preview' || value === 'production' ? value : 'development';
}

export function isPrivacySafeEvent(event: AnalyticsEvent) {
  const fields = Object.keys(event);
  return fields.every((field) => allowedEventFields[event.name]?.includes(field)) && !fields.some((field) => /url|query|text|email|name|ip|student|content/i.test(field) && field !== 'name');
}

export function trackEvent(event: AnalyticsEvent) {
  if (!isPrivacySafeEvent(event) || analyticsEnvironment() === 'production' || typeof window === 'undefined') return;
  window.setTimeout(() => console.debug(`[hseehub:event] ${event.name}`, event), 0);
}
