# dsh-deepseek-chat-panel

Open [DeepSeek's web chat](https://chat.deepseek.com) beside the current session, inside DeepSeek Harness's right Sidebar browser.

DeepSeek's site refuses to be framed (WAF / frame policy), so this plugin does **not** embed an iframe. It reuses the shipped right-Sidebar Browser tab — the same sandboxed Electron `webview` DSH uses for any web page — and only adds the entry points.

## What it adds

- **Sidebar foot row** above *Settings*, labelled `DeepSeek Chat`. Always visible; it needs a selected session and stays disabled otherwise.
- **Composer button** in the tool row at the bottom left of the message box, next to `+`. Visible once a session exists (a brand-new session has no id until the first message, so this seat is absent then).

Both open `https://chat.deepseek.com/` in the right Sidebar and expand it. Clicking again focuses the tab this plugin already opened instead of stacking live webviews.

## Requirements

- **DSH Desktop** (Electron). The Web profile disables the sidebar Browser by default; there the entry points render as unavailable.
- No configuration and no build step.

## Install

1. Clone this repository.
2. In DSH Desktop, open the **Plugins** page and use **Add plugin** to install this directory.
3. Restart DSH (or reload the window). The entry points appear as described above.

## Use

1. Select a session.
2. Click `DeepSeek Chat` in the sidebar foot, or the blue bubble in the composer.
3. Sign in on the page the first time.
4. Use the right Sidebar's fullscreen control when you want more room.

## Limitations

- Desktop only, as above.
- Sign-in state lives in the sandboxed Browser partition and does not survive an app restart, so you may need to sign in again after restarting DSH.
- The DeepSeek page itself starts a new web chat on load; its history belongs to your DeepSeek account, not to this plugin or to DSH.
- The plugin reads nothing from and proxies nothing to the page: it opens a fixed URL.
- Web-profile entry points stay disabled because a cross-origin frame would be refused by the site.

## How it works

A single bundle: `cordis.patch.yml` inserts the `deepseek-chat` row, `index.js` is the empty Host half, and `client.js` is the browser half. It registers into two slots — `sidebar.footer.action` and `conversation.input.left` — and calls `ctx.sidebarRight.openTab('browser', { params: { url } })`. Localized metadata lives in `locale/*.json`; `icon.svg` is the plugin icon.

## License

MIT

---

# 中文说明

把 DeepSeek 网页版对话贴到 DeepSeek Harness 旁边。

DeepSeek 站点会拒绝被 iframe 嵌入,所以本插件不自己做网页容器,而是复用 DSH 自带的右栏浏览器(桌面版的 Electron `webview`),只增加入口。

## 入口

- **左侧栏底部、Settings 上方**的一行 `DeepSeek Chat`:始终可见;需要先选中会话,否则置灰。
- **输入框左下角工具行**(`+` 按钮右侧)的蓝色气泡按钮:会话开始后才出现(新会话在发出第一条消息前还没有会话编号)。

两处都会在当前会话的右侧栏打开 `https://chat.deepseek.com/` 并展开该栏。再次点击会聚焦已经打开的那个标签,不会叠加。

## 安装

1. 克隆本仓库。
2. 在 DSH Desktop 打开 **插件** 页面,用 **添加插件** 选择这个目录安装。
3. 重启 DSH(或刷新窗口)。

## 限制

- 只支持桌面版;Web 版内置浏览器默认关闭,入口显示不可用。
- 登录状态保存在内置浏览器的沙箱分区里,应用重启后可能需要重新登录。
- 网页本身每次加载都是新对话,历史在你的 DeepSeek 账号里。
- 插件不读取、不代理页面内容,只打开固定地址。

## 许可证

MIT
