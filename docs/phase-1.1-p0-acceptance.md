# Phase 1.1 P0 验收记录

本文件只记录可复现的自动化门禁和仍需人工确认的发布条件；不把自动化结果冒充学生/教师真实体验。

## 已自动化

- `npm run check`：源码 lint、内容/资源合同、链接、四模块结构、事件隐私白名单、TypeScript、单元测试、生产构建和首页/项目页性能预算。
- `npm run runtime:check`：首页四模块与三任务、对照页 disclosure、项目默认三卡、合法/无效/混合旧参数、starter、资源双状态、claims 登记。
- `npm run e2e:smoke` 与 `npm run a11y:smoke`：SSR 页面、skip link、main landmark、图片 alt、404。
- `npm run e2e:playwright`：主题切换、移动菜单焦点/ Escape、旧项目查询参数、axe serious/critical、320/390/768/1280px 双卡 bounding-box、祖先 overflow、滚动白名单、键盘、200% 等效布局和 reduced-motion。
- `npm run metadata:check`：preview/development noindex、robots 禁止抓取、canonical 缺省；production candidate 要求正式 canonical、robots allow 和 sitemap origin。
- `npm run env:check`、`npm run rollback:check`：环境一致性、production HTTPS/release ID、不可变产物只切 alias 的回滚演练。

## 人工发布门

以下项目必须由发布负责人在真实浏览器环境逐项签字：

1. NVDA + Chrome：跳过链接、全局导航、主题按钮、移动菜单、对照 disclosure、项目条件摘要和 starter 表单。
2. 键盘：Tab 顺序、焦点可见、Escape 返回菜单按钮、无键盘陷阱。
3. 200% 浏览器缩放：首页、对照页、项目页无水平滚动；核心文字仍为服务端可读内容。
4. 亮/暗主题与 `prefers-reduced-motion`：对比度、焦点、动画降级。
5. 人工学生/教师走通：signal-feature-notebook 新浏览器、无账号、零安装；2 分钟第一条有效操作；10 分钟保存曲线截图和三行观察。

人工学生/教师测试在内测人数有限的阶段暂不作为本次提交的自动门禁；发布前仍需完成一次人工走通并登记版本、许可、owner 和时间。
