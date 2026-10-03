import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCareerGuide, parseCareerGuide, type CareerGuideRelations } from '@/lib/content/career-guide';
import { getPathwayBySlug, siteData } from '@/lib/content/repository';

function relationsFixture(): CareerGuideRelations {
  const employment = getPathwayBySlug('employment');
  if (!employment || employment.kind !== 'employment') throw new Error('就业路径缺失');
  return { capabilities: siteData.capabilities, projects: siteData.projects, resources: employment.resourceCatalog.items };
}

function guideFixture() {
  return {
    owner: '求职指南编辑',
    updatedAt: '2026-10-03',
    reviewDueAt: '2026-11-03',
    license: 'CC BY 4.0',
    stages: ['roles', 'evidence', 'opportunities', 'application', 'review'].map((id) => ({
      id, title: `行动：${id}`, description: '把岗位要求写成具体任务。', actions: ['记录一个任务及对应证据。'], output: '一张任务与证据表。',
    })),
    roles: ['data-ai', 'software', 'embedded', 'quality'].map((id) => ({
      id, title: `岗位准备：${id}`, summary: '用可解释的项目记录准备岗位沟通。',
      searchKeywords: ['数据处理'], tasks: ['核对输入和异常情况。'],
      capabilityIds: ['cap-software-information', 'cap-design-validation'],
      projectEvidence: [{ projectId: 'project-sensor-alarm-prototype', evidenceFocus: '说明数据输入、状态变化与异常处理。', nextExperiment: '增加一个接口测试；当前成果不证明完整后端能力。' }],
      resourceIds: ['career-sztu', 'career-huawei'], readiness: ['能够解释自己的修改。'], interviewQuestions: ['如何复现一次异常？'],
      sources: [{ title: '校园招聘入口', url: 'https://career.huawei.com/cn/campus-recruitment', checkedAt: '2026-10-03', note: '用于检索岗位，具体要求以岗位原文为准。' }],
    })),
    application: { resumePrompts: ['写清本人工作。'], internshipChecks: ['确认到岗时间。'], interviewSteps: ['演示一次复现。'], followUpSteps: ['记录反馈和下一步。'] },
  };
}

describe('career guide', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-03T00:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('resolves reusable role content to the real capabilities, project evidence and resource entries', () => {
    const guide = parseCareerGuide(guideFixture(), relationsFixture());
    const role = guide.roles[1];

    expect(role.href).toBe('/pathways/employment#career-role-software');
    expect(role.capabilities.map((capability) => capability.slug)).toEqual(['software-and-information-systems', 'design-validation-and-engineering-responsibility']);
    expect(role.projects[0]).toMatchObject({ project: { slug: 'sensor-alarm-prototype' }, evidenceFocus: '说明数据输入、状态变化与异常处理。', nextExperiment: '增加一个接口测试；当前成果不证明完整后端能力。' });
    expect(role.resources.map((resource) => resource.id)).toEqual(['career-sztu', 'career-huawei']);
    expect(guide.reviewDue).toBe(false);
  });

  it.each(['stages', 'roles'] as const)('rejects repeated %s even when the total count is correct', (field) => {
    const guide = guideFixture();
    guide[field][1].id = guide[field][0].id;
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow(/不得重复/);
  });

  it.each(['capabilityIds', 'projectEvidence', 'resourceIds'] as const)('rejects repeated references in a role: %s', (field) => {
    const guide = guideFixture();
    const role = guide.roles[0];
    if (field === 'projectEvidence') role.projectEvidence.push({ ...role.projectEvidence[0] });
    else role[field].push(role[field][0]);
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow(/不得重复/);
  });

  it.each(['updatedAt', 'reviewDueAt', 'source.checkedAt'] as const)('rejects impossible calendar dates in %s', (field) => {
    const guide = guideFixture();
    if (field === 'source.checkedAt') guide.roles[0].sources[0].checkedAt = '2026-02-30';
    else guide[field] = '2026-02-30';
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow(/有效.*日期/);
  });

  it('keeps all guidance visible after its review date and changes only the review state', () => {
    const fixture = guideFixture();
    const before = parseCareerGuide(fixture, relationsFixture());
    vi.setSystemTime(new Date('2026-11-03T23:59:59Z'));
    expect(parseCareerGuide(fixture, relationsFixture()).reviewDue).toBe(false);
    vi.setSystemTime(new Date('2027-10-03T00:00:00Z'));
    const after = parseCareerGuide(fixture, relationsFixture());
    expect(after).toEqual({ ...before, reviewDue: true });
  });

  it.each([
    ['owner'],
    ['license'],
    ['stages', '0', 'output'],
    ['roles', '0', 'readiness'],
    ['roles', '0', 'projectEvidence', '0', 'nextExperiment'],
    ['roles', '0', 'sources', '0', 'checkedAt'],
    ['application', 'internshipChecks'],
  ])('rejects a missing required field at %j', (...path) => {
    const guide = guideFixture();
    let container: Record<string, unknown> = guide;
    for (const segment of path.slice(0, -1)) container = container[segment] as Record<string, unknown>;
    delete container[path[path.length - 1]];
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow();
  });

  it.each(['capabilityIds', 'projectEvidence', 'resourceIds'] as const)('fails a broken %s instead of omitting the item', (field) => {
    const guide = guideFixture();
    if (field === 'projectEvidence') guide.roles[0].projectEvidence[0].projectId = 'missing-project';
    else guide.roles[0][field][0] = 'missing-reference';
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow(new RegExp(`data-ai\\.${field}.*不存在的 ID`));
  });

  it.each(['stages', 'roles'] as const)('requires exactly the configured set of %s', (field) => {
    const missing = guideFixture();
    missing[field].pop();
    expect(() => parseCareerGuide(missing, relationsFixture())).toThrow();

    const unknown = guideFixture();
    unknown[field][0].id = 'unknown';
    expect(() => parseCareerGuide(unknown, relationsFixture())).toThrow();
  });

  it.each(['http://example.com/jobs', 'javascript:alert(1)', '/jobs', 'not-a-url'])('rejects an invalid source URL: %s', (url) => {
    const guide = guideFixture();
    guide.roles[0].sources[0].url = url;
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow();
  });

  it.each(['2026/10/03', '2026-13-01', '1900-02-29'])('rejects invalid date values: %s', (date) => {
    const guide = guideFixture();
    guide.updatedAt = date;
    expect(() => parseCareerGuide(guide, relationsFixture())).toThrow();
  });

  it('accepts leap days as real dates even when their review date has passed', () => {
    const guide = guideFixture();
    guide.updatedAt = '2024-02-29';
    guide.reviewDueAt = '2024-03-01';
    expect(parseCareerGuide(guide, relationsFixture())).toMatchObject({ updatedAt: '2024-02-29', reviewDueAt: '2024-03-01', reviewDue: true });
  });

  it('loads the published guide against the live repository relations', () => {
    const guide = getCareerGuide();
    expect(guide.stages.map((stage) => stage.id)).toEqual(['roles', 'evidence', 'opportunities', 'application', 'review']);
    expect(guide.roles.map((role) => role.id)).toEqual(['data-ai', 'software', 'embedded', 'quality']);
    expect(guide.roles[1].projects[0].project.id).toBe('project-sensor-alarm-prototype');
    expect(guide.roles[1].resources).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'career-huawei' })]));
    expect(guide.application.resumePrompts.length).toBeGreaterThan(0);
  });
});
