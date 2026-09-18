# FLAQ AI Creator Browser Plugin

Chrome / Edge Manifest V3 侧边栏扩展。在浏览网页时，可直接使用当前页面标题、选中文字或右键图片作为创作上下文，通过 FLAQ API 生成图片与视频。

## 功能

- 点击扩展图标打开浏览器原生 Side Panel
- 自动读取当前标签页标题与选中文字
- 右键选中文字或图片发送到 FLAQ
- 图片 / 视频模型、画幅、清晰度和时长选择
- 直接调用 FLAQ Open API，轮询任务并保存本地生成记录
- Client Key 仅保存在扩展的 `chrome.storage.local`
- 扩展网络权限仅开放给官方 `https://api.flaq.ai/*`

## 本地开发

环境要求：Node.js 20+、pnpm 10.5.2，以及支持 Manifest V3 Side Panel 的 Chrome 116+ 或新版 Edge。

安装依赖并启动普通网页预览：

```bash
pnpm install
pnpm dev
```

打开 <http://127.0.0.1:5173/sidepanel.html>。该模式支持 Vite 热更新，适合调整布局、表单和响应式样式；它使用浏览器 API 的降级逻辑，不能验证 Side Panel、扩展右键菜单、`activeTab` 权限或 `chrome.storage.local`。

## 浏览器扩展开发验证

### 1. 构建扩展

```bash
pnpm typecheck
pnpm test
pnpm build
```

构建产物位于 `dist/`。每次修改 `public/manifest.json`、`public/background.js` 或需要进行真实扩展验证时，都应重新运行 `pnpm build`。

### 2. 加载未打包扩展

Chrome：

1. 打开 `chrome://extensions/`。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择本仓库的 `dist/` 目录。
4. 将 **FLAQ AI Creator** 固定到工具栏，点击图标；浏览器右侧应打开 Side Panel。

Edge 使用 `edge://extensions/`，其余步骤相同。

源代码改变后，重新执行 `pnpm build`，再回到扩展管理页点击扩展卡片上的“重新加载”。`pnpm dev` 的热更新不会自动更新已加载的 `dist/` 扩展。

### 3. 手动验证清单

- 在普通 HTTPS 网页点击扩展图标，确认侧边栏打开且显示当前页面标题。
- 选中一段文字后点击侧边栏刷新按钮，确认文字进入页面上下文。
- 右键选中文字，选择“用 FLAQ 创作选中的内容”，确认侧边栏打开并带入文字。
- 右键网页图片，选择“用 FLAQ 创作这张图片”，确认切换到图片编辑模型并填入图片 URL。
- 切换图片/视频、模型、画幅、清晰度和时长，确认可选项随模型联动。
- 未配置 Client Key 时点击生成，确认出现设置弹层且没有发出 API 请求。
- 配置测试用 Client Key 后提交一个低成本任务，确认状态从“已提交/生成中”变为“已完成”或显示明确错误，并确认记录在关闭、重开侧边栏后仍存在。

真实生成会调用 FLAQ API 并可能产生费用。不要使用生产密钥进行日常 UI 验证，也不要把 Client Key 写入源码、日志或截图。

### 4. 调试入口

- Side Panel：在面板内右键选择“检查”，查看 React 页面 Console 和 Network。
- Service Worker：在扩展管理页打开扩展详情，点击 `service worker` 的“检查视图”，调试安装、右键菜单和 Side Panel 唤起逻辑。
- 权限与存储：在 DevTools Application 面板检查 Extension Storage；确认网络请求仅发送到 `https://api.flaq.ai/*`。

## 发布前检查

```bash
pnpm typecheck
pnpm test
pnpm build
```

确认 `dist/manifest.json` 的版本号、权限和图标正确，扩展管理页无错误，并至少完成一次 Chrome 的真实 Side Panel 流程。UI 改动还应在约 350px 常用侧栏宽度和 300px 最小宽度下检查横向溢出。
