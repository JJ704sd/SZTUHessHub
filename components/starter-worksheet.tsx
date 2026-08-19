'use client';

import { useEffect, useState } from 'react';
import { buildStarterRecord, type StarterRecordFormat } from '@/lib/starter-record';
import styles from './starter-worksheet.module.css';

export function StarterWorksheet() {
  const [observations, setObservations] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const dirty = observations.some((value) => value.trim());
  const complete = observations.every((value) => value.trim());

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty || saved) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [dirty, saved]);

  function updateObservation(index: number, value: string) {
    setObservations((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    setSaved(false);
    setMessage('');
  }

  function download(format: StarterRecordFormat) {
    if (!complete) { setMessage('请先完成三行观察，再下载记录。'); return; }
    const record = buildStarterRecord({ format, generatedAt: new Date(), observations });
    const url = URL.createObjectURL(new Blob([record.content], { type: record.mimeType }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = record.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setMessage('记录已下载到本机。本站没有上传或持久化你的三行文字。');
  }

  return <section className={styles.worksheet} aria-labelledby="observations-title"><div className={styles.head}><div><p className="eyebrow">02–10 分钟 · 三行观察</p><h2 id="observations-title">把一次观察保存成自己的本地记录</h2></div><button className="button button-secondary" type="button" onClick={() => window.print()}>打印/保存这页</button></div><p className={styles.unsaved}><strong>未保存内容：</strong>刷新或离开页面会丢失当前文字；本站不上传、不写入 localStorage。</p><div className={styles.grid}>{observations.map((value, index) => <label key={index} htmlFor={`observation-${index}`}><span>{['观察 1 · 形状或噪声', '观察 2 · 一个特征变化', '观察 3 · 一个不能外推的结论'][index]}</span><textarea id={`observation-${index}`} value={value} onChange={(event) => updateObservation(index, event.target.value)} placeholder={['我在曲线上看到……', '与前一段相比……', '这不能说明……'][index]} rows={3} required /></label>)}</div><div className={styles.actions}><button className="button button-primary" type="button" disabled={!complete} onClick={() => download('markdown')}>下载 Markdown 记录</button><button className="button button-secondary" type="button" disabled={!complete} onClick={() => download('text')}>下载纯文本记录</button></div><p className={styles.status} role="status" aria-live="polite">{message || (complete ? '三行已完成，可以本地保存。' : '完成三行后才会强调保存。')}</p>{saved ? <div className={styles.next}><strong>这次就可以停在这里。</strong><a href="/projects/signal-feature-notebook">回到项目，看 90 分钟完整版</a><a href="/capabilities">看这次动作在练什么能力</a><a href="/projects?intent=quick-look">比较另一个任务</a></div> : null}</section>;
}
