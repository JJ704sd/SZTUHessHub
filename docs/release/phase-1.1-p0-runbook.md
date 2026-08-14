# Phase 1.1 P0 发布与回滚

## 环境合同

| 环境 | `HSEEHUB_ENV` | canonical | robots/sitemap | release ID |
| --- | --- | --- | --- | --- |
| development | `development` | 不输出 | 禁止抓取、空 sitemap | 可用本地默认值 |
| preview | `preview` | 不输出 | 禁止抓取、空 sitemap | 可用预览值 |
| production | `production` | 必须是正式 HTTPS origin | allow + 正式 sitemap | 必须提供不可变 `HSEEHUB_RELEASE_ID` |

`HSEEHUB_ENV` 与 `NEXT_PUBLIC_HSEEHUB_ENV` 若同时设置必须一致。production candidate 必须先通过 `npm run env:check`、`npm run build` 和 `npm run metadata:check`。

## 发布顺序

1. 在目标 commit 上执行 `npm ci`、`npm run check`、`npm run runtime:check` 和 Playwright 门禁。
2. 为每个版本生成不可变构建产物，版本目录由发布系统管理；运行中的 production alias 只指向一个已验证版本。
3. preview 验证 noindex、robots、旧项目参数、核心 SSR 路径后，再切 production alias。
4. 发布后复查正式 canonical、robots、sitemap、首页/项目页性能预算和资源健康快照。

## 回滚

回滚只切换 production alias 到上一个已验证的不可变版本，不重建、不覆盖、不修改旧产物。切换后重新执行 production metadata、runtime 和 smoke 门禁；失败时恢复原 alias 并保留日志。

旧项目查询参数在至少一个发布周期内继续解析；确认旧链接流量已迁移后，另行提交 contract/contraction 变更，不在本次 P0 中移除。
