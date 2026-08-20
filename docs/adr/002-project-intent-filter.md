# ADR-002：项目意图排序与旧筛选兼容

## 状态

拟议治理动作（2026-08-20）。未批准，不改变当前产品行为。

## 背景

[`ADR-001`](001-projects-static-filter.md) 记录了 Phase 1.5 的五维项目筛选：`major`、`capability`、`scenario`、`viewpoint`、`duration`。当前 `/projects` 已采用 `?intent=` 作为主要入口，按学生现在想做的事调整项目顺序，同时继续解析旧五维参数，避免已传播链接静默失效。

这形成了两个层次：新的产品体验契约是“意图只排序、不隐藏”，旧筛选是兼容契约；两者都仍然存在于代码中。Release C 要求记录这项漂移，但本次不借治理记录改变页面、URL 或兼容周期。

## 建议

建议批准后将 ADR-001 标记为 `Superseded for primary project-list experience`，由本 ADR 取代 `/projects` 的当前主体验描述，同时保留 ADR-001 的历史技术约束作为兼容背景：

1. `?intent=` 是当前主入口，只改变排序和解释，不隐藏其他项目。
2. 五维查询参数继续作为旧链接兼容路径，直到 owner 基于真实访问证据决定退役、重定向或继续保留。
3. `filterProjectCatalog` 继续作为旧筛选的纯函数 seam；是否继续扩展新的意图模型，另开产品决定。
4. 无 JavaScript 首屏可阅读全部项目、现有 URL 和安全边界保持不变。

## 未决治理动作

- 指定产品与工程 owner，确认当前筛选体验和兼容周期的正式决定；当前 owner 为 `TBD`。
- 检查站内引用、已传播链接和可获得的访问证据；没有证据时不得宣称旧参数已无消费者。
- 决定是否把 ADR-001 的状态改为 `Superseded`，并同步 README、Release C Spec 和动态验收证据索引。

## 本任务边界

本 ADR 只记录 ADR-001 与当前实现之间的漂移及后续治理建议；本任务不改 `/projects` 的排序、筛选解析、URL、组件或用户行为。
