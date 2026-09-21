# FLAQ AI Creator Browser Plugin

Chrome / Edge Manifest V3 侧边栏扩展。正式构建会把 FLAQ SaaS 静态导出并打进扩展；用户加载 `dist/` 后无需启动 Next.js、localhost 或单独部署网页。

## 架构

- `src/App.tsx`：根据浏览器语言加载扩展内部的 `site/<locale>/ai-media-creator/`。
- `web/flaq-saas/`：通过 Git Subtree 纳入的完整 SaaS 源码。
- `scripts/build-extension.mjs`：静态导出 SaaS、构建扩展并组装最终产物。
- `scripts/package-static-site.mjs`：复制站点资源，并把 Next.js 内联启动脚本转换为 Manifest V3 CSP 允许的本地文件。
- `dist/`：完整的可加载扩展，包含侧边栏外壳、15 种语言页面和静态资源；不提交 Git。

Client Key、历史记录和设置仍保存在浏览器本地。上传通过已配置的 FLAQ Client Key 请求短时上传地址，不会把 R2 密钥打进扩展。

## 安装依赖

要求 Node.js 20+、pnpm 10.5.2、Chrome 116+。

```bash
pnpm install
```

根项目会继续从 `web/flaq-saas/pnpm-lock.yaml` 安装隔离的 SaaS 依赖，不依赖仓库外部目录。

## 开发

需要热更新时运行：

```bash
pnpm dev
```

该模式会启动 SaaS（默认端口 3000）和 Vite 预览（5173）。可用 `FLAQ_SITE_PORT=3100 pnpm dev` 统一覆盖开发端口。它只服务于源码调试，不代表最终扩展仍依赖服务器。

也可分别运行 `pnpm dev:site`、`pnpm dev:extension`，或用 `pnpm smoke:site` 检查开发站点。

## 构建独立扩展

```bash
pnpm test
pnpm typecheck
pnpm build
```

`pnpm build` 等同于 `pnpm build:dev`，会静态生成全部语言页面、构建侧边栏、复制站点到 `dist/site/`，并外置 Next.js 内联脚本以满足扩展 CSP。

当前完整产物约 200 MB。构建完成后，即使停止 3000/5173 端口，`dist/` 仍可独立运行。

## Chrome 验证

1. 打开 `chrome://extensions/` 并启用“开发者模式”。
2. 点击“加载已解压的扩展程序”，选择本仓库的 `dist/`。
3. 固定 **FLAQ AI Creator**，点击图标打开 Side Panel。
4. 停止所有本地开发服务并重新打开侧栏，确认页面仍正常出现。
5. 检查语言切换、图片/视频模式、文件选择、设置窗口和本地历史。

源码变化后重新运行 `pnpm build`，再在扩展管理页点击“重新加载”。

扩展固定访问 `https://api.flaq.ai/*` 和 Cloudflare R2 上传地址。用户配置其他 API Origin 时，保存设置会请求对应的可选站点权限。权限变化应在 Pull Request 中明确说明。

## 可选的远程网页构建

只有需要测试传统远程 iframe 时才运行：

```bash
VITE_SIDEPANEL_SITE_URL=https://creator.example.com pnpm build:remote
```

默认发布流程应使用自包含的 `pnpm build`。

## 同步 SaaS 上游

```bash
pnpm sync:site
```

同步前保持工作树干净。静态导出所需的 `basePath`、语言参数、浏览器上传授权和 CSP 打包调整必须保留。

## 生成任务日志

Side Panel 控制台会输出 `[FLAQ generation]` 结构化日志。正常视频任务应依次出现 `submit.started`、`submit.accepted`、`history.pending-written`、`polling.started`、状态变化和终态事件。日志不记录提示词、媒体 URL、Client Key 或存储凭据；字段说明见 [`docs/generation-logging.md`](docs/generation-logging.md)。
