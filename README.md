# HseeHub · 健康工程学生探索桌面

HseeHub 帮学生先看懂智能医学工程与生物医学工程，再试一个低风险小项目，留下可复核的产物，最后决定下一步往哪里走。

主线是：

```text
看懂专业 → 试一个小项目 → 留下可复核作品 → 再看下一步方向
```

首页服务第一次来的学生，不是培养方案镜像、资格判断工具或社区。卡面先说动作和成本，详情页再说明步骤、许可、停止条件和风险；来源、版本与核验记录集中在来源页和相关详情中。

## 页面入口

| 入口 | 用途 |
| --- | --- |
| [`/majors`](app/majors/page.tsx) | 专业与课程：共同底座、课程侧重、培养方案入口 |
| [`/projects`](app/projects/page.tsx) | 做个项目：三张体验卡、筛选、资源状态和产物模板 |
| [`/capabilities`](app/capabilities/page.tsx) | 能力地图：课程、工程任务与可迁移场景 |
| [`/pathways`](app/pathways/page.tsx) | 选下一步：日常任务、15 分钟动作和关键门槛 |
| [`/scenarios`](app/scenarios/page.tsx) | 跨场景关系页，从能力或项目进入 |
| [`/sources`](app/sources/page.tsx) | 来源、版本、许可与最后核验 |

已传播的旧路由继续保留，包括专业详情、课程版本、项目资源、场景详情和路径详情；本轮不建设登录、评论、社区、投稿、个人足迹或治理后台。

## Release A / P0 内容

- 首页依次呈现任务启动台、3 个精选项目、1 个同题双专业案例、1 个产物到 3 条路径的改写示例、4 个编辑部整理的常见问题和内容边界页尾。
- 项目卡固定展示适合谁、会留下什么、时长/最低基础/资源状态；项目详情补齐步骤、停止条件、模板、数据许可、风险边界和下一步。
- 三个项目都登记主入口、替代入口和 `linkAvailability`；状态只由 `content/evidence.json` 的 endpoint 数据聚合，不从文案猜测“可开始”。
- 三份预览来自确定性合成流程，素材登记了 `alt`、作者、许可、来源和生成脚本；不使用真实患者数据。
- `/pathways` 只做轻量比较，完整行动、来源、时效和证据改写下沉到路径详情。

## 技术栈与内容源

- Next.js 14 App Router + React 18 + TypeScript
- JSON 内容事实源、类型化读取层、构建期关系与链接校验
- 语义 CSS token、亮暗主题、reduced-motion、服务端输出核心文字
- `content/site-data.json`：专业、能力、项目、场景、FAQ 和来源
- `content/pathways.json`：路径、产物和方向改写
- `content/evidence.json`：claims、endpoint 与 `linkAvailability`
- `lib/content.ts`、`lib/content/`：类型、关系读取和事实状态

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

提交前运行完整门禁：

```bash
npm run check
```

也可以按需运行：

```bash
npm run lint          # 源码规范与 token 使用检查
npm run content:check # 内容、路径、项目 endpoint 和产物关系
npm run links:check   # 来源、项目工具和 endpoint URL 协议
npm run typecheck     # TypeScript 检查
npm run build         # Next.js production build
npm run test:e2e      # Playwright 关键路径
npm run test:visual   # Playwright 视觉基线
npm run lighthouse    # production build 下三页各运行三次取中位
```

Playwright 正式快照放在 `tests/e2e/__screenshots__/`；临时运行产物放在 `test-results/`，后者不能替代测试源码或正式基线。

正式部署前，请参考 [`.env.example`](.env.example) 设置 `NEXT_PUBLIC_SITE_URL`，让 canonical、sitemap 和 robots 使用真实站点地址。

## 安全边界

- 项目优先使用合成数据、公开授权数据或受控的本地教学材料。
- 不上传或处理真实患者数据、病历、医学影像或可识别健康信息。
- 不在站内执行不可信代码、训练模型或连接医院/校园生产系统。
- 医疗与健康相关内容只用于专业学习，不构成诊断、治疗或专业决策建议。
- 外部入口的实际条款、版本和资格信息以原页面为准；HseeHub 不提供录取、就业或个体资格结论。

## 维护节奏

新增内容先补来源、适用版本、许可、owner、更新时间和复核日期，再扩展页面。课程、学分与路径事实按版本维护，不原地覆盖历史内容。每次内容变更至少运行 `npm run check`，外部入口还需要人工核对其语义和许可。

## 相关文档

- [下一阶段产品与体验重构 Spec](docs/HseeHub-next-stage-experience-spec.md)
- [网站架构与产品规划](docs/HseeHub-website-architecture-spec.md)
- [第一版质量检查点](docs/HseeHub-v1-quality-checkpoints.md)
