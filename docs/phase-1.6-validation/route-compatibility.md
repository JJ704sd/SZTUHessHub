# Phase 1.6 路由兼容矩阵

| 旧/新入口 | 响应与目标 | query | fragment / anchor | 证据 |
| --- | --- | --- | --- | --- |
| `/majors` | 200，唯一 canonical | 原样保留 | `#dual-lens`、两个 dual-lens case slug 作为页面 anchor 保留 | `app/majors/page.tsx`、metadata、Playwright |
| `/majors/compare` | Next permanent redirect，HTTP 308 到 `/majors` | Next redirect 保留 query；`?view=dual` 已覆盖 | 浏览器负责保留原 fragment；服务端不读取 fragment，`#dual-lens` 在目标页存在 | `next.config.mjs`、`critical.spec.ts` |
| `/majors/compare?view=dual#dual-lens` | `/majors?view=dual#dual-lens` | 保留 | 保留并滚动到目标 anchor | Playwright 通过 |
| `/projects?major=...&duration=...&level=...&format=...` | 200；筛选仍由 `/projects` 消费 | 旧项目查询参数不改名 | 不依赖 fragment | `projects` 功能 E2E、`e2e-smoke.mjs` |
| `/projects?major=missing-major` | 200；显示可恢复 empty state | 原样保留，清除按钮回到 `/projects` | 不依赖 fragment | Playwright 通过 |
| `/majors/faq` | 200，独立 FAQ 路由保留 | 原样保留 | FAQ 内部锚点不由服务端解析 | Playwright 404/FAQ 通过 |
| `/sitemap.xml` | 200；只列 `/majors`，不列 `/majors/compare` | 无 | 无 | `app/sitemap.ts`、build 产物 |

兼容边界：服务端只处理 path 与 query；fragment 不发送给服务器，因此实现保留目标 anchor ID/alias，不尝试在服务端读取 fragment。浏览器前进/后退由 E2E 覆盖，未修改项目分享链接的参数名称。
