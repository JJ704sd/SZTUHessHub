import Link from 'next/link';

export default function NotFound() {
  return <div className="page-container"><section className="page-intro"><p className="eyebrow">404 · 还没有这条内容</p><h1>这条路径暂时没有可读的页面</h1><p className="page-intro-description">如果你是从外部链接进来的，可能是内容版本或 slug 已更新。先回到主线，再从最新入口进入。</p><div className="page-intro-actions"><Link className="button button-primary" href="/">回到首页</Link><Link className="button button-secondary" href="/sources">查看来源与版本</Link></div></section></div>;
}
