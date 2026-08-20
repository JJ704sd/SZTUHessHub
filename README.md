# HseeHub · 健康工程学生探索桌面

HseeHub 帮学生先看懂智能医学工程与生物医学工程，再试一个低风险小项目，留下能讲清过程与限制的作品，最后决定下一步往哪里走。

主线是：

```text
看懂专业 → 试一个小项目 → 留下真实作品 → 再看下一步方向
```

首页服务第一次来的学生，不是培养方案镜像、资格判断工具或社区。卡面先说动作和成本，详情页再说明步骤、许可、停止条件和风险；来源、版本与核验记录集中在来源页和相关详情中。

## 页面入口

| 入口 | 用途 |
| --- | --- |
| [`/majors`](app/majors/page.tsx) | 专业与课程：共同底座、课程侧重、培养方案入口 |
| [`/projects`](app/projects/page.tsx) | 做个项目：按四类行动意图进入、查看真实资源状态和产物模板 |
| [`/capabilities`](app/capabilities/page.tsx) | 能力地图：课程、工程任务与可迁移场景 |
| [`/pathways`](app/pathways/page.tsx) | 选下一步：日常任务、15 分钟动作和关键门槛 |
| [`/pathways/explore`](app/pathways/explore/page.tsx) | 还没想好：一周双路径短实验与本地复盘单 |
| [`/scenarios`](app/scenarios/page.tsx) | 跨场景关系页，从能力或项目进入 |
| [`/sources`](app/sources/page.tsx) | 来源、版本、许可与最后核验 |

已传播的旧路由继续保留，包括专业详情、课程版本、项目资源、场景详情和路径详情；本轮不建设登录、评论、社区、投稿、个人足迹或治理后台。

## Release B / P0 内容（已实现基线；冲突以 Release C 为准）

- 首页先给出三个动作，再呈现 1 个重点项目与 2 个紧凑条目、同题双专业案例、产物到 3 条路径的改写、最近更新和 3 个常见问题。
- 项目列表以 `?intent=` 的四类学生意图排序而不隐藏项目；已传播的五维筛选 URL 保留一个兼容周期，未知值回退到全部并给出说明。
- 项目卡固定展示适合谁、会留下什么、时长/最低基础/资源状态；项目详情按真实 endpoint 状态决定开始动作，并补齐步骤、过程图、作品注释、停止条件、模板、数据许可、风险边界和下一步。
- 三个项目都登记主入口、替代入口和 `linkAvailability`；状态只由 `content/evidence.json` 的 endpoint 数据聚合，不从文案猜测“可开始”。
- 七份入口、过程与结果预览来自确定性合成流程，素材登记了角色、`alt`、作者、许可、来源、更新时间和生成脚本；不使用真实患者数据。
- `/pathways` 只做轻量比较，完整行动、来源、时效和证据改写下沉到路径详情。

## 技术栈与内容源

- Next.js 14 App Router + React 18 + TypeScript
- JSON 内容事实源、类型化读取层、构建期关系与链接校验
- 语义 CSS token、亮暗主题、reduced-motion、服务端输出核心文字
- `content/site-data.json`：专业、能力、项目、场景、FAQ 和来源
- `content/updates.json`：经过编辑确认的最近更新，不从更新时间自动推断事件
- `content/pathways.json`：路径、产物和方向改写
- `content/evidence.json`：claims、endpoint 与 `linkAvailability`
- `lib/content.ts`、`lib/content/`：类型、关系读取和事实状态

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

当前推荐的工程门禁按 Release C 执行：

```bash
npm run release-c:check  # Release C 范围与实现契约
npm run check:release-c  # 完整工程门禁；需要本地环境与浏览器
```

`check:release-c` 只证明工程门禁，不关闭真人测试、内容 owner、人工无障碍、preview、production 或回滚阻塞。

也可以按需运行：

```bash
npm run lint          # 源码规范与 token 使用检查
npm run content:check # 内容、路径、项目 endpoint 和产物关系
npm run content:release-b-test # FAQ 与 Release B 内容契约负向回归
npm run links:check   # 来源、项目工具和 endpoint URL 协议
npm run typecheck     # TypeScript 检查
npm run build         # Next.js production build
npm run test:e2e      # Playwright 关键路径
npm run test:a11y     # axe 核心页面检查
npm run test:visual   # Playwright 视觉基线
npm run test:release-b-browser # 单一生产服务器上顺序运行 E2E、axe 与视觉
npm run lighthouse    # 三页各运行三次取中位并归档报告；production 额外阻断 SEO
npm run perf:ci       # 与 lighthouse 相同的 CI 阻断门禁
```

Playwright 正式快照放在 `tests/e2e/__screenshots__/`；临时运行产物放在 `test-results/`，后者不能替代测试源码或正式基线。

正式部署前，请参考 [`.env.example`](.env.example) 设置 `NEXT_PUBLIC_SITE_URL`，让 canonical、sitemap 和 robots 使用真实站点地址。

## 内容与迭代

首版内容主要维护在 [`content/site-data.json`](content/site-data.json)，类型定义和内容读取层位于 [`lib/content/`](lib/content/)，站点级配置位于 [`lib/site-config.ts`](lib/site-config.ts)。新增或更新内容时应优先扩展内容模型和关系字段，不在页面组件中复制专业名称、版本、数量或颜色规则。

每次内容变更至少检查：

1. 课程、能力、场景、项目之间的关系 ID 是否仍然有效。
2. 来源、适用版本、许可、数据访问级别和最后核验时间是否齐全。
3. 学分与课程是否绑定正确的培养方案版本。
4. 是否仍然清楚表达“能力可以迁移，但领域门槛和安全责任不会自动消失”。
5. `npm run check` 是否通过。

## 规划与质量门禁

当前状态是 `Release C engineering implemented / external validation blocked`。下一状态只能按 `validation candidate → validated RC → production-ready` 推进；不进入 Release D、Phase 2，也不恢复旧 Phase 1.7。Release C 的动态状态唯一记录在 [`docs/release-c-validation/acceptance-status.md`](docs/release-c-validation/acceptance-status.md)，执行顺序见 [`docs/release-c-validation/exit-plan.md`](docs/release-c-validation/exit-plan.md)。

并行的 [`code-health remediation Spec`](docs/HseeHub-code-health-remediation-spec.md) 只负责工程治理，不替代 Release C 验收。

历史关系：`codex/phase-1.6@57b997e` 中的 Phase 1.7 文档未合并；部分内容被 Release A/B 吸收，顶层产品方向已被后续规范覆盖。它只作为历史输入记录，不恢复为当前规范。

- [Release C：首次有效产出与发布闭环 Spec](docs/HseeHub-release-c-student-field-spec.md)（Current normative scope）
- [Release B 产品与网页体验深化 Spec](docs/HseeHub-release-b-experience-spec.md)（已实现基线；冲突以 Release C 为准）
- [Release A 产品与体验重构 Spec](docs/HseeHub-next-stage-experience-spec.md)（历史；已被 Release B 取代）
- [Phase 1.5：体验压缩、关系闭环与发布验证 Spec](docs/HseeHub-phase-1.5-experience-spec.md)（历史；冲突以 Release C 为准）
- [Phase 1.6 验收资料](docs/phase-1.6-validation/acceptance-matrix.md)（历史快照；不承担当前动态状态）
- [网站架构与产品规划](docs/HseeHub-website-architecture-spec.md)（历史架构基线）
- [HseeHub 第一版质量检查点](docs/HseeHub-v1-quality-checkpoints.md)（历史质量基线）
- [ADR-001：项目目录采用静态首屏加客户端筛选](docs/adr/001-projects-static-filter.md)（已接受；存在当前体验漂移记录）
- [ADR-002：项目意图排序与旧筛选兼容](docs/adr/002-project-intent-filter.md)（拟议治理动作；本任务不改变产品行为）

## 安全边界

- 项目优先使用合成数据、公开授权数据或受控的本地教学材料。
- 不上传或处理真实患者数据、病历、医学影像或可识别健康信息。
- 不在站内执行不可信代码、训练模型或连接医院/校园生产系统。
- 医疗与健康相关内容只用于专业学习，不构成诊断、治疗或专业决策建议。
- 外部入口的实际条款、版本和资格信息以原页面为准；HseeHub 不提供录取、就业或个体资格结论。

## 维护节奏

新增内容先补来源、适用版本、许可、owner、更新时间和复核日期，再扩展页面。课程、学分与路径事实按版本维护，不原地覆盖历史内容。每次内容变更至少运行 `npm run check`，外部入口还需要人工核对其语义和许可。

## 相关文档

- [Release C：首次有效产出与发布闭环 Spec（Current normative scope）](docs/HseeHub-release-c-student-field-spec.md)
- [Release C 动态验收状态（唯一状态源）](docs/release-c-validation/acceptance-status.md)
- [Release C 退出计划](docs/release-c-validation/exit-plan.md)
- [Release B 产品与网页体验深化 Spec（已实现基线）](docs/HseeHub-release-b-experience-spec.md)
- [Release A 产品与体验重构 Spec（历史/已被 Release B 取代）](docs/HseeHub-next-stage-experience-spec.md)
- [网站架构与产品规划（历史架构基线）](docs/HseeHub-website-architecture-spec.md)
- [第一版质量检查点（历史质量基线）](docs/HseeHub-v1-quality-checkpoints.md)
