import { describe, expect, test } from 'vitest';
import { buildStarterRecord } from '@/lib/starter-record';

describe('signal Starter local record', () => {
  test('contains the fixed sample, three observations, version and safety boundary', () => {
    const record = buildStarterRecord({
      format: 'markdown',
      generatedAt: new Date('2026-08-19T08:30:00Z'),
      observations: ['看到周期起伏', '中段幅度变大', '不能外推为医学结论'],
    });

    expect(record.filename).toBe('signal-feature-starter-2026-08-19.md');
    expect(record.mimeType).toBe('text/markdown;charset=utf-8');
    expect(record.content).toContain('signal-feature-notebook Starter v0.1.0');
    expect(record.content).toContain('synthetic-signal-a');
    expect(record.content).toContain('观察 1：看到周期起伏');
    expect(record.content).toContain('观察 2：中段幅度变大');
    expect(record.content).toContain('观察 3：不能外推为医学结论');
    expect(record.content).toContain('固定合成信号');
    expect(record.content).not.toMatch(/姓名|学号|邮箱/);
  });

  test('plain text uses a txt filename without markdown headings', () => {
    const record = buildStarterRecord({
      format: 'text', generatedAt: new Date('2026-08-19T08:30:00Z'), observations: ['一', '二', '三'],
    });

    expect(record.filename).toBe('signal-feature-starter-2026-08-19.txt');
    expect(record.content).not.toContain('# ');
  });
});
