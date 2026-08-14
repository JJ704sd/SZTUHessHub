# HseeHub Phase 1.1 发布、校验与回滚手册

本手册只定义可复现的发布合同，不假定具体云厂商、DNS 服务或流量平台。真实 production origin、发布 owner、preview owner、版本别名和回滚权限仍需由 M0/M1 决策 owner 补齐后才能执行线上切换。

## 环境合同

每次构建必须同时设置 `HSEEHUB_ENV` 与 `NEXT_PUBLIC_HSEEHUB_ENV`，两者必须相同：

| 环境 | `NEXT_PUBLIC_SITE_URL` | robots / canonical | 发布标识 |
| --- | --- | --- | --- |
| development | 可省略，默认 localhost | noindex；无 canonical | 可选 |
| preview | 显式 preview origin | noindex；无 canonical | 建议使用 commit SHA |
| production | 真实 HTTPS origin，禁止 localhost、回环地址、`.example`、`.invalid` 等占位域名 | 允许抓取；canonical 必须与 origin 一致 | 必须是不可变 `HSEEHUB_RELEASE_ID` |

`NEXT_DIST_DIR` 用于让不同版本构建使用隔离的产物目录。production 构建不得复用或覆盖另一个 release 目录。

## CI 门禁

`.github/workflows/ci.yml` 在 pull request 和 `main` push 上执行 `npm ci` 与 `npm run check`。`check` 包含：

- 源码、内容、链接、四模块/导航/双卡结构检查；
- 事件字段与隐私白名单、项目旧参数四种语义；
- 环境合同与 TypeScript 检查；
- production build 等价的 preview build；
- 首页 110 KiB、项目列表 125 KiB gzip 首屏预算。

## Preview 演练

在拥有 preview origin 的环境中，使用一次性 release id 构建和启动：

```powershell
$env:HSEEHUB_ENV = 'preview'
$env:NEXT_PUBLIC_HSEEHUB_ENV = 'preview'
$env:NEXT_PUBLIC_SITE_URL = 'https://<已确认的-preview-origin>'
$env:HSEEHUB_RELEASE_ID = "preview-$env:GIT_COMMIT"
$env:NEXT_DIST_DIR = '.next-preview'
npm ci
npm run check
npm run start -- -p 3101
```

将 `HSEEHUB_CHECK_ORIGIN=http://localhost:3101` 传给 `npm run metadata:check`，确认首页包含 noindex、`robots.txt` 禁止抓取、没有 canonical。浏览器人工走通首页、对比页、项目列表、三个项目详情和 signal-feature-notebook starter 后，才允许把 preview release 标记为候选。

随后运行 `npm run runtime:check`，验证四模块首页、对照顺序、项目旧参数、能力下一步、starter/资源/claim 的服务端输出。它是 HTTP SSR 烟测，不替代视口、键盘、NVDA 或教师/学生人工复核。

## Production 演练

真实 origin 和发布 owner 确认后，构建不可变目录；同一目录只读部署，不在服务器上修改内容：

```powershell
$env:HSEEHUB_ENV = 'production'
$env:NEXT_PUBLIC_HSEEHUB_ENV = 'production'
$env:NEXT_PUBLIC_SITE_URL = 'https://<已确认的-production-origin>'
$env:HSEEHUB_RELEASE_ID = '<不可变-release-id>'
$env:NEXT_DIST_DIR = ".next-$env:HSEEHUB_RELEASE_ID"
npm ci
npm run check
npm run start -- -p 3102
```

对 `HSEEHUB_CHECK_ORIGIN=http://localhost:3102` 运行 `npm run metadata:check`，确认：

- 首页 canonical 与 production origin 完全一致；
- 没有 `hseehub.example` 或其他占位域名；
- `robots.txt` 允许抓取；
- `sitemap.xml` 使用 production origin。
- `npm run runtime:check` 在 production candidate 上通过。

随后运行 `npm run production:check`。该门禁只有在 claim 已有 owner/reviewedAt/reviewedBy、primary starter 有 30 天内人工走通证据、许可证证据和最近自动成功记录时才放行；pending 数据应阻断发布，而不是被测试 fixture 掩盖。

这里的本地端口演练只能证明构建和 HTML 合同，不能替代真实 DNS、CDN、TLS、监控和发布权限复核。

## 不可变版本回滚演练

回滚目标是把流量/别名从当前 release 原子切回上一个已验证 release，不重新构建、不修改已发布目录：

1. 记录当前 release id、上一个 release id、切换时间和执行 owner。
2. 对上一个 release 运行 `metadata:check` 和核心路径 smoke test。
3. 暂停新 release 的流量，原子切换版本别名到上一个 release。
4. 再跑首页、`/majors/compare`、`/projects`、三个项目详情与 robots/canonical 校验。
5. 记录结果；若旧 release 也失败，停止继续切换并升级给 production owner。

验收目标：不超过 30 分钟完成切回；回滚不改变内容事实源、不删除任何 release 目录。具体别名/流量平台和 owner 未在 M0/M1 中冻结前，不在仓库中虚构 provider 命令。
