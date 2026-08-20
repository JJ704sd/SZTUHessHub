# HseeHub Release C：首次有效产出与发布闭环 Spec

> - 文档地位：Current normative scope（当前权威产品规范）
> - 状态：engineering implemented; external validation blocked
> - 修订日期：2026-08-20
> - 规范起始基线：`4ef9f05`（`codex/release-a-p0`）
> - 当前实现快照：以实际 `HEAD` 为准：`478cf570a4f415a6913495f82aa9804942eb235f`；工作区仍有未提交的用户 Lighthouse/CI 改动，不将其伪写成新的提交事实。
> - 唯一动态状态源：[`docs/release-c-validation/acceptance-status.md`](release-c-validation/acceptance-status.md)
> - 冲突优先级：Release C 对 Phase 1.5、Phase 1.6、Release B 的冲突项具有更高优先级。
> - 下一状态路径：`validation candidate → validated RC → production-ready`；不进入 Release D、Phase 2，也不恢复旧 Phase 1.7。
> - 上游阶段：Release B、Phase 1.5、Phase 1.6
> - 适用范围：首页、项目列表、代表项目详情与 Starter、事实与资源状态、质量和发布闭环
> - 保留文件名是为了维持既有文档链接；本稿已经取代原“学生现场与编辑流”方案。
> - 历史关系：`codex/phase-1.6@57b997e` 中的 Phase 1.7 文档未合并；其部分内容被 Release A/B 吸收，顶层产品方向已被后续规范覆盖。该历史输入不构成当前规范。

---

## 文档地位与状态收口

本文件规定 Release C 的产品范围、验收条件和发布边界；它是静态规范，不是动态结果表。当前总体状态固定为 `engineering implemented / external validation blocked`。动态状态、每个 RC 项的责任人、证据、阻塞原因和下一动作，只能写入并读取 [`docs/release-c-validation/acceptance-status.md`](release-c-validation/acceptance-status.md)。`owner-signoff.md`、`student-test-record.md`、`accessibility-walkthrough.md` 和 `release-rollback.md` 是证据模板，不是第二套状态源。

唯一允许的下一状态机是：

```text
engineering complete
→ validation candidate
→ validated RC
→ production-ready
```

状态含义和转换条件如下：

| 状态 | 含义 | 允许的下一步 |
|---|---|---|
| `engineering complete` | 工程实现与机器门禁契约已具备；不等于真人、owner、预览或生产证据完成 | 按 [Release C 退出计划](release-c-validation/exit-plan.md) 补齐前置条件，进入 `validation candidate` |
| `validation candidate` | owner 与许可已确认，存在可分享且不索引的 preview，可以开始第一轮 5 人测试 | 根据发现修订并执行第二轮测试与人工无障碍验收 |
| `validated RC` | 两轮真人测试、内容签核、人工无障碍和候选发布证据全部满足 Spec | 完成生产配置、真实回滚演练和两次清洁环境门禁 |
| `production-ready` | 生产配置、回滚、双次完整门禁及证据归档均通过 | 只进入发布执行，不开启新的产品阶段 |

本文件内的 Release C WP0–WP4 只是实施包的说明，不是全局 Phase 2 的授权，也不是 Release D 的入口。下一动作顺序以 [exit-plan.md](release-c-validation/exit-plan.md) 为准。

## 0. 一页结论

HseeHub 已经不是一个缺页面、缺信息架构或缺基础工程能力的网站。当前版本有完整的专业—能力—项目—路径关系，能展示来源、风险和资源状态，也已经做出第一个零安装 Starter。

下一阶段真正缺少的是一条被真实学生验证过、能稳定发布的完整价值链：

```text
我知道今天可以做什么
→ 我进入一个不用先安装环境的起点
→ 我在 10 分钟内完成一次有效操作
→ 我保存一份能说明观察与限制的最小记录
→ 我据此决定是否继续这个项目或方向
```

Release C 因此不建设社区、投稿、评论、登录、个人足迹或内容流。旧稿依赖的“至少 5 名贡献者、8 条学生记录、peer/editorial 双模式”没有仓库证据，也不是当前主线成立的必要条件。用尚不存在的社区供给去解决首页“太官方”的问题，会把内容真实性、治理和长期运营风险一起提前引入。

Release C 的唯一产品目标是：

> 让第一次来的学生从“看懂”走到“一次可保存的有效产出”，并完成真人、内容、无障碍和发布环境验收。

本阶段四个不可互换的结果：

1. **门禁可信**：修复环境与 sitemap 测试契约错位，`check:release-c` 连续两次完整退出且全绿。
2. **首次产出成立**：代表项目从详情页直达内部 Starter，学生能在 10–12 分钟内保存最小记录。
3. **页面做减法**：首页不再重复同一重点项目，移动首页高度从当前 6151px 压到不超过 4400px。
4. **人工证据闭环**：两轮目标学生任务测试、内容 owner 签核、真实 200% zoom 与屏幕阅读器走查、预览和回滚演练都有可复查记录。

若时间不足，优先级固定为：

```text
门禁契约 → Starter 可完成性 → 真人验证 → 首页减法 → 其他页面视觉精炼
```

---

## 1. 当前项目基线

### 1.1 已经具备的能力

截至 `4ef9f05`，仓库的可复查基线如下。

| 维度 | 当前事实 | Release C 含义 |
|---|---|---|
| 技术栈 | Next.js 14.2.35、React 18.3.1、TypeScript 5.7.3、Zod 3.24.2 | 不换框架，不引入 UI 大包 |
| 页面产物 | production build 生成 46 个页面单元；`/projects` 为动态路由，其余核心内容以静态/SSG 为主 | 继续保持服务端输出和低运行成本 |
| 内容规模 | 2 专业、2 双专业案例、8 能力、3 项目、6 场景、6 FAQ、13 来源、5 路径、3 产物 | 不扩 taxonomy，先提高现有内容的行动转化 |
| 证据模型 | 20 个字段 claim、20 个 evidence ref、26 个 endpoint；另有 5 条高层 claim registry | 先消除“自动验证”与“人工签核”的语义混淆 |
| 项目资源 | 3 个项目的健康快照记为 `available`；26 个 endpoint 中 16 个 `available`、10 个 `unverified` | 机器/登记状态不等同 owner 已批准 |
| Starter | `/projects/signal-feature-notebook/starter` 已支持固定合成信号、三行观察、打印/保存页面 | 作为唯一代表性垂直切片，先验证再复制 |
| 事件契约 | 8 个隐私安全事件名和字段白名单已定义 | 当前只在非 production `console.debug`，且页面未接入，不是线上分析系统 |
| 视觉基线 | 7 页面 × 3 viewport × 2 theme，加 3 个状态，共 45 张快照 | 继续作为回归基线，不把像素通过等同体验通过 |
| 性能 | 首页 First Load JS 96.2 kB；构建预算 `/page` 94.2 KiB gzip、`/projects/page` 96.8 KiB gzip，均通过 | 视觉修改不得突破既有预算 |
| CSS | `app/globals.css` 1012 行 | 不再追加新一代全局覆盖；新改动应局部化并删除旧消费者 |

首页当前由五段组成：任务入口、项目精选、同题双专业、作品到路径、更新与 FAQ。结构已经完整，主要问题是密度和优先级，不是缺模块。

### 1.2 当前门禁的真实状态

2026-08-19 在当前工作树实测：

- `npm run check`：通过；包含 lint、内容、链接、证据、结构、事件契约、类型、15 个 Vitest、production build 和 bundle 预算。
- `npm run check:release-b`：失败；E2E 为 27 passed / 6 skipped / 3 failed。
- 三个失败来自同一根因：非 production sitemap 按 `app/sitemap.ts` 的设计为空，但 `release-a-baseline.spec.ts` 无条件要求出现 `/pathways/explore`。
- 因 E2E 失败，聚合命令没有进入 axe 与视觉阶段。
- 单独运行视觉矩阵时，45 个用例均输出通过，但命令未正常退出，需要人工中断；因此不能把浏览器门禁记录为绿色。

这不是页面功能回归，而是测试环境契约和进程生命周期没有统一。Release C 的 Gate 0 必须先解决它。

正确契约应是：

| 环境 | canonical | robots | sitemap |
|---|---|---|---|
| development | 无 | `Disallow: /` | 空 |
| preview | 无 | `Disallow: /` | 空 |
| production | 正式 HTTPS origin | `Allow: /` | 含所有公开正式路由 |

E2E 不得在 development/preview 同时要求 production sitemap 语义。

### 1.3 尚未完成且不能由自动化替代的事项

仓库现有 `docs/phase-1.6-validation/wp0-status.md` 与验收矩阵仍明确记录：

- 没有至少 5 名真实目标学生的 T1–T4 结果；
- 没有内容负责人对两个 2025 级培养方案关键事实签字；
- 没有 NVDA/VoiceOver 和真实 200% zoom 证据；
- 没有可分享预览地址、正式 HTTPS 域名、发布 owner、回滚版本和回滚演练记录。

最新工程提交不能自动补齐这些证据。Release C 必须把它们当成发布条件，而不是“后续运营事项”。

### 1.4 当前体验的主要矛盾

#### 首页重复，而不是信息不足

首屏右侧先预告 signal-feature 项目，下一段又用完整重点卡展示同一项目，随后作品段第三次讲解同一产物。自动化只验证 DOM 中“各有一张卡”，但真实用户感知仍是重复。

#### 能开始的入口藏得太深

代表项目已经有内部 Starter，但项目详情的首要 CTA 仍打开 PhysioNet 外部说明页；内部 Starter 位于作品模板段落后。对第一次来的学生，外部参考来源不是最小行动。

#### 页面仍像专题报告

当前首页桌面快照高 3594px，390px 移动快照高 6151px。大标题、长说明、完整卡片、同题双解、作品注释和 FAQ 依次堆叠，视觉可信但浏览成本高。

#### “已核验”仍有语义冲突

`content/evidence.json` 中字段证据的机器校验通过，但 `content/claims.json` 的 5 条 registry 仍全是 `draft`，owner 为待确认。Starter manifest 的 license 仍为 `NOASSERTION`，人工走通和许可证证据仍 pending。机器可达、内容复核和许可批准必须分开呈现。

#### 事件合同还不是产品数据

当前 `trackEvent` 在 production 主动 no-op，`TaskAreaViewed` 和带事件的 `TrackedLink` 也未挂入实际页面。因此 Release C 不得写“漏斗已上线”或用它证明转化提升。

---

## 2. 第一性原理

### 2.1 用户价值来自降低一次选择的不可逆感

学生面对专业和方向时，通常不是完全缺信息，而是担心选错、担心基础不够、担心项目做不完。继续增加介绍只会增加阅读量。

最有效的产品动作是把“大选择”降维成一次可逆的小实验：

```text
方向判断成本
= 理解成本
+ 第一次行动成本
+ 失败后的退出成本
+ 结果无法解释的成本
```

Release C 要同时降低四项成本：用短比较降低理解成本，用零安装 Starter 降低行动成本，用停止条件降低退出成本，用可下载记录降低解释成本。

### 2.2 第一个有效动作比第一个外部链接更重要

外部资源可以是真实来源，但它通常要求用户自行判断页面、数据集、环境和下一步。对新手，“打开来源”不是完成任务。

代表项目的主动作必须发生在 HseeHub 已控制且已说明边界的范围内。只有完成 Starter 后，外部来源才作为继续学习或核对依据出现。

### 2.3 最小产出必须可保存、可复述、可指出限制

“看完一张图”不是产出，“点过一个链接”也不是产出。最小产出至少包含：

1. 我观察了什么；
2. 我怎样判断；
3. 哪个结论不能外推；
4. 一个可本地保存的文件或页面。

它不证明专业胜任、项目完成、科研成果或就业能力，只证明用户完成了一次可复核的学习动作。

### 2.4 社区感来自真实行为，不等于必须建设社区

参考站显得不官方，关键不是账号、排行榜或头像，而是页面持续回答“现在能做什么、最近发生了什么、下一步去哪”。HseeHub 可以通过真实任务、资源状态、核验时间和具体动作获得同样的现场感。

在没有稳定贡献者、审核 owner、授权与撤回机制时，创建学生内容流只会产生假热闹。Release C 不用虚构作者、活跃度、点赞或“同学都在做”。

### 2.5 人工验证是产品事实的一部分

自动化能证明页面存在、链接可达、没有已知结构回归；不能证明学生看得懂、愿意开始、能在 10 分钟内完成，也不能代替内容 owner 签字。

因此“真人测试证据齐全”与“代码测试全绿”是两个并列发布条件。

---

## 3. 从参考站迁移什么

参考对象：[SZTUBitByte](https://sztubitbyte.com/)。Release C 学习的是产品组织原则，不复制品牌、配色、图标或社区功能。

### 3.1 迁移的设计精髓

1. **首屏先给动作**：先回答今天能做什么，不先介绍站点愿景。
2. **以时间和状态组织内容**：10 分钟、现在可开始、最后核验于，比“平台能力”更有用。
3. **模块外层才做卡片**：模块内优先用整行可点击列表，减少卡片套卡片。
4. **使用具体元数据**：时长、基础、产物、状态、来源、更新时间，不写空泛宣传语。
5. **轻层级**：中性底色、一个主强调色、低饱和辅助 tint、淡边框和克制 hover。
6. **移动端重新排序**：不是把桌面两栏机械变成一条超长单列。
7. **空态给下一步**：不可用时说明原因、替代入口和何时复核，不只写“暂无”。

### 3.2 明确不照搬

- 不复制七个一级导航、账号体系、个人足迹、热力图、排行榜或皮肤系统；
- 不因为参考站有动态流就创建尚无真实供给的 feed；
- 不复制其小字号；正文保持 15–16px，元信息不低于 12–13px；
- 不复制具体蓝色、Logo、卡片造型或文案；
- 不把高密度侧栏直接挪到移动页面底部。

### 3.3 HseeHub 的差异化

HseeHub 不是校园技术社区，而是一张“专业判断前的低风险实验桌”。它的独特价值是把培养事实、工程任务、资源边界和最小作品接成一条可执行路径。

---

## 4. Release C 定义

### 4.1 一句话定位

> 给健康工程学生的探索桌：先做一次低风险小实验，留下可复核的最小记录，再决定要不要继续。

### 4.2 核心用户

#### 主用户

- 正在理解智能医学工程与生物医学工程差异的大一、大二学生；
- 对数据、传感、材料任务感兴趣，但不知道自己能否开始的学生；
- 主要使用手机浏览，可能没有配置 Python 或工程工具环境的学生。

#### 次用户

- 帮学生解释专业差异的辅导员、教师或高年级同学；
- 负责培养方案、来源、许可和安全边界复核的内容 owner；
- 负责预览、部署和回滚的发布 owner。

### 4.3 Jobs to be Done

1. 当我不知道两个专业怎么选时，我想用一个具体任务看见它们的侧重，而不是读两份介绍。
2. 当我担心基础不够时，我想先做一个不用安装环境的小动作，判断自己是否愿意继续。
3. 当我做完后，我想留下一份可以保存和解释的记录，而不是只记得“我看过”。
4. 当我需要相信页面时，我想知道谁核验、何时核验、资源是否可达、哪些结论不能外推。

### 4.4 P0 目标

- 代表项目详情到 Starter 的主路径不超过 2 次点击；
- 新浏览器、无账号、零安装时可完成 Starter；
- 至少 4/5 目标学生在 12 分钟内生成并本地保存最小记录；
- 至少 4/5 能用自己的话说明一项观察和一项不能外推的结论；
- 首页 390px 全页高度不超过 4400px，首个可行动 Starter 在前两屏内；
- 所有 P0 事实和 Starter 许可有明确 owner 与人工签核；
- `check:release-c` 连续两次全绿且正常退出；
- 预览、production 配置检查与回滚演练有证据。

### 4.5 非目标

Release C 不做：

- 登录、注册、评论、点赞、关注、消息、排行；
- 学生投稿、编辑收件、内容审核后台；
- `field-notes.json`、学生现场 feed 或 peer/editorial 双模式；
- CMS、数据库、搜索服务或第三方分析 SDK；
- 为所有 3 个项目同时建设 Starter；
- 在线执行任意代码、上传文件或处理真实患者数据；
- 专业推荐、录取/就业/资格结论；
- 大规模重新设计全部 46 个页面单元。

---

## 5. 核心产品闭环与信息架构

### 5.1 一级导航

继续保持四项，不增加社区入口：

| 导航 | 用户问题 |
|---|---|
| 专业 | 两个专业到底差在哪？ |
| 小项目 | 我今天能试什么？ |
| 能力 | 我在练什么能力？ |
| 下一步 | 做完以后往哪里走？ |

来源、FAQ、About 保留在上下文链接与页脚，不争夺一级导航。

### 5.2 主路径

```text
首页主 CTA
→ /projects/signal-feature-notebook/starter
→ 下载记录 / 打印保存
→ 回到项目详情选择继续资源或下一步路径
```

项目浏览路径：

```text
首页“看全部小项目”
→ /projects?intent=quick-look
→ /projects/signal-feature-notebook
→ /projects/signal-feature-notebook/starter
```

专业理解路径：

```text
首页专业入口
→ /majors/compare#dual-lens
→ 代表任务
→ 相关项目
→ Starter
```

### 5.3 路由决策

- 保留所有现有公开路由；
- Starter 只为 `signal-feature-notebook` 生成静态页，其他项目不得出现失效 Starter 链接；
- 不新增 `/community`、`/field`、`/contribute` 等路由；
- 旧五维项目查询参数在 Release C 期间继续兼容并给出提示；计划不早于 2026-10-01 移除，移除前必须确认站内无引用并完成访问证据或明确无分析数据的风险签字；
- production sitemap 纳入已批准公开的 Starter；preview/development sitemap 继续为空。

---

## 6. 首页重组规格

### 6.1 页面主线

首页从当前五个等权专题重组为五个有明确角色的区块：

1. 今天从哪开始；
2. 30 秒看懂专业侧重；
3. 挑一个能完成的小项目；
4. 做完会留下什么；
5. 依据与最近核验。

FAQ、完整更新、完整路径改写不再在首页展开；它们保留入口并下沉到对应页面。

### 6.2 首屏：今天从哪开始

推荐文案：

```text
今天先碰一个小问题。
不用先选专业，也不用先装环境。看懂差异，或花 10 分钟试一次。
```

首屏只保留三个动作：

| 动作 | 去向 | 辅助说明 |
|---|---|---|
| 看两个专业怎么分工 | `/majors/compare#dual-lens` | 用同一道题看两种工程视角 |
| 做一次 10 分钟 Starter | 代表项目 Starter | 无账号、零安装、只用合成信号 |
| 我还没想好 | `/pathways/explore` | 用两条短任务做一周比较 |

主 CTA 只有一个：“做一次 10 分钟 Starter”。其余使用整行次级入口。

当前首屏右侧的重点项目 teaser 删除，不再在下一段重复同一项目。桌面可在右侧显示 Starter 的真实结果缩略图与三项状态：`10 分钟 / 可本地保存 / 不含真实健康数据`；移动端把它压成一条结果预览，放在主 CTA 后。

### 6.3 30 秒专业比较

只呈现一个代表性双专业任务，不在首页展开完整输入/输出/接口详情。

结构：

- 共同问题一句；
- 左右两种视角各一行“主要负责什么”；
- 共同产物一行；
- CTA：“看完整分工与接口”。

桌面为左右对照条，移动端为上下两行；整个模块不超过移动端 1.2 屏。

### 6.4 三个项目列表

首页同时展示 3 个项目，但使用一张轻模块内的三行列表，不再使用一个大卡加两个小卡。

每行固定字段：

```text
任务标题
时长 · 最低基础 · 会留下什么
内部起点状态 · 外部资源状态
一个动作
```

代表项目动作是“直接做 10 分钟 Starter”；其他两个项目动作是“先看怎么开始”。不得把三个项目都写成“可立即开始”，因为只有一个经过内部起点设计。

### 6.5 最小作品与下一步

使用 Starter 真实产物结构展示：曲线截图、三行观察、限制说明。这里只解释“做完会留下什么”，不再重复项目背景、步骤和完整路径文案。

底部只保留三个轻链接：

- 做工程相关工作；
- 继续读研；
- 还没决定，去做双路径实验。

### 6.6 依据与最近核验

首页结尾使用一条轻量信任区，不再并排展开 3 条更新和 3 个 FAQ。

内容：

- 当前培养版本；
- 最近内容核验日期；
- 代表项目资源状态；
- “看来源与边界”“看学生常问”。

若内容已过 review due，不得继续写“已核验”，应显示“待复核”并链接到来源页。

### 6.7 首页内容预算

| 内容 | 上限 |
|---|---:|
| 一级主 CTA | 1 |
| 首屏动作 | 3 |
| 完整项目大卡 | 0 |
| 项目行 | 3 |
| 双专业案例 | 1 个紧凑摘要 |
| 完整 FAQ | 0 |
| 更新条目 | 0–1 条摘要 |
| 作品大图 | 1 |
| 首页完整表格 | 0 |
| 虚构人数/热度/社交指标 | 0 |

### 6.8 响应式验收

- 1440×900：首屏同时看见定位、三个动作、主 CTA 与 Starter 结果预览；
- 390×844：主 CTA 在第一屏，Starter 结果与第二个主模块在前两屏；
- 320×800：无横向滚动，关键触控区至少 44px；
- 移动全页高度 ≤ 4400px；桌面全页高度 ≤ 3000px；
- 200% zoom 不丢动作、不遮挡内容、不产生双向滚动；
- 页面无 JS 时仍可理解主线并进入项目详情；交互式保存提供清楚的 JS 依赖说明。

---

## 7. Starter 垂直切片

### 7.1 代表项目

Release C 只完成 `signal-feature-notebook`。选择它是因为：

- 已有固定合成信号和确定性预览；
- 不需要真实患者数据；
- 可以在浏览器内完成第一条观察；
- 已有三行 worksheet 和打印能力；
- 能覆盖数据观察、特征、解释和边界四个核心动作。

其他两个项目只有在代表项目完成第二轮真人验证后才允许复制 Starter 模式。

### 7.2 进入顺序

当内部 Starter 满足 owner、许可和人工走通条件时，代表项目详情 CTA 顺序改为：

1. 主 CTA：“先做 10 分钟 Starter”；
2. 次 CTA：“看完整步骤与资源”；
3. 外部参考：“打开 PhysioNet 说明”。

在批准前，主 CTA 显示“Starter 待人工复核”，不得用机器 `reachable` 伪装为正式可用。

### 7.3 Starter 步骤

```text
00–02 分钟：读一条固定合成曲线
02–05 分钟：指出一个位置或变化
05–08 分钟：写下一个特征判断
08–10 分钟：写下一项不能外推的结论
10–12 分钟：下载记录或打印保存
```

每一步只出现一个主动作。完成前三行后才强调保存，不用进度条制造“必须完成课程”的压力。

### 7.4 最小产物

P0 产物是本地生成的 Markdown 或纯文本文件，并保留打印/保存页面能力。文件包含：

```text
项目与 Starter 版本
生成日期
合成信号样例 ID
观察 1：形状或噪声
观察 2：一个特征变化
观察 3：一个不能外推的结论
安全边界
```

不上传服务器，不写 localStorage，不收集姓名、学号、邮箱或自由文本。下载前明确提示：刷新或离开页面会丢失未保存内容。

### 7.5 状态模型

Starter 公开状态必须由三个维度组成，而不是一个笼统的“可用”：

| 维度 | 状态 |
|---|---|
| 机器可达 | reachable / unreachable / unknown |
| 人工复核 | approved / pending / rejected |
| 新鲜度 | current / due-soon / overdue |

只有 `reachable + approved + current` 可以显示“可直接开始”。许可证为 `NOASSERTION`、owner pending 或人工走通未登记时，必须显示“待复核”。

### 7.6 完成态与下一步

保存后呈现三个动作：

- “回到项目，看 90 分钟完整版”；
- “看这次动作在练什么能力”；
- “先停在这里，去比较另一个任务”。

不显示积分、完成率、徽章或“你已经掌握”。

### 7.7 可访问性

- SVG 保留 `title`、`desc`，同时提供等价文字摘要；
- worksheet label、错误和保存状态可被读屏识别；
- 不用颜色单独表达曲线或状态；
- 键盘可完成填写和下载；
- 打印样式保留标题、三行观察和安全边界；
- `prefers-reduced-motion` 下无非必要动画；
- 输入字号移动端至少 16px。

---

## 8. 其他关键页面调整

### 8.1 `/projects`

- 保留四类学生意图排序，不增加筛选维度；
- 每个项目清楚区分“有内部 Starter”“只有开始说明”“外部资源待核验”；
- 代表项目排在 `quick-look` 首位并显示 10 分钟起点；
- 卡片主动作只保留一个；资源和来源下沉到详情；
- 旧查询兼容提示继续可见。

### 8.2 `/projects/[projectSlug]`

重排为：

1. 任务、成本、会留下什么；
2. 主动作与三维资源状态；
3. 最短路线和停止条件；
4. 作品模板；
5. 安全、数据与许可；
6. 完整资源和下一步。

代表项目优先内部 Starter，不能继续把外部来源当成首要开始动作。非代表项目不渲染 Starter CTA。

### 8.3 `/majors` 与 `/majors/compare`

- 保留培养事实、版本与 trust line；
- 首屏先展示“同一任务怎样分工”，再展示课程和完整事实；
- 所有 `#fragment` 目标继续由自动化校验；
- 不添加学生引语或“适合某类人”的未经验证判断。

### 8.4 `/capabilities`

当前 8 卡与关系图在 Release C 只做语义压缩：

- 把每张卡的首句改为一个可观察动作；
- 最多突出 3 个与代表 Starter 直接相关的能力；
- 其余保留为列表，不扩新关系图；
- 入口文案用“这次会练到什么”，不用“能力体系建设”。

### 8.5 `/pathways`

保持轻量比较页，不在 Release C 扩展资格、就业或升学解释。Starter 完成态只链接到路径，不能声称一次练习构成申请或岗位证据。

### 8.6 `/sources`

新增或明确展示：

- 内容 owner；
- review decision；
- reviewed at / review due；
- 机器可达与人工复核的差异；
- Starter 版本和许可证状态。

---

## 9. 内容、证据与资源治理

### 9.1 不新增内容事实域

Release C 继续使用：

- `content/site-data.json`：专业、能力、项目、场景、FAQ、来源；
- `content/pathways.json`：路径、产物和改写；
- `content/evidence.json`：字段 claim、evidence refs、endpoint 与 link availability；
- `content/claims.json`：高层事实 registry；
- `content/resources/*.json`：Starter 与参考资源 manifest；
- `content/resource-health.json`：机器健康快照。

不创建 `field-notes.json`、contributors、submissions 或 moderation schema。

### 9.2 统一证据语义

Release C 必须在代码和文档中固定以下定义：

- `verified`：指定内容 owner 已看过具体来源与 locator，并签署决定；
- `machine reachable`：自动请求成功，只说明网络/路由状态；
- `available`：满足当前页面动作所需的机器、人工、许可和新鲜度条件；
- `draft/pending`：可以在预览查看，不能以正式已核验语气对外发布；
- `overdue`：超过复核日期，必须降级提示。

构建通过不得自动把 owner 写成“已人工复核”。

### 9.3 P0 人工签核范围

至少完成：

1. 两个 2025 级专业学分与课程侧重；
2. 双专业共同底座与代表任务；
3. signal-feature 项目数据和安全边界；
4. Starter 的内容、许可证、版本和人工走通；
5. 首页会直接展示的所有状态与日期。

每条签核记录包含 owner、日期、决定、来源 locator、下一次复核日期。不得只填“编辑部”。

### 9.4 新鲜度处理

当前机器资源快照为 2026-08-13，部分 evidence review due 为 2026-09-13，5 条高层 claim review due 为 2026-09-01。Release C 发布时：

- 距 due ≤ 14 天显示“即将复核”；
- 已过 due 显示“待复核”，不显示绿色可用；
- 首页 baseline、footer、sitemap 和更新日期使用明确不同的字段，不能混成一个“更新时间”；
- 外部资源探针失败不得在无人工核对时自动写成 unavailable。

---

## 10. 视觉与文案语言

### 10.1 目标气质

```text
像学生打开的一张实验桌
不是学院门户
不是课程宣传页
也不是假装热闹的社区
```

### 10.2 版式原则

- 页面容器保持现有宽度体系，不重置整站；
- 首页模块间距通过节奏区分，不给每层都加边框；
- 外层模块可用轻卡，模块内项目改用分隔列表；
- 同一屏最多一个大标题和一个主 CTA；
- 大图只用于展示真实任务产物，不用装饰性 hero 插画；
- 桌面最多 `8/4` 两栏，移动端按任务优先级重排。

### 10.3 视觉 token

- 主背景继续使用纸白/浅灰；
- 主强调色沿用当前深蓝；
- teal/amber 只表达任务类型或状态，不做大面积渐变；
- 圆角以 10–14px 为主；
- 阴影只用于浮层或唯一主动作，普通列表用分隔线；
- hover 上浮不超过 2px，时长 150–220ms；
- forced-colors 与 reduced-motion 保持可用。

### 10.4 字级与触控

| 元素 | 下限/建议 |
|---|---|
| 正文 | 15–16px，line-height ≥ 1.55 |
| 元信息 | 12–13px |
| 移动输入 | 16px |
| 触控区 | 44×44px |
| 行宽 | 正文约 60–72 个中文字符以内 |

### 10.5 文案规则

推荐动词和现场状态：

- “今天先试一次”；
- “10 分钟看到第一条结果”；
- “做完会留下这三行”；
- “这个入口待人工复核”；
- “做到这里就可以停”。

避免：

- 致力于、赋能、打造、一站式、展现风采；
- 体系化培养、全方位提升、全面掌握；
- 最适合你、就业前景广阔、权威推荐；
- 大家都在做、热门、已有 N 人完成等无数据表达。

---

## 11. 工程实施约束

### 11.1 保持现有 seam

- 页面只消费 `lib/content` view model，不直接复制事实；
- Starter manifest 继续独立于项目营销文案；
- 资源状态聚合函数保持纯函数并有 fixture 覆盖；
- 不因一个 Starter 引入数据库、CMS、状态管理库或 UI 框架；
- 交互状态只留在 Starter 客户端组件，核心说明仍由服务端输出。

### 11.2 CSS 收口

当前 `app/globals.css` 1012 行。Release C 的要求：

1. 新首页、Starter、项目列表改动优先放入 route/component module；
2. 全局文件只保留 token、reset、壳层、通用排版和确有多路由消费者的原语；
3. 删除被新首页取代且无消费者的 Release B selector；
4. 禁止在文件末尾继续追加“Release C overrides”大段覆盖；
5. CSS 迁移分小提交，视觉快照在每一步保持可解释。

本阶段不把“globals.css 行数下降”作为唯一目标；目标是新视觉不再增加第四代覆盖。

### 11.3 事件与隐私

当前事件层只是一份隐私安全契约，不是线上采集。Release C P0：

- 可以在 preview 用现有事件帮助开发调试；
- production 继续 no-op，除非另有隐私评审、数据保留和分析 owner；
- 不把 worksheet 自由文本、URL、查询参数、IP、设备指纹或学生身份写入事件；
- 若未来接入分析，先定义删除、保留期和告知，再启用 `starter_begin` 等事件；
- 本阶段成效以主持测试记录为准。

### 11.4 性能预算

| 页面 | 预算 |
|---|---:|
| 首页 First Load JS | ≤ 100 kB |
| `/projects` First Load JS | ≤ 105 kB |
| Starter First Load JS | ≤ 100 kB |
| CLS | ≤ 0.1 |
| 代表性移动 LCP 中位数 | ≤ 2.5s |

现有构建 gzip 门禁继续保留；图片必须声明尺寸，Starter 不引入图表运行时依赖。

### 11.5 安全边界

- 只使用固定合成信号、公开授权数据或受控教学材料；
- 不上传或处理真实患者、病历、影像或可识别健康信息；
- 不执行用户代码，不连接校园/医院生产系统；
- 不将一次图形观察解释为医学结论；
- 下载文件不包含用户身份或页面外采集信息；
- 外部条款、版本和资格以原页面为准。

---

## 12. 质量门禁

### 12.1 Gate 0：先修复门禁自身

在视觉改造前必须完成：

1. sitemap E2E 按环境断言；
2. development/preview 空 sitemap 与 production 正式 sitemap 各有测试；
3. 浏览器聚合命令在 Windows 和 CI 都能自动结束；
4. 任一步失败时服务进程被清理；
5. `check:release-b` 连续两次完整运行，结果一致。

### 12.2 `check:release-c`

新增或重命名聚合门禁，至少包含：

```text
env:check
lint
content:check
links:check
evidence:check
resources:check
events:check
typecheck
vitest
production build
performance:check
E2E
axe
visual
metadata/runtime contract
```

正式发布环境另运行：

```text
release:check
rollback:check
production metadata check
production runtime check
smoke
```

### 12.3 P0 E2E

- 首页主 CTA → 代表项目 Starter；
- 项目详情内部 Starter 为主动作，外部来源为次动作；
- Starter 填写三行并下载本地文件；
- 下载内容含版本、三行观察和安全边界，不含身份；
- 刷新/离开前的数据丢失提示准确；
- 非代表项目不出现无效 Starter；
- 资源三维状态正确降级；
- FAQ、dual-lens、source 的 fragment 均存在；
- preview sitemap 为空，production sitemap 包含公开 Starter；
- 320px 无横向滚动；
- 移动菜单、Escape、焦点返回、skip link 正常；
- 无 JS 时核心页面和链接仍可阅读。

### 12.4 视觉矩阵

继续覆盖现有 7 个页面，新增 Starter：

| 页面/状态 | 390×844 | 768×1024 | 1440×900 |
|---|---:|---:|---:|
| 首页 light/dark | 是 | 是 | 是 |
| 专业 | 是 | 是 | 是 |
| 能力 | 是 | 是 | 是 |
| 项目列表 | 是 | 是 | 是 |
| 代表项目 | 是 | 是 | 是 |
| Starter | 是 | 是 | 是 |
| 专业对照 | 是 | 是 | 是 |
| 路径 | 是 | 是 | 是 |

另保留 320px reflow、移动菜单打开、旧查询合法/非法状态。更新 golden 必须附“层级为什么改变”的人工说明。

---

## 13. 真人与人工验收

### 13.1 两轮学生测试

每轮 5 名目标学生，至少 3 名主要使用手机，至少 3 名大一/大二。第一轮测试当前基线与 Starter，第二轮测试 Release Candidate。不得用开发者或项目成员替代目标学生通过率。

任务：

| ID | 任务 | 观察点 |
|---|---|---|
| T1 | 5 秒看首页后说网站能帮什么 | 是否先复述“试一次/看差异”，而非“学院介绍” |
| T2 | 找到两个专业在同一任务中的分工 | 是否能在 2 分钟内说出侧重 |
| T3 | 找到一个不安装环境的起点 | 是否进入正确 Starter，而非迷失在外部来源 |
| T4 | 完成三行观察并保存 | 时间、错误、犹豫、是否真的生成文件 |
| T5 | 找到不能外推的结论和来源状态 | 是否理解安全与“待复核/可达”的区别 |
| T6 | 选择下一步或决定停止 | 是否理解停止也是有效结果 |

P0 通过线：

- T1：至少 4/5 能复述“看差异、试项目、留记录”中的两项；
- T2：至少 4/5 在 2 分钟内找到并解释双专业侧重；
- T3：至少 4/5 在 2 分钟内进入 Starter；
- T4：至少 4/5 在 12 分钟内完成并保存，5/5 知道文件保存在哪里；
- T5：5/5 不把合成信号当真实患者数据或医学判断，至少 4/5 能解释资源状态；
- T6：至少 4/5 能找到继续或停止动作；
- 至少 4/5 主观判断页面更像学生工具而非官方宣传页。

一次失败必须记录在哪一步、说了什么、使用什么设备；不得只写成功率。

### 13.2 内容 owner 验收

内容 owner 必须逐项签署第 9.3 节范围，并确认：

- 页面用语没有把解释性转译冒充官方原文；
- 课程和学分对应 2025 级版本；
- Starter license 不再是 `NOASSERTION`，或明确阻断正式发布；
- 外部来源的 locator 可复查；
- review due 和降级文案正确。

### 13.3 无障碍人工验收

至少完成：

- Windows + NVDA 或 macOS/iOS + VoiceOver 一条完整 T3–T4；
- 浏览器真实 200% zoom；
- 键盘完成首页 → Starter → 下载；
- forced-colors 快速检查；
- 打印预览检查文字和边界未丢失。

axe 0 serious/critical 是前置条件，不替代上述走查。

### 13.4 发布验收

需要留下：

- 可分享 preview URL；
- 正式 HTTPS `NEXT_PUBLIC_SITE_URL`；
- 不可变 `HSEEHUB_RELEASE_ID` / `RELEASE_VERSION`；
- 与 release 不同的 `ROLLBACK_VERSION`；
- 发布 owner；
- 一次回滚演练记录；
- production canonical、robots、sitemap、runtime 和 smoke 结果。

---

## 14. 指标与完成定义

### 14.1 工程指标

| 指标 | Release C 线 |
|---|---:|
| `npm run check` | 通过 |
| `check:release-c` | 连续 2 次通过并正常退出 |
| Vitest | 0 fail |
| P0 E2E | 0 fail |
| axe serious/critical | 0 |
| 视觉未知 diff | 0 |
| 320px 横向溢出 | 0 |
| bundle 预算回归 | 0 |

### 14.2 产品指标

| 指标 | Release C 线 |
|---|---:|
| Starter 进入成功 | ≥ 4/5 |
| 12 分钟最小产出 | ≥ 4/5 |
| 保存文件定位成功 | 5/5 |
| 安全误解 | 0/5 |
| 首页移动高度 | ≤ 4400px |
| 主 CTA 所在位置 | 第一屏 |
| Starter 结果预览 | 前两屏 |

这些是主持测试与静态验收指标，不是线上 DAU、转化率或完成率。没有 production 数据管道前，不发布“提升 X%”。

### 14.3 Release C Done

以下全部满足才可由动态状态源标记为 `validated RC` 或 `production-ready`；静态 Spec 自身不得单独关闭任何项：

1. Gate 0 修复并稳定；
2. Starter 可下载最小记录；
3. 首页和代表项目完成动作重排；
4. 内容与许可 owner 签核；
5. 第二轮真人测试过线；
6. 无障碍人工验收完成；
7. preview、production config 和回滚证据完成；
8. README、About、文档和实际行为一致。

---

## 15. 实施路线

### Release C WP0：门禁与责任人（1–2 天）

- 修复 sitemap 环境契约；
- 修复 Playwright/Next 服务退出生命周期；
- 连续运行两次完整门禁；
- 指定产品、内容、无障碍和发布 owner；
- 建立当前首页与 Starter 真人测试基线。

**阻断条件：** 门禁仍不能稳定结束，或没有内容 owner，不进入视觉改造。

### Release C WP1：Starter 完成性（2–4 天）

- 明确 manifest 三维状态；
- 完成内容、许可与人工走通；
- 增加本地 Markdown/文本下载；
- 增加离开前保存提示和完成态；
- 补齐 E2E、axe、打印与 320px 测试；
- 第一轮 5 人测试。

**完成条件：** 至少 4/5 能在 12 分钟内保存最小记录，且没有安全误解。

### Release C WP2：首页与项目动作重排（4–6 天）

- 删除首屏重复 teaser；
- 首屏主 CTA 直达已批准 Starter；
- 双专业摘要压成一屏内比较；
- 三项目改为模块内列表；
- 作品段只保留最小产出与三条下一步；
- 更新/FAQ 下沉；
- 代表项目详情改为内部 Starter 优先。

**完成条件：** 移动首页 ≤ 4400px，Starter 在第一屏可进入，核心路径 E2E 通过。

### Release C WP3：信任与视觉收口（3–5 天）

- 内容 owner 签核写入事实层；
- 来源页展示机器/人工/新鲜度；
- 能力页首句动作化；
- 首页与 Starter 样式局部化；
- 删除无消费者旧样式；
- 更新并人工批准视觉 golden。

### Release C WP4：Release Candidate（3–5 天）

- 第二轮 5 人同题测试；
- NVDA/VoiceOver、200% zoom、键盘和打印验收；
- 完整 `check:release-c` 连续两次；
- preview 验收、production 配置检查、回滚演练；
- README、About、metadata、sitemap 与版本日期收口。

> 当前工程实现已经收口，不能因为本节仍保留 Release C WP0–WP4 标题就重新开启产品实施阶段。后续只按 [Release C 退出计划](release-c-validation/exit-plan.md) 推进真人、人工和发布证据。

### 最小可交付切线

若资源受限，Release C 最小版本仍必须包含：

1. Gate 0；
2. 一个经 owner 批准、可下载记录的 Starter；
3. 首页与代表项目详情的主动作重排；
4. 两轮真人测试；
5. 无障碍与发布闭环。

能力页视觉、CSS 深度清理和次级文案可以延后；社区功能不能拿来替换任何一项硬门槛。

---

## 16. 预计文件影响

| 文件/区域 | 预计变化 |
|---|---|
| `app/page.tsx` | 重组五段首页，不新增事实域 |
| `components/content/home-sections.tsx` | 删除重复 teaser，改专业摘要、项目列表和信任条 |
| 首页/Starter CSS module | 新视觉局部化 |
| `app/globals.css` | 只删除确认无消费者的旧规则，不追加大段覆盖 |
| `app/projects/[projectSlug]/page.tsx` | 内部 Starter 优先、资源状态三维化 |
| `app/projects/[projectSlug]/starter/page.tsx` | 分步、保存提示、完成态与下一步 |
| `components/starter-worksheet.tsx` | 校验、本地下载、可访问状态 |
| `content/resources/signal-feature-notebook.json` | license、owner、review decision、freshness |
| `content/claims.json` / `content/evidence.json` | 人工签核语义与状态对齐 |
| `lib/content/*` | 只扩展所需 view model 和状态聚合 |
| `app/sitemap.ts` | production 纳入已批准 Starter |
| `tests/e2e/release-a-baseline.spec.ts` | sitemap 按环境断言 |
| `tests/e2e/home.spec.ts` | 新首页和 Starter 主路径 |
| `tests/e2e/visual.spec.ts` | 新增 Starter，保留现有矩阵 |
| `scripts/run-release-b-browser-checks.mjs` | 统一命名、稳定退出与清理 |
| `package.json` | 增加 `check:release-c` |
| `.github/workflows/quality.yml` | preview/production 契约与 Release C 聚合 |
| `docs/phase-1.6-validation/*` | 补真人、owner、读屏、preview 和回滚证据 |
| `README.md`、About | 当前阶段、门禁、边界和 Starter 说明 |

---

## 17. 验收矩阵

| ID | 条件 | 证据 | 阻断发布 |
|---|---|---|---:|
| RC-01 | sitemap 契约按环境一致 | 单测 + preview/prod metadata | 是 |
| RC-02 | 浏览器门禁连续两次全绿并退出 | 两次日志 | 是 |
| RC-03 | 代表 Starter 人工批准且 license 明确 | manifest + owner 签核 | 是 |
| RC-04 | Starter 可下载最小记录 | E2E + 样例文件 | 是 |
| RC-05 | 项目详情内部 Starter 为主动作 | E2E + 视觉证据 | 是 |
| RC-06 | 首页无重点项目语义重复 | 内容预算审阅 | 是 |
| RC-07 | 移动首页 ≤ 4400px | 390px golden 尺寸 | 是 |
| RC-08 | 320px/200% zoom 无溢出 | 自动化 + 人工记录 | 是 |
| RC-09 | 两个专业 P0 事实 owner 签核 | evidence registry | 是 |
| RC-10 | 第一轮 5 人测试过线 | 匿名记录与汇总 | 是 |
| RC-11 | 第二轮 5 人测试过线 | 匿名记录与汇总 | 是 |
| RC-12 | 读屏与键盘完成 T3–T4 | 走查记录 | 是 |
| RC-13 | 性能与视觉回归通过 | 构建、Lighthouse、golden | 是 |
| RC-14 | preview 可分享且无索引 | URL + metadata/runtime | 是 |
| RC-15 | production config 和回滚演练完成 | release/rollback 日志 | 是 |
| RC-16 | 无社区、投稿或虚构社交指标 | 内容与路由审计 | 是 |

---

## 18. 风险与控制

| 风险 | 表现 | 控制 |
|---|---|---|
| Starter 只像表单 | 用户填三行但没有理解 | 固定观察任务、位置提示、限制说明、真人复述 |
| 外部来源抢走主线 | 用户打开 PhysioNet 后离站 | 内部 Starter 主 CTA，外部来源降为继续/核对 |
| 自动通过冒充人工批准 | 可达就显示绿色 | 机器、人工、新鲜度三维状态 |
| 首页减法损失信任 | 删除内容后显得空 | 保留版本、owner、核验时间和来源入口 |
| 新视觉继续堆 CSS | 文件末尾新增覆盖 | module 优先、删除旧消费者、分阶段 golden |
| 测试绿但用户失败 | 自动化覆盖结构不覆盖理解 | 两轮 5 人任务测试为硬门槛 |
| 记录泄露自由文本 | 事件或上传包含学生内容 | 全程本地、production no-op、不收自由文本 |
| Starter 被误当医学工具 | 图形被解释为患者信号 | 固定合成标识、每步边界、5/5 安全理解线 |
| 发布环境永远待定 | 本地完成却不能上线 | Phase 0 指定发布 owner，RC 必须完成 preview/rollback |
| 参考站模仿成换皮 | 只换配色和卡片 | 迁移动作与状态原则，不复制品牌和社区功能 |

---

## 19. 需要尽早确认的外部决策

1. 谁对两个专业的 2025 级事实签字？
2. 谁批准 Starter 内容、license 与安全边界？
3. 正式域名、preview 地址和发布 owner 是什么？
4. 选择 NVDA 还是 VoiceOver 作为第一条真实读屏路径？
5. 两轮各 5 名目标学生从哪里招募，测试日期是什么？
6. Starter 下载格式默认 Markdown 还是纯文本？建议 Markdown，同时提供打印。
7. 旧项目查询参数在 2026-10-01 后是否仍有外部消费者？

第 1–5 项未确认时，可以修 Gate 0 和制作预览，但不得宣称 Release C 可生产发布。

---

## 20. 最终判断

HseeHub 当前已经会“解释”，也已经出现了第一个能动手的起点。当前不是进入 Release D、Phase 2 或恢复 Phase 1.7，而是把现有工程实现推进到真人与发布证据闭环。唯一下一状态路径是 `validation candidate → validated RC → production-ready`。

Release C 的成功体验应当是：

```text
我没有被要求先做一个大选择
→ 我很快找到一个现在能做的小动作
→ 我知道数据是合成的，也知道不能得出什么
→ 我保存了自己的三行观察
→ 我愿意继续，或者我决定先换一条路
→ 两种结果都算一次有效探索
```

这比增加动态流、投稿入口或更多卡片更接近 HseeHub 的第一性价值，也更符合项目现在真正具备的能力。

---

## 附录 A：现状证据索引

- 当前产品与运行说明：`README.md`
- 动态验收状态：[`docs/release-c-validation/acceptance-status.md`](release-c-validation/acceptance-status.md)
- 顺序与退出条件：[`docs/release-c-validation/exit-plan.md`](release-c-validation/exit-plan.md)
- 当前首页组合：`app/page.tsx`
- 当前首页区块：`components/content/home-sections.tsx`
- 代表项目详情：`app/projects/[projectSlug]/page.tsx`
- 代表 Starter：`app/projects/[projectSlug]/starter/page.tsx`
- Starter manifest：`content/resources/signal-feature-notebook.json`
- 事实证据与 endpoint：`content/evidence.json`
- 高层 claim registry：`content/claims.json`
- 机器资源快照：`content/resource-health.json`
- 事件契约：`lib/analytics.ts`
- 发布环境约束：`lib/site-config.ts`、`.env.example`
- sitemap 环境行为：`app/sitemap.ts`
- 当前浏览器聚合：`scripts/run-release-b-browser-checks.mjs`
- 视觉矩阵：`tests/e2e/visual.spec.ts`
- Phase 1.6 人工阻塞：`docs/phase-1.6-validation/wp0-status.md`
- Phase 1.6 验收矩阵：`docs/phase-1.6-validation/acceptance-matrix.md`
- 未合并的 Phase 1.7 历史关系：`codex/phase-1.6@57b997e`（仅历史输入，不恢复文件）
- 参考站：[https://sztubitbyte.com/](https://sztubitbyte.com/)

## 附录 B：参考站证据边界

- 参考分析基于 2026-08-19 可获取的公开页面结构、HTML/CSS/JS 与响应式规则；
- 宿主浏览器插件的可信路径校验阻止了本轮新的像素级交互审阅，因此本文不声称复刻或逐像素验收；
- 本 Spec 只采用任务优先、真实状态、轻层级、移动重排和克制动效，不复制品牌资产或社区机制。
