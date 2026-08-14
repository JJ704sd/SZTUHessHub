# Phase 1.1 浏览器验收记录

本记录对应本地 final build，通过 Browser in-app Chromium 对 `http://localhost:3006` 复核。它不是 NVDA + Chrome 实机验收，也不替代真实学生/教师测试。

## 视口与 dual-card

每个视口同时检查：

- 标题、角色、输入、输出、接口和验收字段的 bounding box 在视口内；
- dual-card 自身 `scrollWidth <= clientWidth`；
- 祖先链不存在非白名单 `overflow-x/y: hidden|clip`；
- 根节点 `scrollWidth === clientWidth`；
- 除 `.comparison-table-wrap`、`.mobile-nav`、`.project-visual`、`.project-facts`、`.sr-only` 外没有滚动容器。

浏览器评估脚本（在每个视口、以及展开第二个 `details` 后执行）：

```js
const SCROLL_WHITELIST = new Set([
  '.comparison-table-wrap', '.mobile-nav', '.project-visual', '.project-facts', '.sr-only',
]);
const fields = ['h3', '.lens-heading', '.lens-facts', '.dual-footer'];
const cards = [...document.querySelectorAll('.dual-card')]
  .filter((node) => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0);
const badAncestors = (node) => {
  const result = [];
  for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    if (['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY)) {
      result.push(parent.className || parent.tagName);
    }
  }
  return result;
};
const scrollContainers = [...document.querySelectorAll('body *')]
  .filter((node) => {
    const style = getComputedStyle(node);
    const horizontal = ['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowX) && node.scrollWidth > node.clientWidth;
    const vertical = ['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowY) && node.scrollHeight > node.clientHeight;
    return horizontal || vertical;
  })
  .filter((node) => ![...SCROLL_WHITELIST].some((selector) => node.matches(selector)));
for (const card of cards) {
  const box = card.getBoundingClientRect();
  console.assert(box.left >= 0 && box.right <= innerWidth, 'dual-card bounding box', box);
  console.assert(card.scrollWidth <= card.clientWidth, 'dual-card own overflow', card);
  for (const selector of fields) {
    const field = card.querySelector(selector);
    const fieldBox = field?.getBoundingClientRect();
    console.assert(fieldBox && fieldBox.left >= 0 && fieldBox.right <= innerWidth, `field ${selector}`, fieldBox);
  }
  console.assert(badAncestors(card).length === 0, 'non-whitelist ancestor overflow', badAncestors(card));
}
console.assert(document.documentElement.scrollWidth <= document.documentElement.clientWidth, 'root horizontal overflow');
console.assert(scrollContainers.length === 0, 'non-whitelist scroll containers', scrollContainers);
```

| 视口 | 第一张卡宽度 | 第二张卡宽度 | 字段 / 根节点 / 祖先 / 滚动白名单 |
| --- | ---: | ---: | --- |
| 320 × 844 | 273px | 247px | 通过 |
| 390 × 844 | 343px | 317px | 通过 |
| 768 × 900 | 721px | 695px | 通过 |
| 1280 × 900 | 590px | 564px | 通过 |

第二张案例先通过原生 `details` 展开，再重复同一组断言。关闭时内容 `display: none`，不会被误读为已展开。

## 核心交互

- 390px：移动菜单打开后首链接获得焦点；Escape 关闭并把焦点还给菜单按钮；关闭菜单链接 `tabIndex=-1`。
- 390px：主题按钮可切换 `data-theme=dark/light`，并同步 `aria-pressed` 和可见标签。
- Skip link 强制激活后 URL 为 `#main-content`，焦点落在 `main#main-content`。
- `/projects`：默认 3 张、无 `select`；有效、无效、混合、零结果旧参数均显示正确摘要/提示。
- `/capabilities` → 第一项详情：下一步区至少提供 3 个相关场景入口。
- Starter：服务端文字包含无账号/零安装、2 分钟首操作和三行观察；页面有 SVG 曲线、3 个 textarea。

## 尚待外部人工完成

- Windows NVDA + Chrome 主路径；
- 实际浏览器 200% 缩放；
- 系统级 `prefers-reduced-motion` 切换；
- 目标学生、教师和 starter owner 的真实走通与复核。
