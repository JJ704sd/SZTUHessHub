'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/lib/site-config';

type Theme = 'light' | 'dark';

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
    const focusable = () => Array.from(nav.querySelectorAll<HTMLElement>('a[href]'));
    const firstLink = focusable()[0];
    window.requestAnimationFrame(() => firstLink?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const links = focusable();
      if (links.length === 0) return;
      const currentIndex = links.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault();
        links[links.length - 1]?.focus();
      } else if (!event.shiftKey && currentIndex === links.length - 1) {
        event.preventDefault();
        links[0]?.focus();
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
          <span className="brand-mark" aria-hidden="true">H</span>
          <span className="brand-copy">
            <strong>HseeHub</strong>
            <span>健康工程探索站</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          {siteConfig.navItems.map((item) => (
            <Link key={item.href} className={isActive(item.href) ? 'nav-link is-active' : 'nav-link'} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="theme-switch" type="button" onClick={toggleTheme} aria-label={`切换到${theme === 'dark' ? '亮色' : '暗色'}主题`} aria-pressed={theme === 'dark'}>
            <span className="theme-icon" aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
            <span className="theme-label">{theme === 'dark' ? '亮色' : '暗色'}</span>
          </button>
          <button ref={menuButtonRef} className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <span className="menu-icon" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            <span>菜单</span>
          </button>
        </div>
      </div>

      <nav ref={mobileNavRef} id="mobile-navigation" className={menuOpen ? 'mobile-nav is-open page-container' : 'mobile-nav page-container'} aria-label="移动端主导航" aria-hidden={!menuOpen}>
        {siteConfig.navItems.map((item) => (
          <Link key={item.href} className={isActive(item.href) ? 'mobile-nav-link is-active' : 'mobile-nav-link'} href={item.href} tabIndex={menuOpen ? 0 : -1}>
            <span>{item.label}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
