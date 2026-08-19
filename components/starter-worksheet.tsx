'use client';

import { useState } from 'react';

export function StarterWorksheet() {
  const [observations, setObservations] = useState(['', '', '']);
  return <section className="starter-worksheet" aria-labelledby="observations-title"><div className="starter-worksheet-head"><div><p className="eyebrow">10 分钟产出</p><h2 id="observations-title">保存曲线截图和三行观察</h2></div><button className="button button-secondary" type="button" onClick={() => window.print()}>打印/保存这页</button></div><div className="observation-grid">{observations.map((value, index) => <label key={index} htmlFor={`observation-${index}`}><span>观察 {index + 1}</span><textarea id={`observation-${index}`} value={value} onChange={(event) => setObservations((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={['信号形状或噪声', '一个特征变化', '一个不能外推的结论'][index]} rows={3} /></label>)}</div></section>;
}
