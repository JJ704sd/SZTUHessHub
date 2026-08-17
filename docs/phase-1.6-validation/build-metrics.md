# Phase 1.6 构建与页面指标

## 基线

基线是已对齐的 `origin/main@e6df957`，不是旧的 `main@08e3799`；随后为消解 PR 冲突合入了更新后的 `origin/main@c74a8e5`，当前验证 HEAD 为 `50cf131`。在对齐基线上运行 `npm run check`，合并后再次运行通过：

| 指标 | Phase 1.5 对齐基线 |
| --- | ---: |
| 静态页面 | 38 |
| 首页 First Load JS | 96.2 kB |
| `/projects` First Load JS | 98.6 kB |
| shared First Load JS | 87.3 kB |

旧的 Phase 1.5 说明曾记录 `/projects` 为 113 kB；以可复现的对齐分支构建输出为比较基准，未在旧数字上重复实现 Phase 1.5。

## Phase 1.6 最终构建

最后一次 `npm run check` / `npm run build`：2026-08-17，本地生产构建，38 个生成页面。`/majors/compare` 已从页面产物移除并由 308 canonical redirect 接管。

| 指标 | Phase 1.6 | Gate |
| --- | ---: | --- |
| 首页 First Load JS | 96.2 kB | ≤ min(96.2 kB, 100 kB)，通过 |
| `/projects` First Load JS | 96.2 kB | 不高于对齐基线，通过 |
| shared First Load JS | 87.3 kB | 记录 |
| `/projects` 路由特有 JS | 2.58 kB | ≤ Phase 1.5 12 kB 建议，通过 |

## 最终生产构建浏览器预检

本地 `next start -p 3020`，亮色几何；Playwright 视觉矩阵另测亮/暗主题。`scrollWidth` 小于等于 viewport client width，未发现横向溢出。

| 页面 | 390×844 高度 | 768×1024 高度 | 1440×900 高度 |
| --- | ---: | ---: | ---: |
| `/` | 4917 px | 5364 px | 3141 px |
| `/majors` | 6579 px | 4977 px | 3918 px |
| `/capabilities` | 5008 px | 3272 px | 2562 px |
| `/projects` | 3975 px | 4213 px | 2141 px |

首页任务入口位置：390px 为 y=272/360/449，768px 为 y=233/322/410，1440px 三列均从 y=253 开始。首页高度 Gate：390px ≤ 5064px、768px ≤ 6144px、1440px ≤ 3600px，均通过；三种视口均未横向溢出。

`artifacts/perf-ci.json` 保留 Lighthouse 门禁报告。当前环境没有可执行的 `lighthouse`，临时 `npx` 尝试也未在超时内返回，因此没有虚构 Performance、Accessibility 或 SEO 分数。
