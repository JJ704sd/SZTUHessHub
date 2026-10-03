import 'server-only';

import { z } from 'zod';
import rawPracticeGuides from '../../content/practice-guides.json';
import { siteData } from './repository';
import type { Capability, Project } from './schema';

const textSchema = z.string().trim().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '必须是 YYYY-MM-DD 日期').refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, '必须是有效的日历日期');
const threeItems = z.array(textSchema).length(3);

const practiceGuidesSchema = z.object({
  owner: textSchema,
  updatedAt: dateSchema,
  reviewDueAt: dateSchema,
  license: textSchema,
  capabilities: z.array(z.object({
    capabilityId: textSchema,
    projectId: textSchema,
    title: textSchema,
    minutes: z.literal(15),
    input: textSchema,
    steps: threeItems,
    output: textSchema,
    checks: threeItems,
    transferQuestions: z.array(textSchema).length(2),
  })).min(1),
  projects: z.array(z.object({
    projectId: textSchema,
    exampleTitle: textSchema,
    exampleHref: z.string().regex(/^\/project-examples\/[A-Za-z0-9][A-Za-z0-9_-]*\.md$/, '必须是 /project-examples/ 下的 Markdown 文件路径'),
    context: textSchema,
    evidence: threeItems,
    resumeBullets: threeItems,
    interviewQuestions: threeItems,
  })).min(1),
}).superRefine((guides, context) => {
  const capabilityIds = new Set<string>();
  guides.capabilities.forEach((practice, index) => {
    if (capabilityIds.has(practice.capabilityId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['capabilities', index, 'capabilityId'], message: '能力练习不得重复' });
    capabilityIds.add(practice.capabilityId);
  });
  const projectIds = new Set<string>();
  guides.projects.forEach((practice, index) => {
    if (projectIds.has(practice.projectId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['projects', index, 'projectId'], message: '项目示例不得重复' });
    projectIds.add(practice.projectId);
  });
});

type PracticeGuidesInput = z.infer<typeof practiceGuidesSchema>;

export type PracticeGuidesRelations = { capabilities: Capability[]; projects: Project[] };

export type CapabilityPractice = PracticeGuidesInput['capabilities'][number] & {
  capability: Capability;
  project: Project;
  href: string;
};

export type ProjectPractice = PracticeGuidesInput['projects'][number] & { project: Project };

export type PracticeGuides = Omit<PracticeGuidesInput, 'capabilities' | 'projects'> & {
  capabilities: CapabilityPractice[];
  projects: ProjectPractice[];
  reviewDue: boolean;
};

function requireRelated<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`${label} 引用了不存在的 ID：${id}`);
  return item;
}

export function parsePracticeGuides(input: unknown, relations: PracticeGuidesRelations): PracticeGuides {
  const guides = practiceGuidesSchema.parse(input);
  const capabilities = guides.capabilities.map((practice) => {
    const capability = requireRelated(relations.capabilities, practice.capabilityId, 'capabilities.capabilityId');
    return {
      ...practice,
      capability,
      project: requireRelated(relations.projects, practice.projectId, `${practice.capabilityId}.projectId`),
      href: `/capabilities/${capability.slug}#capability-practice`,
    };
  });
  const projects = guides.projects.map((practice) => ({
    ...practice,
    project: requireRelated(relations.projects, practice.projectId, 'projects.projectId'),
  }));
  for (const capability of relations.capabilities) {
    if (!capabilities.some((practice) => practice.capabilityId === capability.id)) throw new Error(`练习指南缺少能力：${capability.id}`);
  }
  for (const project of relations.projects) {
    if (!projects.some((practice) => practice.projectId === project.id)) throw new Error(`练习指南缺少项目：${project.id}`);
  }
  return {
    ...guides,
    capabilities,
    projects,
    reviewDue: guides.reviewDueAt < new Date().toISOString().slice(0, 10),
  };
}

export function getPracticeGuides(): PracticeGuides {
  return parsePracticeGuides(rawPracticeGuides, siteData);
}
