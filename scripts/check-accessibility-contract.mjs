import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const layout = read('app/layout.tsx');
const header = read('components/global-header.tsx');
const home = read('app/page.tsx');
const starter = read('app/projects/[projectSlug]/starter/page.tsx');
const css = read('app/globals.css');
const failures = [];

function expect(condition, message) { if (!condition) failures.push(message); }

expect(layout.includes('className="skip-link" href="#main-content"'), 'skip link 必须指向 #main-content');
expect(layout.includes('<main id="main-content" tabIndex={-1}>'), 'main 必须有稳定 id 并可接收 skip link 焦点');
expect(header.includes("aria-current={pathname === item.href ? 'page' : undefined}"), '当前导航必须只在精确 URL 上输出 aria-current=page');
expect(header.includes('aria-expanded={menuOpen}') && header.includes('aria-controls="mobile-navigation"'), '菜单按钮必须公开展开状态和控制目标');
expect(header.includes('aria-hidden={!menuOpen}') && header.includes('tabIndex={menuOpen ? 0 : -1}'), '关闭的移动菜单不得进入键盘顺序');
expect(header.includes("event.key === 'Escape'") && header.includes('menuButtonRef.current?.focus()'), 'Escape 关闭菜单后必须把焦点还给菜单按钮');
expect(css.includes('.theme-switch, .menu-button { min-width: 44px; min-height: 44px;'), '主题/菜单按钮触控目标必须至少 44px');
expect(css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('transition-duration: .01ms') && css.includes('animation-duration: .01ms'), '必须提供 reduced-motion 降级规则');
expect(!/main\s*\{[^}]*overflow\s*:\s*(?:hidden|clip)/s.test(css), '不得用 main overflow hidden/clip 掩盖布局错误');
expect((home.match(/data-home-module=/g) ?? []).length === 4, '首页必须保持四个模块');
expect(starter.includes('新浏览器、无账号、零安装') && starter.includes('2 分钟') && starter.includes('三行观察'), 'starter 核心承诺必须保留服务端文字');

if (failures.length > 0) {
  console.error('Accessibility contract failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Accessibility contract passed (skip link, focus order, touch targets, reduced motion, SSR core text).');
