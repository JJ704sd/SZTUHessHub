export type StarterRecordFormat = 'markdown' | 'text';

export function buildStarterRecord(_input: {
  format: StarterRecordFormat;
  generatedAt: Date;
  observations: [string, string, string] | string[];
}): { filename: string; mimeType: string; content: string } {
  const { format, generatedAt, observations } = _input;
  const date = generatedAt.toISOString().slice(0, 10);
  const heading = format === 'markdown' ? '# ' : '';
  const lines = [
    `${heading}signal-feature-notebook Starter v0.1.0`,
    '',
    `生成日期：${date}`,
    '合成信号样例 ID：synthetic-signal-a',
    '',
    `观察 1：${observations[0] ?? ''}`,
    `观察 2：${observations[1] ?? ''}`,
    `观察 3：${observations[2] ?? ''}`,
    '',
    '安全边界：本记录只来自固定合成信号，用于练习观察、特征判断和限制表达；不含真实健康数据，不可解释为医学结论或诊断。',
    '隐私说明：记录只在当前浏览器本地生成，不上传、不写入本地存储。',
  ];
  return {
    filename: `signal-feature-starter-${date}.${format === 'markdown' ? 'md' : 'txt'}`,
    mimeType: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
    content: `${lines.join('\n')}\n`,
  };
}
