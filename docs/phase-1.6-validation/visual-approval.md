# Phase 1.6 视觉回归批准记录

## 规则

WP0 的 `baseline/` 截图和 `prototype.md` 只作为改前证据与设计参考，不作为 Playwright golden。首次实现通过功能审查后，才允许生成 `tests/e2e/visual.spec.ts-snapshots/` 下的新 golden；从批准点起未知 diff 必须阻断，不能用批量更新掩盖变化。

## 当前状态

- 实现状态：测试矩阵已登记，覆盖首页、`/majors`、`/capabilities`、`/projects`、一个项目详情页；390/768/1440；亮/暗；菜单打开、筛选展开、无结果。
- Golden 状态：已在最终功能 E2E 42/42、axe serious/critical=0 后生成/更新 33 个候选快照；仍待非提交者/维护者批准。候选更新对应已审查的证据行、窄屏 CTA 换行和留白修正，不是未解释的 diff。
- 批准人：待指定的非提交者或维护者。
- 批准日期：待填写。
- 变更范围：当前工作树；生产构建 37 页，生成 33 个视觉状态快照。

在批准人和批准日期填写前，不能把 `npm run test:visual` 的成功视为 Phase 1.6 发布批准。
