# Release C 退出计划

> 文档地位：Release C 的执行顺序与状态转换说明。当前动态结果只写入 [`acceptance-status.md`](acceptance-status.md)。
>
> 当前入口状态：`engineering complete` / `external validation blocked`
>
> 下一状态：`validation candidate → validated RC → production-ready`

本计划只收口 Release C，不开启 Release D、Phase 2，也不恢复旧 Phase 1.7。每一步都必须完成前置条件并归档真实证据；不得跳步、倒填或以自动化结果代替真人和人工验收。

## 执行顺序

| 顺序 | 动作 | 进入条件 | 必须归档的证据 | 完成后的状态/动作 |
|---:|---|---|---|---|
| 1 | owner 与许可确认 | 产品、内容、无障碍、发布和测试责任人已具名；Starter 许可与安全边界有决定 | [`owner-signoff.md`](owner-signoff.md)；许可来源 locator；责任人和测试许可记录 | 缺任一项保持 `BLOCKED/TBD`；全部确认后准备 preview |
| 2 | 提供可分享 preview | preview 可访问、不索引；版本、环境、runtime 和 metadata 契约可验证 | preview URL、访问说明、metadata/runtime 输出；[`release-rollback.md`](release-rollback.md) | 可进入 `validation candidate`；不得把本地地址当 preview URL |
| 3 | 第一轮 5 人测试 | 5 名真实目标学生已获许可；至少 3 名主要使用手机、至少 3 名大一/大二 | [`student-test-record.md`](student-test-record.md)；逐人 T1–T6、设备、时间、失败步骤和原话 | 未完成或未过线保持 `BLOCKED`；按发现制定修订项 |
| 4 | 根据发现修订 | 第一轮发现已分类；每个 P0 问题有处理决定或明确不处理理由 | 修订提交/文件清单；问题—决定—复测映射；更新后的工程门禁输出 | 修订未复测前不得开始第二轮 |
| 5 | 第二轮 5 人测试与人工 a11y/200% zoom | 修订已复测；第二轮使用目标学生；具名人工测试人和设备已确认 | 第二轮 [`student-test-record.md`](student-test-record.md)；[`accessibility-walkthrough.md`](accessibility-walkthrough.md)；NVDA/VoiceOver、键盘、forced-colors、打印和真实 200% zoom 证据 | 全部通过后才可申请 `validated RC`；自动化 axe 不能替代本步 |
| 6 | production 配置与真实回滚演练 | production URL、release/rollback 版本和发布 owner 已确认；rollback 版本不同于 release | [`release-rollback.md`](release-rollback.md)；真实开始/结束时间、命令、结果、canonical/robots/sitemap/runtime/smoke 输出 | 回滚未真实演练保持 `BLOCKED`；不得用回滚脚本存在替代演练 |
| 7 | 两次清洁环境完整门禁及证据归档 | 前六步没有未解释的阻塞；每次都从清洁环境使用 authoritative lockfile | 两次独立 log、环境/Node/npm/浏览器版本、构建、内容、链接、axe、E2E、视觉、Lighthouse、metadata/runtime 和退出码 | 两次完整通过后，更新状态表并做最终判定 |
| 8 | `validated RC` / `production-ready` 判定 | 对照 [`acceptance-status.md`](acceptance-status.md) 的 RC-01～RC-16 逐项核对；无 `BLOCKED/TBD` 的硬门槛 | 状态表更新记录、证据索引、未关闭风险和发布决定 | 仅满足真人/人工/候选证据时标记 `validated RC`；生产配置、回滚和双次门禁全齐后才标记 `production-ready` |

## 不可替代的证据边界

自动化可以证明页面、链接、结构、机器可达性、构建和门禁命令结果，但不得替代：

- 真人目标学生任务测试与原话记录；
- 内容 owner 对事实、许可和安全边界的签核；
- 人工 NVDA/VoiceOver、键盘、forced-colors、打印和真实 200% zoom 走查；
- 可分享 preview、正式 production 配置、发布 owner 和真实回滚演练；
- 清洁环境完整门禁的原始日志和证据归档。

不得伪造 owner、参与者、测试结果、production URL、签核、release/rollback 版本或回滚证据。缺失项保持 `BLOCKED/TBD`，并在唯一动态状态源登记下一动作。

## 与并行 code-health 流的关系

[`HseeHub-code-health-remediation-spec.md`](../HseeHub-code-health-remediation-spec.md) 是拟实施、并行的工程治理流。它可以改善依赖、静态分析、CI、覆盖率和仓库保护，但不能关闭本计划中的真人、owner、preview、production 或回滚阻塞；两套完成条件分别记录。
