# HseeHub 第一版质量检查点

这份检查点把 `HseeHub-website-architecture-spec.md` 的 Phase 0/1 约束变成可重复的本地门禁。它不是新的产品范围；任何新增功能仍需回到原始 spec 和内容证据。

## 范围冻结

- 单一 Next.js App Router 应用，内容由 `content/site-data.json` 与类型化读取层提供。
- 首版公开只读浏览，默认内容版本由 `lib/site-config.ts` 的 `currentCohort` 控制。
- 一级导航只有学院与专业、能力与课程、项目探索、发展场景；不创建 Phase 2/3 空路由。
- 不实现登录、收藏、进度、社区、评论、投稿、职位抓取、企业排名、真实患者数据、在线模型训练或任意代码执行。

## 检查点

| 检查点 | Gate | 通过证据 |
| --- | --- | --- |
| CP0 设计冻结 | 路由、内容事实源、版本边界与安全边界明确 | 原始 spec + `lib/site-config.ts` + 本文件 |
| CP1 Phase 0 骨架 | AppShell、语义 token、主题、基础路由、内容读取层可构建 | `npm run typecheck`、`npm run build` |
| CP2 内容关系 | 2 专业、2 双解、8 能力、3 项目、6 场景、FAQ、来源与关系引用完整 | `npm run content:check`、`npm run links:check` |
| CP3 垂直切片 | 首页 → 双专业对照 → 能力/课程 → 项目可走通 | `npm run build` + 浏览器检查 |
| CP4 体验验收 | 桌面/移动、亮暗主题、键盘、200% 缩放、无 JS 核心文字可读 | 浏览器/手工清单 |
| CP5 交付可靠性 | SEO 路由、sitemap、robots、外链状态和构建输出可定位 | `npm run build` + 页面 smoke check |
| CP6 迭代门 | 修改后不漂移出 spec，且所有自动化门禁保持绿色 | `npm run check` + 双轴 spec review |

## 每轮迭代的最小命令

```text
npm run lint
npm run content:check
npm run links:check
npm run typecheck
npm run build
```

学生 5–10 分钟理解测试仍需人工完成：至少验证共同底座、两个专业各两项侧重、一个协作案例、三个非医疗场景，以及一个可继续尝试的项目角色。自动化绿色不替代该人工 gate。
