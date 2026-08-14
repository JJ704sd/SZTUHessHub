import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const home = read('app/page.tsx');
const layout = read('app/layout.tsx');
const header = read('components/global-header.tsx');
const css = read('app/globals.css');
const compare = read('app/majors/compare/page.tsx');
const browserAcceptance = read('docs/phase-1.1-browser-acceptance.md');

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect((home.match(/data-home-module=/g) ?? []).length === 4, '首页必须有且只有四个 data-home-module');
expect((home.match(/<TaskEntry /g) ?? []).length === 3, '首页必须有三个任务入口');
expect((home.match(/\bprimary\b/g) ?? []).length === 1, '首页必须只有一个 primary 任务入口');
expect(home.includes('siteData.projects.map'), '首页必须展示现有项目集合');
expect(layout.includes('跳到主要内容') && layout.includes('id="main-content"'), '布局必须提供 skip link 和稳定 main id');
expect(header.includes('aria-current={pathname === item.href ? \'page\' : undefined}'), 'Header 必须按精确 URL 输出 aria-current=page');
expect(header.includes('aria-expanded={menuOpen}') && header.includes('aria-pressed={theme === \'dark\'}'), 'Header 必须公开菜单和主题按钮状态');
expect(header.includes("event.key === 'Escape'") && header.includes('tabIndex={menuOpen ? 0 : -1}'), '移动菜单必须有 Escape 关闭和隐藏时不可聚焦逻辑');
expect(css.includes('.theme-switch, .menu-button { min-width: 44px; min-height: 44px;'), '主题和菜单按钮必须满足 44px 触控目标');
expect(!/main\s*\{[^}]*overflow\s*:\s*(?:clip|hidden)/s.test(css), '禁止用 main overflow hidden/clip 掩盖布局错误');
expect(css.includes('.dual-card, .lens-grid, .lens, .lens-facts, .lens-facts div, .dual-footer, .dual-footer > div { min-width: 0; }'), '双卡及其子项必须允许收缩');
expect(css.includes('overflow-wrap: anywhere'), '长元数据必须允许换行');
expect(compare.includes('5 分钟后你能回答') && compare.includes('id="dual-lens"'), '对照页必须保留目标清单和同题双解锚点');
expect(compare.includes('button-primary') && compare.includes('挑一个项目'), '对照页主下一步必须是项目');
expect(compare.includes("name: 'next_step_select'") && compare.includes("from: 'compare'") && compare.includes("target: 'project'"), '对照页主下一步必须记录 compare→project 事件');
expect(compare.includes('dual-case-disclosure') && css.includes('.dual-case-disclosure-body { display: none;'), '第二个同题案例必须是可访问的 disclosure，关闭时不占据内容布局');
expect(browserAcceptance.includes('getBoundingClientRect') && browserAcceptance.includes('scrollWidth') && browserAcceptance.includes('overflowX') && browserAcceptance.includes('SCROLL_WHITELIST'), '浏览器验收记录必须保留 bounding-box、祖先 overflow 和滚动白名单断言');

if (failures.length > 0) {
  console.error('Phase 1.1 structure check failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Phase 1.1 structure check passed (header, four modules, dual-card layout, compare path).');
