# Phase 1.6 视觉回归批准记录

## 规则

WP0 的 `baseline/` 截图和 `prototype.md` 只作为改前证据与设计参考，不作为 Playwright golden。首次实现通过功能审查后，才允许生成 `tests/e2e/visual.spec.ts-snapshots/` 下的新 golden；从批准点起未知 diff 必须阻断，不能用批量更新掩盖变化。

## 当前状态

- 实现状态：测试矩阵已登记，覆盖首页、`/majors`、`/capabilities`、`/projects`、一个项目详情页；390/768/1440；亮/暗；菜单打开。当前项目页不再提供高级筛选控件，旧 query 只读显示并恢复全量结果，因此旧的“筛选展开/空结果”状态断言与 Phase 1.6 P0 契约不一致。
- Golden 状态：未更新新版 golden。功能关键用例 `13/13`、axe serious/critical=0、E2E smoke 和 a11y smoke 通过；`npm run test:visual` 的 33 个用例全部被现有 golden diff 阻断，首页/专业页等新版高度与旧 golden 不同。未在未经批准的情况下生成或替换 golden。
- 批准人：待指定的非提交者或维护者。
- 批准日期：待填写。
- 变更范围：当前工作树；生产构建 38 个生成页面；现有 33 个视觉断言保留作为阻断门禁。

在批准人和批准日期填写前，不能把 `npm run test:visual` 的成功视为 Phase 1.6 发布批准。
