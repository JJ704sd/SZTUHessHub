# Phase 1.5 发布与回滚清单

## 预览验收

- [ ] 发布负责人：________；预览地址：________；构建版本：________。
- [ ] 学生验收：390/768/1024/1440 宽度下完成“比较专业 → 能力 → 项目”三条任务路径。
- [ ] 教师验收：核对课程事实、来源版本、项目边界、资源状态和外链可达性。
- [ ] 键盘与辅助技术：跳过链接、菜单 Escape/焦点回归、筛选、详情 disclosure、外链状态均可完成。
- [ ] 运行 `npm.cmd run check`、生产服务 `npm.cmd run e2e:smoke` 和 `npm.cmd run a11y:smoke`；浏览器 axe 结果记录在发布工单。

## 发布门禁

- [ ] `NEXT_PUBLIC_SITE_URL` 为真实 HTTPS 域名，不含 example/localhost。
- [ ] `RELEASE_VERSION` 与 `ROLLBACK_VERSION` 均已填入，且指向不同可部署版本。
- [ ] 资源健康快照已复核；降级资源有替代入口或明确说明。
- [ ] 预览截图、Lighthouse/Web Vitals 和 axe 报告已归档。

## 回滚

- [ ] 回滚负责人：________；回滚版本：________；触发阈值：________。
- [ ] 回滚到上一个已验收版本，保留 `/majors`、`/capabilities`、`/projects`、`/scenarios` URL。
- [ ] 回滚后重新执行首页、项目筛选、资源状态和安全边界烟测，并记录时间与结果。
