# HseeHub 代码健康、安全依赖与仓库治理修复 Spec

> - 状态：拟实施、并行工程治理流；不能替代或关闭 Release C 验收
> - 修订日期：2026-08-20
> - 本地代码基线：`HEAD=478cf570a4f415a6913495f82aa9804942eb235f`（`codex/release-c`）
> - 远端比较基线：`origin/main=f740e57c4a096f60453ba8dfd7596e2ca526a988`；当前 `HEAD` 相对其领先 8 个提交
> - 当前工作区事实：18 个路径（11 modified、1 deleted、6 untracked），含用户未提交 Lighthouse/CI 改动；任务开始时已有 13 个路径，WP0 必须先隔离，不得覆盖或吸收
> - 触发依据：2026-08-19 本地与远端代码健康巡检；本次只刷新 Git 事实和治理边界，不升级依赖
> - 适用范围：Node/Next/React/Playwright 依赖族、静态分析、CI、供应链和 `main` 治理
> - 不改变范围：产品定位、页面内容、路由 URL、视觉基线意图、证据模型和隐私边界

---

## 0. 一页结论

HseeHub 当前不是“代码不能运行”，而是“功能门禁为绿、安全与治理门禁未闭合”。本地已经证明：

> 下列绿色结果来自前一轮巡检记录，不是本次文档收口新生成的依赖或 audit 结果。Release C 动态状态以 [`acceptance-status.md`](release-c-validation/acceptance-status.md) 为准；本次不执行依赖升级，也不运行 `npm audit`。

- `npm run check` 通过，24/24 个 Vitest 用例通过，Next production build 生成 46 个页面单元；
- Release C 浏览器链路共 102 passed / 6 skipped；
- 三个核心路由的移动 Lighthouse 中位数均为 Performance 100、Accessibility 100，LCP 约 1.86–1.89 秒，CLS 为 0；
- 前一轮记录的远端 `main@2ffbc25` 合并后 CI 全绿；当前 Git 比较基线已刷新为 `origin/main=f740e57c4a096f60453ba8dfd7596e2ca526a988`，CI 本次未重新核验。

但发布基线仍存在四个不可被上述绿色结果抵消的问题：

1. `npm audit` 报告 4 个 high 级依赖节点；生产链包含 `next@14.2.35` 与 `postcss@8.4.31`，开发链包含 `@playwright/test@1.51.1` 与 `playwright@1.51.1`。
2. CI 使用已经 EOL 的 Node 20，本地使用 Node 24.18.0，仓库没有运行时版本契约。
3. `main` 未启用分支保护或 required status check，绿色 CI 不是合并的强制条件。
4. 当前 `lint` 只执行领域正则扫描，没有通用 TypeScript/React/Next 语义 lint，也没有持续依赖更新或 CodeQL。

本修复的固定顺序是：

```text
冻结并隔离当前工作树
→ 先修 Playwright 开发依赖
→ 再迁移 Node + Next/React 运行时族
→ 补通用静态分析
→ 加固 CI 与供应链自动化
→ 最后启用 main 强制治理
```

任何阶段失败都回到上一个已验证提交；不得用 `--force`、`--legacy-peer-deps`、长期 `overrides`、删除测试或降低预算来制造绿色。

---

## 1. 当前事实与问题分级

### 1.1 当前解析版本

表中的“当前解析值”来自当前 manifest/lockfile；所有精确目标版本都只是候选值。WP0 必须在官方 npm registry 重新确认版本、兼容性、registry 和 integrity，并把查询时间与输出写入审批记录；在确认前不得据此写入 manifest/lockfile。

| 依赖/环境 | 当前解析值 | 类型 | 当前判断 |
| --- | --- | --- | --- |
| Node 本地 | `24.18.0` | 运行时 | 受支持，但未在仓库固定 |
| Node CI | `20.x` | 运行时 | 2026-03-24 已 EOL，必须退出 |
| Next | `14.2.35` | 直接 production | high；跨主版本升级 |
| React / React DOM | `18.3.1` | 直接 production | React 19 迁移前的预警版本 |
| PostCSS | `8.4.31` | Next 的 production 传递依赖 | high；应由 Next 升级消除 |
| Playwright Test | `1.51.1` | 直接 development | high；最小安全目标 `1.55.1` |
| TypeScript | `5.7.3` | development | 满足 Next 16 的 TypeScript 5.1+ 下限，首轮保持 |
| `@types/node` | `22.13.4` | development | 与目标 Node 24 不一致 |

### 1.2 仓库与自动化事实

| 维度 | 当前事实 | 分级 |
| --- | --- | --- |
| 本地与远端基线 | `HEAD=478cf570a4f415a6913495f82aa9804942eb235f`；`origin/main=f740e57c4a096f60453ba8dfd7596e2ca526a988`；HEAD ahead 8 | 需 WP0 固定 |
| 工作区路径 | 18 个：11 modified、1 deleted、6 untracked；任务开始时已有 13 个路径 | P0 隔离 |
| 最新 CI | 此前记录的 Actions #17 `quality` job 全绿；本次未重新核验 | 历史证据，不作当前门禁 |
| 旧 CI | Actions #13 卡在 `playwright install --with-deps chromium`；新版流程已增加边界 | P2 清理 |
| 开放工作 | 无开放 PR、无开放 Issue | 中性；不等同无风险 |
| 分支保护 | `main protected=false`，required checks 为空 | P0 |
| 供应链自动化 | 无 `.github/dependabot.yml` | P1 |
| 代码扫描 | 未发现 CodeQL 配置或已记录的默认设置证据 | P1 |
| 通用 lint | 无 ESLint/Biome；`lint-source.mjs` 只检查 inline style、危险协议和硬编码颜色 | P1 |
| 覆盖率 | 无覆盖率报告和阈值 | P2 |
| 本地 GitHub CLI | `gh auth status` 显示 token 失效 | P2 运维 |

### 1.3 风险优先级

| ID | 风险 | 级别 | 影响 |
| --- | --- | --- | --- |
| R01 | Next/PostCSS production 高危公告 | P0 | 公开部署可能暴露 DoS、SSRF、缓存或文件读取风险 |
| R02 | `main` 无强制保护 | P0 | 可以绕过 PR 与 CI 直接写入默认分支 |
| R03 | Node 20 EOL 且环境漂移 | P0 | 运行时漏洞不再修复，复现结果不稳定 |
| R04 | Playwright 下载链高危公告 | P1 | CI 安装浏览器时的供应链真实性风险 |
| R05 | 通用 lint/CodeQL/Dependabot 缺失 | P1 | 代码与依赖缺陷只能靠人工或偶发巡检发现 |
| R06 | 当前工作区存在 18 个路径级未提交/未跟踪路径（任务开始时已有 13 个） | P1 | 后续 PR 基线和作者意图容易混淆 |
| R07 | 构建预算读取 Next 内部 manifest | P1 | Next 16 升级可能让预算脚本静默失真或失效 |
| R08 | 无覆盖率下限 | P2 | 单元测试数量增加不代表关键分支被保护 |

---

## 2. 目标、非目标与不变量

### 2.1 P0 目标

1. 完整 `npm audit --audit-level=high` 的 high/critical 均为 0；不得只看 production omit 结果。
2. Node 运行时统一为 `24.18.0`，本地、CI、`engines` 和版本文件一致。
3. Next/React 运行时族的下列版本是待 WP0 官方 registry 复核的候选目标，不是本任务批准的安装清单：
   - `next@16.3.1`
   - `react@19.2.8`
   - `react-dom@19.2.8`
   - `@types/react@19.2.18`
   - `@types/react-dom@19.2.4`
   - `@types/node@24.13.3`
4. Playwright 的候选目标为 `@playwright/test@1.55.1`，解析出的 `playwright` 不低于经 WP0 复核的目标版本。
5. `main` 必须通过 PR 与唯一、稳定命名的 `quality` required check 才能合并；禁止 force push 和删除。
6. 当前全部产品、内容、可访问性、视觉和发布契约保持不变。

### 2.2 P1 目标

1. 保留领域 lint，并增加 ESLint Flat Config：`eslint@10.8.1`、`eslint-config-next@16.3.1`。
2. 增加 npm 与 GitHub Actions 的 Dependabot 周更配置，安全更新保持开启。
3. 为公开 JavaScript/TypeScript 仓库启用 CodeQL default setup，并保存首次绿色运行链接。
4. 所有 GitHub Actions job 有总超时；下载、浏览器安装和 Lighthouse 等外部边界有步骤超时。
5. 建立覆盖率基线；关键纯逻辑模块在后续门禁中有明确阈值。

### 2.3 非目标

本修复不做：

- 页面重设计、内容扩充、路由改名或 taxonomy 调整；
- 引入 CMS、数据库、账号、分析 SDK 或新的外部服务；
- 启用 React Compiler、Cache Components、PPR 或新的 Next 16 产品能力；
- 借框架升级重写组件、CSS 或内容层；
- 更新视觉 golden 来掩盖未知差异；
- 把所有依赖升级到“最新”作为完成标准；
- 处理真人测试、内容 owner 签核、正式域名等 Release C 外部证据缺口。

本 Spec 是并行工程治理流，不能关闭 Release C 的真人测试、owner 签核、preview、production、人工无障碍或真实回滚阻塞；Release C 的唯一动态状态源仍是 [`docs/release-c-validation/acceptance-status.md`](release-c-validation/acceptance-status.md)。

### 2.4 必须保持的不变量

1. 所有现有公开 URL、query、fragment 和 sitemap 环境契约保持兼容。
2. development/preview 继续 noindex 且 sitemap 为空；production 才发布 canonical 和公开 sitemap。
3. 46 个当前页面单元和所有静态参数集合不得减少。
4. 24 个现有 Vitest 断言、102 个当前通过的浏览器用例和既有 axe/视觉基线不得通过删除或 skip 来收口。
5. 首页与 `/projects` 构建预算不得被静默删除；若 Next 16 manifest 改变，必须先替换测量 seam 再移除旧读取方式。
6. Lighthouse 阈值保持 Performance ≥90、Accessibility ≥95、production SEO ≥95、LCP ≤2500ms、CLS ≤0.1。
7. 不新增真实患者数据、不可信代码执行或生产系统连接。

---

## 3. 目标兼容矩阵

### 3.1 版本矩阵

| 合同 | 当前 | 过渡态 | 最终态 | 证据 |
| --- | --- | --- | --- | --- |
| Node | 本地 24.18 / CI 20 | Next 14 基线先在 Node 24.18 重跑 | 全环境 `24.18.0` | `node --version`、CI log |
| Next | 14.2.35 | 单独升级分支，不与产品变更混合 | 16.3.1 | `npm ls next`、build、route smoke |
| React | 18.3.1 | 与 Next 同一依赖族升级 | 19.2.8 | `npm ls react react-dom`、浏览器回归 |
| Route props | 同步 `params/searchParams` | 读者先改为 async 并等待 Promise | Next 16 async contract | typecheck、动态路由 E2E |
| Playwright | 1.51.1 | 先独立升级并重装 Chromium | 1.55.1 | `npm ls`、完整浏览器链 |
| Lint | 领域正则 | 保留为 `lint:domain`，新增 `lint:code` | 聚合 `lint` | ESLint 0 error、领域 lint 0 error |
| CI check | 自愿运行 | PR 与 push 都产生同名 `quality` | required `quality` | PR 合并保护实测 |
| 依赖监测 | 人工 audit | Dependabot PR 只通过正常门禁 | npm/Actions 周更 | 首次 Dependabot 检查证据 |

### 3.2 允许的恢复运行时

如果 Node 24 在 GitHub runner 或某个直接依赖上出现已证实阻断，唯一允许的临时恢复线是仍受支持且满足依赖引擎要求的 Node 22 LTS；不得回退到已经 EOL 的 Node 20。临时恢复必须记录：

- 阻断日志；
- Node 22 的精确 patch；
- 负责人和到期日；
- 回到 Node 24 的 Issue/PR；
- 完整门禁结果。

---

## 4. 已识别的迁移面

### 4.1 Next 16 async Request APIs

仓库没有使用 `cookies()`、`headers()` 或 `draftMode()`，但以下 8 个动态路由文件同步读取 `params`，其页面函数和 `generateMetadata` 都必须改为 Promise + `await`：

1. `app/capabilities/[capabilitySlug]/page.tsx`
2. `app/majors/[majorSlug]/page.tsx`
3. `app/majors/[majorSlug]/curriculum/[cohort]/page.tsx`
4. `app/pathways/[pathwaySlug]/page.tsx`
5. `app/projects/[projectSlug]/page.tsx`
6. `app/projects/[projectSlug]/resources/page.tsx`
7. `app/projects/[projectSlug]/starter/page.tsx`
8. `app/scenarios/[scenarioSlug]/page.tsx`

`app/projects/page.tsx` 还同步读取页面 `searchParams`，必须改为异步读取，同时保持旧五维筛选和 `intent` 的现有兼容语义。

建议目标形态：

```ts
type Props = { params: Promise<{ projectSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { projectSlug } = await params;
  // 保留现有 metadata 语义
}

export default async function Page({ params }: Props) {
  const { projectSlug } = await params;
  // 保留现有读取 seam
}
```

不得在多个函数里重复 `await params` 后又重复查询内容；迁移只改变读取时序，不改变内容模型。

### 4.2 React 19

仓库扫描未发现 `ReactDOM.render`、字符串 ref、`useFormState`、函数组件 `propTypes/defaultProps` 或 React internals。当前 React 18.3.1 正是 React 官方建议用于暴露 React 19 弃用警告的过渡版本。

仍需验证：

- 5 个 Client Component 的 hydration 与事件行为；
- Starter 输入、下载和刷新后不持久化自由文本的契约；
- 移动菜单 Escape/焦点返回；
- React 19 类型变化对 `children`、ref、JSX namespace 和事件类型的影响。

### 4.3 Turbopack 与构建产物

Next 16 默认使用 Turbopack 执行 `next dev` 和 `next build`。项目没有自定义 webpack 配置，因此不预期配置冲突，但以下内容不能凭假设通过：

- `scripts/check-performance.mjs` 读取 `.next/app-build-manifest.json`；
- `docs/phase-1.6-validation/build-metrics.md` 记录 Next 14 的构建输出形态；
- Next 16 不再在 `next build` 输出 First Load JS 指标。

迁移必须先验证 `app-build-manifest.json` 是否仍是稳定且正确的测量源。如果不再稳定，应新增仓库自有的构建指标 artifact，并让 `performance:check` 同时验证新旧 seam 一个过渡周期。Lighthouse 是用户侧性能发布门禁，但不能自动替代 bundle 回归定位能力。

### 4.4 Playwright 与视觉快照

Playwright 1.55.1 带来新的 Chromium/WebKit/Firefox 版本。浏览器升级造成像素差异时：

1. 先保存 diff artifact；
2. 区分字体/抗锯齿差异、浏览器布局变化与真实产品回归；
3. 由视觉基线负责人逐页批准；
4. 禁止直接 `--update-snapshots` 后把全部变化视为正确。

### 4.5 ESLint

现有 `scripts/lint-source.mjs` 是 HseeHub 自有领域规则，必须保留。目标脚本合同：

```json
{
  "lint:domain": "node scripts/lint-source.mjs",
  "lint:code": "eslint . --max-warnings=0",
  "lint": "npm run lint:domain && npm run lint:code"
}
```

Flat Config 应覆盖 `app/`、`components/`、`lib/`、`scripts/`、`tests/` 和根级 TypeScript/MJS 配置；只忽略生成目录、依赖目录和测试产物。不得使用全局 disable 或把 error 批量降为 warning。

---

## 5. 实施路线与工作包

### WP0：工作树隔离与冻结基线（0.5 天）

负责人：实施者。

截至 2026-08-20，当前 `HEAD=478cf570a4f415a6913495f82aa9804942eb235f` 位于 `codex/release-c`，相对 `origin/main=f740e57c4a096f60453ba8dfd7596e2ca526a988` ahead 8；工作区共有 18 个路径（11 modified、1 deleted、6 untracked），任务开始时已有 13 个路径。开始修复前必须：

1. 先决定并记录当前 Lighthouse/CI 改动是提交、拆分还是放弃；不得由依赖升级顺手吸收。
2. `git fetch` 后从最新 `origin/main` 建立 `codex/code-health-remediation` 或等价修复分支。
3. 在任何 manifest/lockfile 写入前，从官方 npm registry 重新确认每个精确目标版本、peer/engine 兼容性、registry、integrity 和发布状态；记录查询日期、命令输出与批准矩阵。Spec 里的精确版本只作候选，不能直接安装。
4. 只有在工作树处理方式与版本矩阵获批后，才用 `npm ci` 冻结解析结果；确认 `package.json` 与 `package-lock.json` 不发生意外变化。
5. 记录基线 SHA、Node/npm 版本、`npm ls --depth=0`、依赖图和全部门禁输出；完整 audit 属于获批的 WP0/WP4 动作，本次文档收口不执行。

Gate WP0：工作树意图清楚；基线可重放；没有用户改动被覆盖或丢失。

### WP1：Playwright 安全升级（0.5–1 天）

只处理浏览器测试依赖族：

1. 使用 WP0 已从官方 registry 复核的精确版本运行 canonical npm 命令更新 lockfile；不得直接采用本 Spec 的候选值。
2. 重新安装与该版本匹配的 Chromium；CI 继续使用有 5 分钟超时的安装步骤。
3. 检查 lockfile 中 `@playwright/test`、`playwright`、`playwright-core` 的版本、registry、integrity 和平台包变化。
4. 运行 lifecycle 单测、关键 E2E、axe 和完整视觉矩阵。
5. 证明 `<1.55.1` 的 Playwright 已不在最终解析图中。

Gate WP1：浏览器链路全绿；未知视觉 diff 为 0；Playwright high 告警消失。

### WP2：Node 24 + Next/React 运行时族迁移（2–4 天）

WP2 只能在 WP1 已合并、authoritative lockfile 已更新并可重放后开始。WP2 必须基于 WP1 合并后的最新 authoritative lockfile 重新 `npm ci` 和 `npm ls`，不得基于旧 lockfile 并行推进。工作包内部再按以下顺序串行执行：

1. 增加 Node 版本合同：`.nvmrc` 或 `.node-version`、`package.json#engines`、CI `actions/setup-node` 同时固定 `24.18.0`。
2. 先在未升级 Next 的状态用 Node 24.18.0 重跑冻结基线，证明运行时切换本身没有新增失败。
3. 使用官方 codemod 的 dry-run/print 模式生成迁移清单；只应用本仓库需要的迁移。
4. 同一提交族更新 Next、React、React DOM 和对应类型包到 WP0 批准的精确版本。
5. 将第 4.1 节的 `params/searchParams` 全部迁移为 async contract。
6. 修复 React 19 类型错误，不做无关组件重写。
7. 检查最终 lockfile 和解析图；不得留下 Next 14、React 18 或 vulnerable PostCSS。
8. 验证 Turbopack build、production start、metadata、runtime、sitemap、bundle seam 和 Lighthouse。

Gate WP2：

- `npm audit --audit-level=high` 返回 0；
- `npm ls next react react-dom postcss` 只有批准版本线且无 invalid/extraneous；
- 46 个页面单元与静态路径集合不减少；
- 路由、metadata、sitemap、Starter 和旧筛选链接契约全部通过；
- `npm run check:release-c` 连续两次正常退出且全绿。

### WP3：通用静态分析与覆盖率基线（1–2 天）

1. 增加 WP0/WP2 版本矩阵批准的 ESLint 与 eslint-config-next Flat Config；`10.8.1`/`16.3.1` 只作为候选示例，不能绕过 WP0 registry 复核。
2. 保留并重命名领域 lint，聚合为第 4.5 节脚本合同。
3. 首次 lint 修复只处理真实规则违规；格式化或大规模重排另开提交。
4. 使用与 Vitest 3.2.7 同版本线的 V8 coverage provider 生成基线报告。
5. 第一阶段全仓默认阈值建议为 lines/statements/functions ≥80%、branches ≥75%；若现状低于阈值，先记录实际基线并为关键纯逻辑模块设置不低于 90% 的局部目标，补测后再启用全仓阻断。

关键纯逻辑范围至少包括：

- `lib/content/filters.ts`
- `lib/content/evidence.ts`
- `lib/content/project-resource-state.ts`
- `lib/site-config.ts`
- `lib/starter-record.ts`
- Lighthouse/browser lifecycle helpers

#### 覆盖率验收合同

覆盖率不能只记录一个百分比，必须同时固定以下四项：

1. **artifact**：CI 每次上传 `coverage/coverage-final.json`、`coverage/lcov.info` 和机器可读 summary（路径可在 WP3 统一，但不得只留终端摘要），并记录 commit、Node/npm、Vitest/provider 版本和 CI run。
2. **scope**：范围为受测的 `lib/` 纯逻辑、Lighthouse/browser lifecycle helpers 及其直接测试 seam；排除 `.next/`、`node_modules/`、生成产物、fixtures 和测试文件本身。scope 清单随配置提交，变更必须说明。
3. **threshold**：全 scope 初始阻断线为 lines/statements/functions ≥80%、branches ≥75%；关键纯逻辑模块初始局部线为 lines/statements/functions ≥90%、branches ≥85%。低于线时补测或记录明确的临时例外，不得静默降低阈值。
4. **CI enforcement**：`quality` 在 PR 与 `main` push 都运行 coverage 命令，阈值不满足即非零退出；artifact 即使失败也上传，禁止 `continue-on-error`、跳过或只在本地执行。验收必须有一条失败阈值的验证记录和一条通过记录。

Gate WP3：lint 0 error/0 warning；artifact、scope、阈值和 CI enforcement 均有配置与验收记录；门禁阈值不低于记录基线。

### WP4：CI 与供应链加固（1–2 天）

1. `quality` job 增加 `timeout-minutes`，所有外部下载/浏览器/性能步骤保留更小超时。
2. 增加 workflow concurrency；同一 PR 新提交取消旧运行，`main` push 不被 PR 运行互相取消。
3. 在依赖安装后运行 full audit high gate；如 npm audit 服务不可用，应明确失败为“blocked”，不得伪装成功。
4. Actions 引用固定到审核过的 commit SHA，并由 Dependabot 维护；注释保留可读的 action 版本。
5. 新增 `.github/dependabot.yml`：
   - npm：每周一次；
   - GitHub Actions：每周一次；
   - 框架 major 不与普通 minor/patch 分组；
   - 限制并发 PR 数，避免自动更新淹没主线。
6. 在仓库设置中启用 Dependabot alerts/security updates。
7. 为 JavaScript/TypeScript 启用 CodeQL default setup，保存首次扫描链接和结果。
8. 取消已被 #17 取代、仍卡住的 Actions #13。

Gate WP4：PR 和 `main` push 都有完整绿色 `quality`；Dependabot 配置被 GitHub 接受；CodeQL 首次运行完成。

### WP5：默认分支治理（0.5 天）

在 WP4 产生稳定且唯一的 `quality` check 名称后，启用 `main` 规则：

- require a pull request before merging；
- require status check：`quality`，来源限定 GitHub Actions；
- require branches to be up to date before merging；
- require conversation resolution；
- block force pushes；
- block branch deletion；
- 不允许绕过规则；
- 有第二位维护者时再启用 1 个 approving review，避免单人仓库被永久锁死。

同时重新认证本地 `gh`，只恢复 CLI 操作能力，不把 token 写入仓库、日志或环境示例。

Gate WP5：创建一个只改文档的验证 PR，证明未通过 `quality` 时不可合并，通过后可按规则合并；不得用管理员绕过完成演练。

### 5.1 依赖图

```text
WP0 基线隔离
 ├─ WP1 Playwright ─────────────┐
 └─ WP2 Node + Next/React ──────┼─ WP3 lint/coverage ─ WP4 CI/供应链 ─ WP5 main 治理
                               └─ 两条依赖安全证据汇合
```

WP1 与 WP2 可以分 PR，但 WP1 必须先合并；WP2 只能基于合并后的最新 authoritative lockfile 继续。所有 lockfile 变更必须串行合并。WP4 不能在 check 名称仍变化时提前配置 WP5。

---

## 6. 质量门禁合同

### 6.1 每个依赖 PR 的最小命令

```bash
npm ci
npm ls next react react-dom postcss @playwright/test playwright
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run performance:check
```

### 6.2 Release Candidate 完整门禁

```bash
npm run env:check
npm run rollback:check
npm run check
npm run release-c:check
npm run perf:ci
npm run test:release-c-browser
```

完整门禁必须在清洁 checkout 上使用 `npm ci` 运行两次。第二次运行不得依赖第一次残留 server、port、profile、`.next` 或 test artifact 才能通过。

### 6.3 CI job 命名

required check 绑定 job 名 `quality`，workflow 显示名可以继续是 `HseeHub quality gates`。仓库不得出现第二个同名 `quality` job，以免 GitHub required status check 来源歧义。

### 6.4 安全门禁

发布阻断条件：

- audit high 或 critical > 0；
- lockfile 包来源不是批准 registry；
- integrity 缺失或异常变化未解释；
- `npm ls` 出现 invalid/extraneous；
- Node/npm/浏览器版本未在 artifact 中记录；
- CodeQL 新增 high/critical alert；
- required check 被绕过。

---

## 7. 验收矩阵

| ID | 验收标准 | 证据 |
| --- | --- | --- |
| A01 | 当前未提交 Lighthouse/CI 工作已独立保存、提交或明确放弃 | WP0 记录 + Git 状态 |
| A02 | 清洁 checkout 的 `npm ci` 不改 manifest/lockfile | Git diff 为空 |
| A03 | Node 本地、CI、engines 和版本文件均为 24.18.0 | 版本输出 + workflow |
| A04 | Next/React/DOM/类型包解析为第 2.1 节批准版本 | `npm ls` + lock diff |
| A05 | Playwright 解析版本不低于 1.55.1，旧版本不存在 | `npm ls` / `npm explain` |
| A06 | full npm audit high/critical = 0 | audit JSON artifact |
| A07 | 8 个动态路由和 `/projects` query 使用 async contract | typecheck + 路由 E2E |
| A08 | 现有 URL、query、fragment、metadata、robots、sitemap 契约不变 | 单元/E2E/runtime checks |
| A09 | 46 个页面单元和静态路径集合不减少 | build artifact 对比 |
| A10 | 24 个现有 Vitest 断言全部保留并通过 | Vitest report |
| A11 | 当前 102 个浏览器通过项继续通过；既有 6 skip 原因不扩张 | Playwright report |
| A12 | axe critical/serious = 0，未知视觉 diff = 0 | axe + screenshot artifact |
| A13 | Lighthouse 各项满足既有预算 | `artifacts/perf-ci.json` |
| A14 | bundle 测量 seam 在 Next 16 下有正确性证据 | manifest/替代 artifact 测试 |
| A15 | ESLint 和领域 lint 均 0 error/0 warning | CI log |
| A16 | Dependabot npm/Actions 配置被接受并完成首次检查 | GitHub Security/Insights 证据 |
| A17 | CodeQL default setup 首次扫描完成，无未处置 high/critical | Code scanning 链接 |
| A18 | `main` 强制 PR、最新 `quality`、对话解决、禁止 force/delete | branch rule 截图/API |
| A19 | 失败 check 的验证 PR 无法合并，绿色后不靠绕过可合并 | 演练 PR |
| A20 | `check:release-c` 在清洁环境连续两次全绿且正常退出 | 两次独立 log |
| A21 | 覆盖率 artifact 包含 JSON、lcov、summary、commit 和运行时元数据 | CI artifact |
| A22 | 覆盖率 scope 只包含约定的 `lib/` 与 lifecycle helpers，排除生成物和测试文件 | coverage 配置 + scope 清单 |
| A23 | 全 scope 达到 lines/statements/functions ≥80%、branches ≥75%；关键模块达到局部阈值 | summary + 阈值配置 |
| A24 | PR 与 `main` push 的 `quality` 都执行 coverage；失败阈值会阻断并上传 artifact | 失败/通过验证运行 |

---

## 8. 回滚与前向修复

### 8.1 提交边界

建议至少形成以下可独立回滚提交：

1. Playwright 安全升级；
2. Node 版本合同；
3. Next/React 与 async route migration；
4. ESLint/coverage；
5. CI/Dependabot；
6. 文档与证据。

不得把 generated lockfile、业务改动、视觉 golden 和仓库设置混成一个不可解释提交。

### 8.2 依赖回滚

- Playwright 回退到 1.51.1 会重新引入已知高危风险，默认只允许前向修复或暂时固定浏览器镜像，不允许部署包含旧版本的新提交。
- Next/React 回滚必须同时回滚 manifest、lockfile、async route 适配和相关类型变更，不能手改 lockfile。
- 如果生产已经暴露于已知漏洞，不以“回滚到能构建的旧版本”为默认恢复；优先回滚应用流量或前向修复。
- 任何临时安全例外必须有风险 owner、影响面、到期日和补救 PR。

### 8.3 仓库规则恢复

required check 基础设施故障时，可在明确的维护窗口临时调整规则，但必须：

1. 保持 force push/delete 禁用；
2. 记录故障和调整者；
3. 只对一个已审核提交生效；
4. 在恢复后重新运行完整 check；
5. 24 小时内恢复规则，否则停止合并。

---

## 9. 预计文件影响

### 9.1 新增

- `.nvmrc` 或 `.node-version`
- `eslint.config.mjs`
- `.github/dependabot.yml`
- 覆盖率配置或报告脚本
- 本 Spec 的实施证据目录（如 `docs/code-health-remediation/`）

### 9.2 修改

- `package.json`
- `package-lock.json`
- `.github/workflows/quality.yml`
- `next.config.mjs`（仅当官方迁移确有要求）
- `tsconfig.json`（仅由 Next/React 类型迁移要求驱动）
- 第 4.1 节 8 个动态路由文件
- `app/projects/page.tsx`
- `scripts/check-performance.mjs` 及其测试
- `playwright.config.ts`（仅当浏览器版本要求）
- README 与发布/构建指标文档

### 9.3 仓库外设置

- GitHub branch protection/ruleset
- Dependabot alerts/security updates
- CodeQL default setup
- 本地 `gh` 凭证

仓库外设置必须有 API 输出、截图或演练 PR 作为证据；仅在 Spec 中打勾不算完成。

---

## 10. 风险与控制

| 风险 | 早期信号 | 控制 |
| --- | --- | --- |
| 框架升级吞并当前未提交工作 | lock diff 同时出现 Lighthouse 与框架变化 | WP0 先隔离，分 PR 串行合并 |
| Codemod 产生无关改写 | 大量格式/组件结构变化 | 先 dry-run；逐 hunk 审核；只保留必要迁移 |
| async params 改变页面语义 | metadata、notFound 或旧 query 回归 | 路由矩阵与现有 E2E 阻断 |
| React 19 hydration 回归 | 控制台 mismatch、Starter 输入异常 | 5 个 Client Component 专项测试 |
| Turbopack 使 bundle budget 失真 | manifest 缺页或计算为 0 | 新旧 seam 双读；0 bytes 视为失败 |
| Playwright 浏览器升级造成大面积 diff | snapshot 全量变化 | 保存 diff、人工逐页批准，禁止盲更 |
| audit 偶发网络故障阻塞 CI | registry 5xx/超时 | 明确 blocked；有限重试；不把失败吞掉 |
| Dependabot PR 过多 | 多个 framework major 同时出现 | 周更、分组 minor/patch、限制 open PR |
| required check 名称冲突 | GitHub 显示多个同名来源 | job 名唯一，来源限定 GitHub Actions |
| 单人仓库 review 规则锁死 | 无第二账户可批准 | P0 先要求 PR+check；有第二维护者后再要求 1 review |
| 临时回退重新引入漏洞 | rollback 后 audit 重新变红 | 安全回退需例外审批；优先前向修复 |

---

## 11. Definition of Done

本代码健康修复仅在以下条件全部满足时完成：

1. 当前工作树改动已被清楚隔离，修复分支基于最新远端 `main`；
2. Node 24.18.0、Next/React/DOM、Playwright 以及对应类型包按 WP0 从官方 registry 重新确认并批准的矩阵解析；
3. full npm audit high/critical = 0，旧脆弱版本在最终依赖图中不存在；
4. async route props、React 19、Turbopack 和构建指标 seam 均有针对性证据；
5. 原有单元、构建、内容、链接、证据、E2E、axe、视觉、Lighthouse、环境和回滚门禁全部保留并通过；
6. ESLint 与领域 lint 同时阻断；覆盖率 artifact、scope、阈值与 CI enforcement 已记录且没有降低门禁；
7. Dependabot 和 CodeQL 已启用并完成首次运行；
8. `main` 受 PR、最新 `quality`、对话解决、禁止 force push/delete 的强制规则保护；
9. 验证 PR 证明规则真实生效，没有管理员绕过；
10. 回滚/前向修复路径、负责人、证据和剩余风险已写入实施记录。

完成本 Spec 不等于 Release C 的真人、内容 owner、正式域名和生产发布证据已经完成；两组 Done 必须分别满足。

---

## 12. 权威依据

- [Next.js 16 升级指南](https://nextjs.org/docs/app/guides/upgrading/version-16)：Node 20.9+、async Request APIs、Turbopack 默认构建、React 19.2 与构建指标变化。
- [Next.js Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)：支持按精确版本运行升级 codemod，并提供 dry-run/print 能力。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)：React 18.3 过渡警告、React 19 与 TypeScript 迁移要求。
- [React Versions](https://react.dev/versions)：React 19.2 当前版本线。
- [Node.js Releases](https://nodejs.org/en/about/previous-releases) 与 [Node.js EOL](https://nodejs.org/en/about/eol)：Node 24 为 LTS，Node 20 已 EOL。
- [Playwright 1.55 Release Notes](https://playwright.dev/docs/release-notes)：浏览器版本与 breaking-change 边界。
- [GitHub Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)：PR、required checks、force push/delete 等保护语义。
- [GitHub Dependabot Version Updates](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configuring-dependabot-version-updates)：npm 与 Actions 依赖自动更新配置。
- [GitHub CodeQL Default Setup](https://docs.github.com/en/code-security/how-tos/scan-code-for-vulnerabilities/configure-code-scanning/configuring-default-setup-for-code-scanning)：公开 JavaScript/TypeScript 仓库默认扫描配置。

## 附录 A：巡检证据摘要

> 本附录是前一轮巡检的静态摘要，不是 Release C 动态状态，也不是本次依赖升级结果。本次仅刷新了 Git 基线和工作区路径事实；未执行依赖升级或 `npm audit`。

| 证据 | 结果 |
| --- | --- |
| `git diff --check` | 通过；现有 Windows 工作树有 LF→CRLF 提示 |
| `npm install --package-lock-only --ignore-scripts --dry-run` | package/lock 当前同步 |
| `npm run check` | 通过 |
| Vitest | 9 files、24 tests 全部通过 |
| Next build | 46 个页面单元生成成功 |
| Release C browser chain | 102 passed、6 skipped |
| Lighthouse | 3 路由 Performance/Accessibility 100，LCP <1.9s，CLS 0 |
| 远端 `main` CI | 此前记录 Actions #17 success；本次未重新核验 |
| `npm audit` | 前一轮记录 4 high dependency nodes、0 critical；本次按要求未运行 |
| `main` branch API | 前一轮记录 `protected=false`、required checks 为空；本次未重新核验 |

## 附录 B：开工审批胶囊

在 WP0 结束、WP1/WP2 开始前，实施者必须给出一段不超过一页的审批记录：

```text
基线 SHA：
当前工作树处理方式：
目标版本矩阵：
audit 摘要：
预计 lockfile 影响：
已知迁移文件：
回滚提交边界：
负责人：
下一动作：
```

缺少任一字段时，不开始 authoritative manifest/lockfile 写入。
