# Phase 1.1 P0 人工门禁清单

自动门禁通过不等于发布通过。以下项目需要由真实 Windows/NVDA/Chrome、学生、教师和 release owner 填写证据后，才能运行 `npm run production:check` 并放行。

## NVDA + Chrome

使用已确认的 preview origin，关闭浏览器缩放扩展和自动填充；不记录账号、姓名或完整 URL 查询串。

1. `/`：用 H1/H2 导航确认四模块；用链接列表确认三个任务入口，能识别唯一主入口。
2. `/majors/compare`：确认共同底座、两个专业侧重、同题双解 disclosure 的展开状态和下一步项目入口。
3. `/projects`：确认结果数量、旧条件摘要、无效条件提示、零结果清除入口；确认页面没有筛选控件。
4. `/projects/signal-feature-notebook/resources`：确认机器/人工/freshness、owner、许可、fallback 和“不作为主 CTA”说明。
5. 键盘：Skip link → main；Header → 菜单 → 首个移动链接；Escape 关闭菜单并回焦点；所有主要链接可 Enter 激活。

记录：浏览器版本、NVDA 版本、测试日期、路径结果、读屏误读和修复截图。当前 owner/记录位置未冻结。

## 缩放、主题与动效

- 浏览器 200%：首页、对照页、项目页、资源页核心文字和控件不遮挡、不截断、无非必要横向滚动。
- 亮色/暗色/跟随系统：文字、边框、焦点和状态徽标保持可读。
- `prefers-reduced-motion: reduce`：无非必要位移、连续动画或过渡；主题/菜单仍可操作。

## 学生/教师测试

- 12 名学生，至少 6 名移动端；完成首页任务选择、专业对照和项目选择，记录成功/失败、误解点、耗时和 SEQ。
- 至少 2 名专业教师/负责人；分别复核两个专业事实、转译措辞、来源、学分和安全边界。
- 测试记录不得把个人信息或自由文本发送到事件系统；保存位置和隐私同意责任人待项目 owner 指定。

## Release gate

填写 starter owner、技术维护 owner、权威 artifact/tag、许可证证据 URL、人工走通日期/复核人、正式 origin、artifact registry、alias/traffic 切换方式和回滚执行人后，再运行：

```powershell
$env:HSEEHUB_ENV = 'production'
$env:NEXT_PUBLIC_HSEEHUB_ENV = 'production'
$env:NEXT_PUBLIC_SITE_URL = '<已人工确认的 HTTPS origin>'
$env:HSEEHUB_RELEASE_ID = '<不可变 release id>'
npm run production:check
```
