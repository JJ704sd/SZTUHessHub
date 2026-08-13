# ADR-001：项目目录采用静态首屏加客户端筛选

## 状态

已接受（Phase 1.5，2026-08-13）。

## 背景

部署平台的 SSR、边缘缓存和运行时环境尚未锁定。项目目录需要在无 JavaScript 时仍能阅读全部三张体验卡，同时支持可分享、可刷新、可回退的 URL 筛选状态。

## 决策

`/projects` 使用可静态生成的结果优先页面：服务端只输出完整的项目卡片和筛选控件，客户端在 hydration 后读取 `major`、`capability`、`scenario`、`viewpoint`、`duration` 查询参数并应用筛选；用户操作用 `history.replaceState` 保留 URL 状态。筛选仍通过 `filterProjectCatalog` 这一纯函数执行。

## 约束与回滚

- 首屏 HTML 不依赖查询参数也可读完三张项目卡，避免未知 SSR 平台上的空白页和布局跳动。
- 未启用 JavaScript 时，查询参数不会隐藏内容；用户仍可阅读完整目录。
- 若正式托管确认支持稳定 SSR，可将查询参数解析移回页面服务端，并以同一纯筛选函数和 E2E 用例保持行为一致。
- 任何迁移不得改变 `/projects`、详情页 URL、内容事实或安全边界。
