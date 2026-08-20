# ADR-001：项目目录采用静态首屏加客户端筛选

## 状态

已接受（Phase 1.5，2026-08-13）。

## 背景

部署平台的 SSR、边缘缓存和运行时环境尚未锁定。项目目录需要在无 JavaScript 时仍能阅读全部三张体验卡，同时支持可分享、可刷新、可回退的 URL 筛选状态。

## 决策

`/projects` 使用可静态生成的结果优先页面：服务端只输出完整的项目卡片和筛选控件，客户端在 hydration 后读取 `major`、`capability`、`scenario`、`viewpoint`、`duration` 查询参数并应用筛选；用户操作用 `history.replaceState` 保留 URL 状态。筛选仍通过 `filterProjectCatalog` 这一纯函数执行。

## 与当前体验的漂移记录（2026-08-20）

当前实现已经把 `?intent=quick-look|data-ai|sensor|portfolio` 作为 `/projects` 的首要入口：它只调整三个项目的排序和解释，不隐藏项目；ADR-001 中的 `major/capability/scenario/viewpoint/duration` 五维筛选仍由 `filterProjectCatalog` 解析并作为旧链接兼容路径保留。当前页面使用 `next/link` 生成意图和兼容链接，因而不再完全等同于本 ADR 所描述的“客户端读取五维筛选并用 `history.replaceState`”交互。

这是一项文档与产品契约漂移记录，不是本任务的行为变更。Release C 继续以意图优先、旧筛选兼容为当前实现事实；是否正式取代本 ADR、保留五维筛选多久以及是否需要重定向，应由拟议的 [ADR-002](002-project-intent-filter.md) 经过产品/工程 owner 决定后再更新状态。未完成该治理决定前，不得把 ADR-001 的旧表述当作当前唯一行为说明。

## 约束与回滚

- 首屏 HTML 不依赖查询参数也可读完三张项目卡，避免未知 SSR 平台上的空白页和布局跳动。
- 未启用 JavaScript 时，查询参数不会隐藏内容；用户仍可阅读完整目录。
- 若正式托管确认支持稳定 SSR，可将查询参数解析移回页面服务端，并以同一纯筛选函数和 E2E 用例保持行为一致。
- 任何迁移不得改变 `/projects`、详情页 URL、内容事实或安全边界。
