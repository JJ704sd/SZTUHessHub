import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(path, 'utf8');
const home = read('app/page.tsx');
const homeSections = read('components/content/home-sections.tsx');
const layout = read('app/layout.tsx');
const skipLink = read('components/shell/skip-link.tsx');
const header = read('components/global-header.tsx');
const css = read('app/globals.css');
const majors = read('app/majors/page.tsx');
const majorCompare = read('app/majors/compare/page.tsx');
const nextConfig = read('next.config.mjs');
const projects = read('components/project-browser.tsx');
const projectsPage = read('app/projects/page.tsx');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const releaseCHome = homeSections.includes("./home-sections.module.css") && homeSections.includes("const starterHref = '/projects/signal-feature-notebook/starter'");
const releaseBHome = home.includes('HomeTaskLaunchpad') && homeSections.includes('release-b-home-launch');
if (releaseCHome) {
  const homeRender = home.slice(home.indexOf('return <>'));
  expect((home.match(/<Home(?:TaskLaunchpad|FeaturedProjects|DualMajorCase|ArtifactPaths|Recent)/g) ?? []).length === 5, 'Release C 首页必须输出五个有明确角色的服务端模块');
  expect(homeRender.indexOf('HomeTaskLaunchpad') < homeRender.indexOf('HomeDualMajorCase') && homeRender.indexOf('HomeDualMajorCase') < homeRender.indexOf('HomeFeaturedProjects'), 'Release C 首页顺序必须是任务、专业比较、项目、产物、依据');
  expect(homeSections.includes('做一次 10 分钟 Starter') && homeSections.includes('内部起点：') && homeSections.includes('机器可达 · 人工与许可待复核'), 'Release C 首页必须公开 Starter 主动作、项目内部起点和三维信任语义');
  expect(!homeSections.includes('FAQList') && !homeSections.includes('model.updates') && !homeSections.includes('model.faqs'), 'Release C 首页不得展开完整 FAQ 或更新列表');
} else if (releaseBHome) {
  expect((home.match(/<Home(?:TaskLaunchpad|FeaturedProjects|DualMajorCase|ArtifactPaths|Recent)/g) ?? []).length === 5, 'Release B 首页必须输出五个服务端模块');
  expect(homeSections.includes('model.taskEntries') && homeSections.includes('home-featured-projects') && homeSections.includes('home-compact-projects'), 'Release B 首页必须有三动作与 1+2 项目层级');
  expect(homeSections.includes('model.updates') && homeSections.includes('model.faqs'), 'Release B 首页必须由模型输出更新与三条 FAQ');
} else {
  expect((homeSections.match(/data-home-module=/g) ?? []).length === 4, '首页必须有四个信息架构模块');
  expect((home.match(/<Home(?:TaskLauncher|MajorCompare|ProjectPreviews|Explore)/g) ?? []).length === 4 && !home.includes('HomeCapabilityShortcuts'), '首页不得单独输出能力第五模块');
  expect((homeSections.match(/task-card(?:\s|['"])/g) ?? []).length >= 1 && homeSections.includes('task_area_viewed') === false, '首页任务区结构必须由服务端输出');
}
expect(layout.includes('<SkipLink />') && skipLink.includes('href="#main-content"') && layout.includes('id="main-content"'), '布局必须提供 skip link 和 main id');
expect(/aria-current=\{isActive\(item\.href\) \? 'page' : undefined\}/.test(header) && header.includes('aria-hidden={!menuOpen}') && header.includes('tabIndex={menuOpen ? 0 : -1}'), 'Header 必须公开精确当前项和菜单键盘状态');
expect(!/main\s*\{[^}]*overflow\s*:\s*(?:clip|hidden)/s.test(css), '不得用 main overflow 裁切布局');
expect(css.includes('min-width: 0') && css.includes('overflow-wrap: anywhere'), '双卡子项必须允许收缩和换行');
expect(majors.includes('id="dual-lens"') && majors.includes('DualLensCard') && majorCompare.includes('共同') && majorCompare.includes('协作'), '专业对照必须保留共同底座、真实任务和协作接口');
expect(!/<select\b/i.test(projects) && projectsPage.includes('parseLegacyProjectFilters'), 'P0 项目浏览器不得输出筛选控件，必须保留旧参数解析');
if (failures.length) { console.error('Phase 1.1 structure check failed.'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`${releaseCHome ? 'Release C' : releaseBHome ? 'Release B' : 'Phase 1.1'} structure check passed (home modules, header, comparison, legacy projects).`);
