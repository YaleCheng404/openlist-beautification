# OpenList Beautification

这是一个面向 OpenList 的轻量美化代码仓库。它不枚举每一个前端组件，而是监听 DOM 变化，只替换已有背景色的节点，因此在 OpenList 前端更新后通常仍能继续工作。

当前实现会在首次加载时扫描页面，之后仅处理新增节点或主题 class 变化，并用 `requestAnimationFrame` 合并同一帧内的更新。管理页始终停用美化；普通版同时排除登录页，登录版则会美化登录页。

## 依赖与兼容性

依赖审计日期：2026-07-14。

- 项目没有 npm、Python、Rust 等本地包管理依赖，也不需要构建步骤。
- 已按 [OpenList Frontend 4.2.3](https://github.com/OpenListTeam/OpenList-Frontend/blob/main/package.json) 的页面结构验证。
- 自定义字体使用 `lxgw-wenkai-webfont@1.7.0`；它仍是该 Webfont 包的[最新版本](https://github.com/chawyehsu/lxgw-wenkai-webfont/releases/tag/lxgw-wenkai-webfont%401.7.0)。
- `head.html` 还会加载 `cdn.mmoe.work` 上的背景图片；`body_with_login.html` 会加载萌备案相关链接和图标。

## 文件

- `head.html`：字体、背景图和基础页面样式。
- `body.html`：默认动态美化器，不处理登录页和管理页。
- `body_with_login.html`：包含登录页与页脚美化，只排除管理页。
- `src/beautifier.js`：`body.html` 中美化器的独立版本。
- `src/beautifier_with_login.js`：允许登录页美化的独立版本。

## 使用方法

按照 [OpenList 全局设置文档](https://docs.openlist.team/config/global.html)，把 `head.html` 和以下二选一文件粘贴到对应设置中：

- 默认方案：使用 `body.html`。
- 需要美化登录页：使用 `body_with_login.html`。

### 仅通过 CDN 引入美化器

如果只需要背景色美化，可以使用当前仓库的脚本：

```html
<style>
    .hope-ui-light,
    .hope-ui-dark {
        --hope-colors-background: transparent;
    }
</style>

<script type="module" src="https://fastly.jsdelivr.net/gh/YaleCheng404/openlist-beautification@main/src/beautifier.js"></script>
```

生产环境如需完全固定内容，可把 URL 中的 `main` 换成具体提交哈希。

### 控制台

实例通过 `window.beautifier` 暴露：

- `observe()`：开始监听并美化。
- `disconnect()`：停止监听。
- `undo()`：停止监听并清除已应用的背景色。

例如：

```javascript
window.beautifier.undo();
```

### 修改颜色

在 `body.html` 或对应的 `src/*.js` 中修改 `COLORS`：

```javascript
const COLORS = {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgb(32, 36, 37)'
};
```

## 关于

原理介绍见[作者文章](https://blog.mmoe.work/alist-js-beautification/)。项目采用 AGPL-3.0 许可。
