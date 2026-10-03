'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/lib/site-config';
import { BrandMark } from '@/components/ui/brand-mark';

type Theme = 'light' | 'dark';

function NavigationIcon({ href }: { href: string }) {
  const paths: Record<string, string> = {
    '/': 'm3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
    '/majors': 'M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z',
    '/projects': 'M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10',
    '/capabilities': 'M9 5h6M5 9v6M19 9v6M9 19h6M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3ZM15 15h6v6h-6Z',
    '/pathways': 'M5 20V9a4 4 0 0 1 4-4h10M15 1l4 4-4 4M5 15h9a4 4 0 0 1 4 4v2',
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[href]} /></svg>;
}

export function GlobalHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('hseehub-theme') as Theme | null;
    const preferred = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = preferred;
    setTheme(preferred);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const nav = mobileNavRef.current;
    if (!nav) return;
    const firstLink = nav.querySelector<HTMLElement>('a[href]');
    window.requestAnimationFrame(() => firstLink?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    function closeOnWideScreen(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }
    const media = window.matchMedia('(min-width: 861px)');
    media.addEventListener('change', closeOnWideScreen);
    return () => media.removeEventListener('change', closeOnWideScreen);
  }, []);
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('hseehub-theme', next);
    setTheme(next);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <div className="header-inner page-container">
        <Link className="brand" href="/" aria-label="HseeHub 首页">
          <BrandMark />
          <span className="brand-copy">
            <strong>HseeHub</strong>
            <span>HEALTH × ENGINEERING</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          <Link className={pathname === '/' ? 'nav-link is-active' : 'nav-link'} href="/" aria-current={pathname === '/' ? 'page' : undefined}><NavigationIcon href="/" />首页</Link>
          {siteConfig.navItems.map((item) => (
            <Link key={item.href} className={isActive(item.href) ? 'nav-link is-active' : 'nav-link'} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
              <NavigationIcon href={item.href} />{item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="header-start" href="/projects">开始探索 <span aria-hidden="true">↗</span></Link>
          <button className="theme-switch theme-switch-desktop" type="button" onClick={toggleTheme} aria-label={`切换到${theme === 'dark' ? '亮色' : '暗色'}主题`} aria-pressed={theme === 'dark'}>
            <span className="theme-icon" aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
            <span className="theme-label">{theme === 'dark' ? '亮色' : '暗色'}</span>
          </button>
          <button ref={menuButtonRef} className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <span className="menu-icon" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            <span>菜单</span>
          </button>
        </div>
      </div>

      <nav ref={mobileNavRef} id="mobile-navigation" className={menuOpen ? 'mobile-nav is-open page-container' : 'mobile-nav page-container'} aria-label="移动端主导航" aria-hidden={!menuOpen}>
        <Link className={pathname === '/' ? 'mobile-nav-link is-active' : 'mobile-nav-link'} href="/" tabIndex={menuOpen ? 0 : -1} aria-current={pathname === '/' ? 'page' : undefined}><span><NavigationIcon href="/" />首页</span><span aria-hidden="true">↗</span></Link>
        {siteConfig.navItems.map((item) => (
          <Link key={item.href} className={isActive(item.href) ? 'mobile-nav-link is-active' : 'mobile-nav-link'} href={item.href} tabIndex={menuOpen ? 0 : -1} aria-current={isActive(item.href) ? 'page' : undefined}>
            <span><NavigationIcon href={item.href} />{item.label}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
        <button className="mobile-theme-switch" type="button" onClick={toggleTheme} tabIndex={menuOpen ? 0 : -1} aria-label={`切换到${theme === 'dark' ? '亮色' : '暗色'}主题`} aria-pressed={theme === 'dark'}>
          <span><span className="theme-icon" aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span> 外观</span>
          <span>{theme === 'dark' ? '切换到亮色' : '切换到暗色'}</span>
        </button>
      </nav>
    </header>
  );
}
