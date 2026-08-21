# Release C RC-01～RC-16 验收状态

> 状态源地位：本文件是 Release C 唯一动态状态源；其他 Spec、历史矩阵和本目录模板不能另行定义当前状态。
>
> as-of：2026-08-21
>
> implementation commit：`e75174de185be5d771c33ac4aa69ffd67b427468`（当前 `HEAD`；工作区另有未提交的依赖兼容性与门禁修复）
>
> normative Spec：[`docs/HseeHub-release-c-student-field-spec.md`](../HseeHub-release-c-student-field-spec.md)
>
> 当前总体状态：`engineering complete` / `external validation blocked`

## 状态机

```text
engineering complete
→ validation candidate
→ validated RC
→ production-ready
```

- `engineering complete`：工程实现和机器门禁契约已具备；不等于真人、owner、preview、production 或回滚证据完成。
- `validation candidate`：具名 owner 与许可已确认，存在可分享且不索引的 preview，可以执行第一轮 5 人测试。
- `validated RC`：两轮 5 人测试、内容签核、人工无障碍/200% zoom 和候选发布证据全部满足。
- `production-ready`：生产配置、真实回滚演练、两次清洁环境完整门禁及证据归档全部满足。

当前只能沿上述顺序推进；不进入 Release D、Phase 2，也不恢复旧 Phase 1.7。执行顺序见 [`exit-plan.md`](exit-plan.md)。

## 动态验收表

状态字段只使用状态机中的状态，或使用 `BLOCKED` 表示缺少必要证据。`TBD` 是有意保留的缺口，不是默认 owner。自动化不得替代真人测试、内容签核、人工无障碍和发布证据；不得伪造 owner、测试结果、production URL、签核或回滚证据。任何缺失项保持 `BLOCKED`/`TBD`，直到真实证据写入对应模板并在本表登记。

| ID | RC 项 | 状态 | owner | 证据 | 阻塞原因 | 下一动作 |
|---|---|---|---|---|---|---|
| RC-01 | sitemap 按环境遵守 development/preview/production 契约 | engineering complete | TBD | `scripts/check-release-c.mjs`；`tests/e2e/release-a-baseline.spec.ts` | 本表不把代码存在伪写成新的环境运行结果 | 指定工程 owner，归档一次可复查的环境门禁日志 |
| RC-02 | 完整 `check:release-c` 连续两次全绿且正常退出 | BLOCKED | TBD | `package.json` 的 `check:release-c`；[`exit-plan.md`](exit-plan.md) | 尚无两次清洁环境、独立日志和正常退出证据 | 在 preview/clean checkout 中连续执行两次并归档日志 |
| RC-03 | 代表 Starter owner、许可和人工走通已批准 | BLOCKED | TBD | [`owner-signoff.md`](owner-signoff.md)；`content/resources/signal-feature-notebook.json` | owner、许可决定和人工走通仍待具名签核 | 确认 owner 与许可，逐项填写并签署 owner 记录 |
| RC-04 | Starter 可下载最小记录 | engineering complete | TBD | `components/starter-worksheet.tsx`；`tests/e2e/release-c.spec.ts` | 机器路径存在不等于真人能完成并定位文件 | 在第一轮 5 人测试中记录时间、错误和文件定位结果 |
| RC-05 | 项目详情以内部 Starter 为主动作 | engineering complete | TBD | `app/projects/[projectSlug]/page.tsx`；`tests/e2e/release-c.spec.ts` | 仍需由真人验证入口是否可发现且不被外部来源抢走 | 第一轮测试观察 T3，并把发现写入记录 |
| RC-06 | 首页无重点项目语义重复 | engineering complete | TBD | `components/content/home-sections.tsx`；`tests/e2e/home.spec.ts` | 自动化不能替代内容层级和重复感人工审阅 | 第一轮测试后由产品/内容 owner 记录决定 |
| RC-07 | 390px 首页高度不超过 4400px | engineering complete | TBD | `tests/e2e/home.spec.ts`；`tests/e2e/visual.spec.ts` | golden/DOM 证据不能替代真人可用性判断 | 将测试输出与第一轮设备观察一起归档 |
| RC-08 | 320px reflow 与真实 200% zoom 无溢出 | BLOCKED | TBD | [`accessibility-walkthrough.md`](accessibility-walkthrough.md)；`tests/e2e/visual.spec.ts` | 真实 200% zoom 尚无人工记录 | 由具名测试人完成 200% zoom、键盘和打印走查 |
| RC-09 | 两个专业 P0 事实完成 owner 签核 | BLOCKED | TBD | [`owner-signoff.md`](owner-signoff.md)；`content/claims.json` | 没有具名内容 owner、来源 locator 和签署决定 | 指定 owner，逐条核对 2025 级事实并签核 |
| RC-10 | 第一轮 5 人目标学生测试达到通过线 | BLOCKED | TBD | [`student-test-record.md`](student-test-record.md) | 尚未招募并测试 5 名目标学生 | 确认许可与招募，按 T1–T6 保留匿名记录和原话 |
| RC-11 | 根据发现修订后，第二轮 5 人测试达到通过线 | BLOCKED | TBD | [`student-test-record.md`](student-test-record.md)；[`exit-plan.md`](exit-plan.md) | 第一轮尚未完成，第二轮不得提前填写 | 完成修订并用不复用开发成员的目标学生执行第二轮 |
| RC-12 | 读屏、键盘、forced-colors、打印与人工 200% zoom 完成 | BLOCKED | TBD | [`accessibility-walkthrough.md`](accessibility-walkthrough.md) | 尚无真实 NVDA/VoiceOver、键盘和打印证据 | 指定测试人，完成整条 T3–T4 并归档问题与结果 |
| RC-13 | 构建、性能、axe 与视觉矩阵连续两次通过 | BLOCKED | TBD | `artifacts/perf-ci.json`；`tests/e2e/visual.spec.ts` | 当前产物不是两次清洁环境的完整门禁归档；人工视觉审阅也缺失 | 完成双次清洁环境门禁，保存原始 log、报告和人工批准 |
| RC-14 | preview 可分享且无索引 | BLOCKED | TBD | [`release-rollback.md`](release-rollback.md)；`.env.example` | 没有可分享 preview URL、访问许可和 runtime/metadata 证据 | 确认发布 owner 与访问边界，提供并验证 preview |
| RC-15 | production 配置和真实回滚演练完成 | BLOCKED | TBD | [`release-rollback.md`](release-rollback.md) | production URL、release/rollback 版本、owner 和演练均待提供 | 完成 production config 与真实回滚演练，记录开始/结束和结果 |
| RC-16 | 路由、内容域、禁止范围与依赖事实审计完成 | BLOCKED | TBD | `scripts/check-release-c.mjs`；`package.json`；`package-lock.json`；`.github/workflows/quality.yml` | 2026-08-21 本地清洁安装审计为 0 漏洞并已加入 CI 高危门禁，但尚缺独立清洁环境的归档日志 | 在 clean checkout/CI 中执行并归档 `npm audit --audit-level=high` 日志；不以未归档的本机结果标绿 |

## 证据规则

本表只记录已存在或已归档的事实。自动化可以证明代码路径、结构、链接和机器门禁，但不能证明学生理解、内容正确、owner 同意、人工无障碍通过、production URL 可用或回滚真实发生。缺少任一类证据时，状态保持 `BLOCKED`，owner/URL/签核/回滚字段保持 `TBD`，不得用“待后续”“默认负责人”或旧文档中的结果替代。
