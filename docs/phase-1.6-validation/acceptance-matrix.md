# HseeHub Phase 1.6 A01–A17 验收矩阵

> 历史快照（2026-08-17）：本矩阵保留 Phase 1.6 当时的阻塞项，不覆盖 Release C 的后续工程证据。当前状态以 `docs/release-c-validation/acceptance-status.md` 为准。

状态含义：`通过` 表示已有可复现证据；`部分通过/阻塞` 表示自动化或工程部分完成，但缺少 Spec 要求的真人、人工或发布环境证据；`阻塞` 不得解释为发布批准。

| ID | 状态 | 证据 | 负责人 | 失败原因 / 后续 |
| --- | --- | --- | --- | --- |
| A01 | 通过 | 初始对齐记录：`main@08e3799`、`origin/main@e6df957`；冲突消解后合入 `origin/main@c74a8e5`，当前 HEAD=`50cf131`；`npm run check` 通过；对比记录在 `baseline.md` | 主代理 | 无；未在旧基线上重复 Phase 1.5 |
| A02 | 通过 | `content/site-data.json` 的显式 home plan；首页 3 任务、3 项目、3 能力、6 场景；最终 E2E smoke | 主代理 | 无 |
| A03 | 通过 | `build-metrics.md`；390/768/1440 Playwright 截图与入口坐标；首页高度 Gate 通过 | 主代理 / 视觉审查待指定 | 无；人工“首屏理解”仍需 T1–T4 |
| A04 | 阻塞 | `home-sections.tsx`、Phase 1.6 CSS；关键功能 13/13 通过；31 个现有 visual golden 产生可复现 diff，2 个旧参数状态断言通过，未替换候选 | 主代理 / 指定维护者待批准 golden | 未获非提交者/维护者批准；未知 visual diff 必须阻断 |
| A05 | 通过 | `/majors/compare` 308；query 与 `#dual-lens` E2E；旧 case anchor、sitemap、canonical metadata | 主代理 | 无 |
| A06 | 阻塞 | `moderator-script.md`、`anonymous-record-form.md`、`summary-template.md` 已备齐 | 产品/内容负责人 | 当前无至少 5 名真实目标学生，T1–T4 无通过率；不得虚构 80% 结果或软件/硬件误解判定 |
| A07 | 部分通过/阻塞 | `content/evidence.json`、`scripts/check-evidence.mjs`；15 P0 claims、15 refs、10 endpoints；单测 13/13 | 内容负责人 | registry 是预置/自动核对，不等同内容负责人签字；owner 仍为“待人工复核” |
| A08 | 部分通过/阻塞 | evidence 聚合单测覆盖 unverified/degraded/unavailable/available/批准替代；`resources:probe` 生成 10 条带 endpointId、结果、finalUrl、checkedAt 的报告且未改内容；旧参数恢复 E2E | 主代理 / 内容负责人 | 当前运行环境外网探针为 0/10 可达，不能据此刷新 `content/resource-health.json`；需在可联网环境由内容负责人复核 |
| A09 | 部分通过/阻塞 | axe serious/critical=0；键盘/Escape、forced-colors、reduced-motion、390px E2E；a11y smoke 通过 | 主代理 / 无障碍负责人待指定 | 尚无 NVDA/VoiceOver 与真实 200% zoom 证据 |
| A10 | 通过 | 最终 390/768/1440 metrics；横向 scrollWidth 无越界；窄屏表格、双解 CTA 已修正 | 主代理 | 无 |
| A11 | 部分通过/阻塞 | `npm run check`、关键 Playwright 13/13、axe、E2E smoke、a11y smoke 通过；`test:visual` 33 用例中 2 个状态用例通过、31 个 golden diff 阻断 | 发布负责人待指定 | Lighthouse 工具/分数与生产 smoke 尚不可用；golden 仍待批准 |
| A12 | 阻塞 | `release:check` 主动拒绝缺失的正式 HTTPS、release/rollback 配置 | 发布负责人待指定 | 无可分享 PR preview、正式 HTTPS 域名、发布负责人、回滚版本与回滚演练记录；未执行外部发布 |
| A13 | 通过 | 变更审计：无账号、社区、数据库、追踪、真实患者数据、站内代码执行 | 主代理 | 无 |
| A14 | 阻塞 | `artifacts/perf-ci.json` 记录 3-run gate 未产出样本 | 性能/发布负责人待指定 | 环境没有可执行的 Lighthouse，3 次移动端中位数未产生，不能宣称性能/无障碍/SEO 达标 |
| A15 | 通过 | `build-metrics.md`；首页 96.2 kB ≤ min(96.2,100)，`/projects` 98.6 kB 不高于基线 | 主代理 | 无 |
| A16 | 通过 | 最终首页：390=5057≤5064、768=5544≤6144、1440=3326≤3600 | 主代理 | 无；这不是 RUM Web Vitals 结果 |
| A17 | 部分通过/阻塞 | 文案已改为任务、关系行、体验卡、文本列表；原型与视觉 diff 可复查 | 内容负责人待指定 | 尚未有独立术语走查记录；需补“删除/改写/解释/保留理由+负责人” |

## 发布结论

A06、A07、A09、A11、A12、A14、A17 仍有人工或环境阻塞。任一 P0 人工证据缺失时停止发布；当前可以进入“工程实现复核 / 预览验收准备”，不能进入生产发布审批完成态。
