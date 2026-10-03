import 'server-only';

import { z } from 'zod';
import rawCareerGuide from '../../content/career-guide.json';
import { getPathwayBySlug, siteData } from './repository';
import type { Capability, EmploymentPathway, Project } from './schema';

const textSchema = z.string().trim().min(1);
const textListSchema = z.array(textSchema).min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '必须是 YYYY-MM-DD 日期').refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, '必须是有效的日历日期');

const careerGuideSchema = z.object({
  owner: textSchema,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
  license: textSchema,
  stages: z.array(z.object({
    id: z.enum(['roles', 'evidence', 'opportunities', 'application', 'review']),
    title: textSchema,
    description: textSchema,
    actions: textListSchema,
    output: textSchema,
  })).length(5),
  roles: z.array(z.object({
    id: z.enum(['data-ai', 'software', 'embedded', 'quality']),
    title: textSchema,
    summary: textSchema,
    searchKeywords: textListSchema,
    tasks: textListSchema,
    capabilityIds: textListSchema,
    projectEvidence: z.array(z.object({
      projectId: textSchema,
      evidenceFocus: textSchema,
      nextExperiment: textSchema,
    })).min(1),
    resourceIds: textListSchema,
    readiness: textListSchema,
    interviewQuestions: textListSchema,
    sources: z.array(z.object({
      title: textSchema,
      url: z.string().url().startsWith('https://'),
      checkedAt: dateSchema,
      note: textSchema,
    })).min(1),
  })).length(4),
  application: z.object({
    resumePrompts: textListSchema,
    internshipChecks: textListSchema,
    interviewSteps: textListSchema,
    followUpSteps: textListSchema,
  }),
}).superRefine((guide, context) => {
  function checkUnique(values: string[], path: Array<string | number>) {
    const seen = new Set<string>();
    values.forEach((value, index) => {
      if (seen.has(value)) context.addIssue({ code: z.ZodIssueCode.custom, path: [...path, index], message: `${path.join('.')} 不得重复：${value}` });
      seen.add(value);
    });
  }

  checkUnique(guide.stages.map((stage) => stage.id), ['stages']);
  checkUnique(guide.roles.map((role) => role.id), ['roles']);
  guide.roles.forEach((role, index) => {
    checkUnique(role.capabilityIds, ['roles', index, 'capabilityIds']);
    checkUnique(role.projectEvidence.map((evidence) => evidence.projectId), ['roles', index, 'projectEvidence']);
    checkUnique(role.resourceIds, ['roles', index, 'resourceIds']);
  });
});

type CareerGuideInput = z.infer<typeof careerGuideSchema>;

export type CareerGuideRelations = {
  capabilities: Capability[];
  projects: Project[];
  resources: EmploymentPathway['resourceCatalog']['items'];
};

export type CareerRole = CareerGuideInput['roles'][number] & {
  capabilities: Capability[];
  projects: Array<{ project: Project; evidenceFocus: string; nextExperiment: string }>;
  resources: EmploymentPathway['resourceCatalog']['items'];
  href: string;
};

export type CareerGuide = Omit<CareerGuideInput, 'roles'> & {
  roles: CareerRole[];
  reviewDue: boolean;
};

function requireRelated<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`${label} 引用了不存在的 ID：${id}`);
  return item;
}

export function parseCareerGuide(input: unknown, relations: CareerGuideRelations): CareerGuide {
  const guide = careerGuideSchema.parse(input);
  return {
    ...guide,
    reviewDue: guide.reviewDueAt < new Date().toISOString().slice(0, 10),
    roles: guide.roles.map((role) => ({
      ...role,
      href: `/pathways/employment#career-role-${role.id}`,
      capabilities: role.capabilityIds.map((id) => requireRelated(relations.capabilities, id, `${role.id}.capabilityIds`)),
      projects: role.projectEvidence.map(({ projectId, evidenceFocus, nextExperiment }) => ({
        project: requireRelated(relations.projects, projectId, `${role.id}.projectEvidence`),
        evidenceFocus,
        nextExperiment,
      })),
      resources: role.resourceIds.map((id) => requireRelated(relations.resources, id, `${role.id}.resourceIds`)),
    })),
  };
}

export function getCareerGuide(): CareerGuide {
  const employment = getPathwayBySlug('employment');
  if (!employment || employment.kind !== 'employment') throw new Error('求职指南需要就业路径及其资源目录');
  return parseCareerGuide(rawCareerGuide, {
    capabilities: siteData.capabilities,
    projects: siteData.projects,
    resources: employment.resourceCatalog.items,
  });
}
