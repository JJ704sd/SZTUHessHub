import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '走岔了一小步',
  description: '这里暂时没有页面。回到 HseeHub，找一个新的探索起点。',
};

export default function NotFound() {
  return <div className="page-container"><section className="page-intro"><p className="eyebrow">404 / 走岔了一小步</p><h1>这条路还没通，换个方向逛逛。</h1><p className="page-intro-description">页面可能搬了家，也可能是地址少了一点什么。回到首页，重新找一个让你好奇的起点。</p><div className="page-intro-actions"><Link className="button button-primary" href="/">回到首页 <span aria-hidden="true">→</span></Link><Link className="button button-secondary" href="/sources">查看来源与版本</Link></div></section></div>;
}
