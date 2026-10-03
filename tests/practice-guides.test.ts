import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPracticeGuides, parsePracticeGuides } from '@/lib/content/practice-guides';
import { siteData } from '@/lib/content/repository';

function guidesFixture() {
  return {
    owner: '练习指南编辑', updatedAt: '2026-10-03', reviewDueAt: '2026-11-03', license: '原创编辑示例',
    capabilities: [
      'cap-health-user', 'cap-math-research', 'cap-sensing-measurement', 'cap-signal-data-ai',
      'cap-software-information', 'cap-electronics-control', 'cap-materials-devices', 'cap-design-validation',
    ].map((capabilityId) => ({
      capabilityId, projectId: 'project-sensor-alarm-prototype', title: '写一条输入与状态记录', minutes: 15,
      input: '项目里的正常、断开和停止状态说明。',
      steps: ['选择一个输入。', '写出预期状态。', '标记仍需执行的测试。'],
      output: '一条注明尚未执行的测试用例。',
      checks: ['输入明确。', '预期可判断。', '实际结果未编造。'],
      transferQuestions: ['换一个传感器会变什么？', '哪些条件还没验证？'],
    })),
    projects: ['project-signal-feature-notebook', 'project-sensor-alarm-prototype', 'project-material-test-matrix'].map((projectId) => ({
      projectId, exampleTitle: '编辑示例：一次练习如何留下记录', exampleHref: '/project-examples/practice-example.md',
      context: '课程仿真练习的填写示范，不是真实工作经历。',
      evidence: ['输入记录。', '测试条件。', '失败与局限。'],
      resumeBullets: ['说明问题。', '说明个人行动。', '说明验证范围。'],
      interviewQuestions: ['为什么这样设计？', '如何复现？', '哪里还需要补证据？'],
    })),
  };
}

describe('practice guides', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-03T00:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('connects each short practice and worked example to real content objects', () => {
    const guides = parsePracticeGuides(guidesFixture(), siteData);
    const software = guides.capabilities.find((practice) => practice.capabilityId === 'cap-software-information')!;
    expect(software).toMatchObject({
      capability: { name: '软件与信息系统' }, project: { slug: 'sensor-alarm-prototype' },
      href: '/capabilities/software-and-information-systems#capability-practice', minutes: 15,
      output: '一条注明尚未执行的测试用例。',
    });
    expect(guides.capabilities).toHaveLength(8);
    expect(guides.projects).toHaveLength(3);
    expect(guides.projects[2].project.slug).toBe('material-test-matrix');
    expect(guides.reviewDue).toBe(false);
  });

  it.each(['capabilities', 'projects'] as const)('requires complete coverage of %s', (field) => {
    const guides = guidesFixture();
    guides[field].pop();
    expect(() => parsePracticeGuides(guides, siteData)).toThrow(/缺少/);
  });

  it.each(['capabilities', 'projects'] as const)('rejects duplicate %s entries instead of treating the count as coverage', (field) => {
    const guides = guidesFixture();
    if (field === 'capabilities') guides.capabilities[1].capabilityId = guides.capabilities[0].capabilityId;
    else guides.projects[1].projectId = guides.projects[0].projectId;
    expect(() => parsePracticeGuides(guides, siteData)).toThrow(/不得重复/);
  });

  it.each(['capabilityId', 'capability.projectId', 'projectId'] as const)('fails an unknown reference: %s', (field) => {
    const guides = guidesFixture();
    if (field === 'capabilityId') guides.capabilities[0].capabilityId = 'missing-capability';
    else if (field === 'capability.projectId') guides.capabilities[0].projectId = 'missing-project';
    else guides.projects[0].projectId = 'missing-project';
    expect(() => parsePracticeGuides(guides, siteData)).toThrow(/不存在的 ID：missing-/);
  });

  it.each([
    'https://example.com/example.md', '/other/example.md', '/project-examples/../secret.md',
    '/project-examples/%2e%2e/secret.md', '/project-examples/..\\secret.md',
    '/project-examples/nested/example.md', '/project-examples/example.txt', '/project-examples/example.md?download=1',
  ])('rejects an example outside the local Markdown file boundary: %s', (exampleHref) => {
    const guides = guidesFixture();
    guides.projects[0].exampleHref = exampleHref;
    expect(() => parsePracticeGuides(guides, siteData)).toThrow(/project-examples/);
  });

  it.each(['updatedAt', 'reviewDueAt'] as const)('rejects an impossible calendar date in %s', (field) => {
    const guides = guidesFixture();
    guides[field] = '2026-02-30';
    expect(() => parsePracticeGuides(guides, siteData)).toThrow(/有效.*日期/);
  });

  it('keeps every practice and example when only its review date has expired', () => {
    const fixture = guidesFixture();
    const before = parsePracticeGuides(fixture, siteData);
    vi.setSystemTime(new Date('2026-11-03T23:59:59Z'));
    expect(parsePracticeGuides(fixture, siteData).reviewDue).toBe(false);
    vi.setSystemTime(new Date('2027-10-03T00:00:00Z'));
    expect(parsePracticeGuides(fixture, siteData)).toEqual({ ...before, reviewDue: true });
  });

  it.each([
    ['owner'], ['license'], ['capabilities', '0', 'input'], ['capabilities', '0', 'output'],
    ['capabilities', '0', 'checks'], ['projects', '0', 'exampleHref'], ['projects', '0', 'context'],
    ['projects', '0', 'resumeBullets'],
  ])('rejects missing required content at %j', (...path) => {
    const guides = guidesFixture();
    let container: Record<string, unknown> = guides;
    for (const segment of path.slice(0, -1)) container = container[segment] as Record<string, unknown>;
    delete container[path[path.length - 1]];
    expect(() => parsePracticeGuides(guides, siteData)).toThrow();
  });

  it('rejects incomplete or oversized practice instructions and examples', () => {
    const shortPractice = guidesFixture();
    shortPractice.capabilities[0].steps.pop();
    expect(() => parsePracticeGuides(shortPractice, siteData)).toThrow();
    const longExample = guidesFixture();
    longExample.projects[0].evidence.push('第四项');
    expect(() => parsePracticeGuides(longExample, siteData)).toThrow();
    const missingQuestion = guidesFixture();
    missingQuestion.capabilities[0].transferQuestions.pop();
    expect(() => parsePracticeGuides(missingQuestion, siteData)).toThrow();
    const wrongDuration = guidesFixture();
    wrongDuration.capabilities[0].minutes = 90;
    expect(() => parsePracticeGuides(wrongDuration, siteData)).toThrow();
  });

  it.each(['2026/10/03', '2026-13-01', '1900-02-29'])('rejects malformed or invalid dates: %s', (date) => {
    const guides = guidesFixture();
    guides.updatedAt = date;
    expect(() => parsePracticeGuides(guides, siteData)).toThrow();
  });

  it('accepts a real leap day without hiding an expired guide', () => {
    const guides = guidesFixture();
    guides.updatedAt = '2024-02-29';
    guides.reviewDueAt = '2024-03-01';
    expect(parsePracticeGuides(guides, siteData)).toMatchObject({ updatedAt: '2024-02-29', reviewDue: true });
  });

  it('loads the published guides with complete repository coverage and downloadable examples', () => {
    const guides = getPracticeGuides();
    expect(new Set(guides.capabilities.map((practice) => practice.capability.id))).toEqual(new Set(siteData.capabilities.map((capability) => capability.id)));
    expect(new Set(guides.projects.map((practice) => practice.project.id))).toEqual(new Set(siteData.projects.map((project) => project.id)));
    for (const example of guides.projects) {
      expect(existsSync(resolve(process.cwd(), 'public', example.exampleHref.slice(1))), `示例文件缺失：${example.exampleHref}`).toBe(true);
    }
  });
});
