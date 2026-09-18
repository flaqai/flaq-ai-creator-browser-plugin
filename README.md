# FLAQ AI Creator Browser Plugin

Chrome / Edge Manifest V3 侧边栏扩展。插件本身是一个轻量网页容器，直接在浏览器 Side Panel 中加载完整的 FLAQ SaaS 移动端页面，而不是在扩展内复制生成器逻辑。

## 功能

- 点击扩展图标打开浏览器原生 Side Panel
- 完整展示 AI Creator 的导航、生成器、历史记录、公开说明、示例图片和页脚
- 根据浏览器界面语言进入对应网站路由
- 提供 15 种 Manifest 本地化名称、描述和加载/错误提示
- 同域页面继续在侧栏内导航；网站已有的外部链接在新标签页打开
- 仅申请 `sidePanel` 权限，不读取当前标签页或保存 FLAQ Client Key

Client Key、任务轮询、历史记录、上传和语言切换均由嵌入的 FLAQ SaaS 网站负责。

## 项目结构

- `src/App.tsx`：无凭据连通性探测、全屏 iframe、加载/错误态和重试入口
- `src/config.ts`：浏览器语言映射与 AI Creator URL 构建
- `public/manifest.json`：最小 Manifest V3 权限和 Side Panel 配置
- `public/_locales/`：15 种扩展本地化文案
- `public/background.js`：点击工具栏图标打开 Side Panel
- `vite.config.ts`：注入站点地址并为目标 Origin 生成 iframe CSP
- `web/flaq-saas/`：通过 Git Subtree 导入的完整 SaaS 源码
- `scripts/dev.mjs`：从仓库根目录同时管理 SaaS 和插件开发进程

## 本地开发

环境要求：Node.js 20+、pnpm 10.5.2、Chrome 116+ 或新版 Edge。

### 1. 安装整个工作区

```bash
pnpm install
```

根项目的 `postinstall` 会继续使用 `web/flaq-saas/pnpm-lock.yaml` 安装 SaaS 依赖。两套依赖和锁文件保持隔离，不再依赖仓库外部的 `/Users/6677h/StudioProjects/flaq-saas`。

### 2. 一键启动完整开发环境

在仓库根目录运行：

```bash
pnpm dev
```

该命令固定启动：

- SaaS：<http://localhost:3000/ai-media-creator/>
- 插件预览：<http://127.0.0.1:5173/sidepanel.html>

按 `Ctrl+C` 会同时停止两个进程。也可以分别运行 `pnpm dev:site` 或 `pnpm dev:extension`。

SaaS 启动烟测：

```bash
pnpm smoke:site
```

该命令会检查文件监听器没有进入错误循环，并要求 `/ai-media-creator/` 返回 HTTP 200。嵌套开发环境使用轮询监听，并在 `web/flaq-saas/next.config.mjs` 中明确限定 Turbopack 根目录；同步上游时应保留这两项集成配置。

## 同步 SaaS 上游

`web/flaq-saas/` 是完整源码，不是 Submodule。普通 clone 和 GitHub 下载 ZIP 都会包含它。更新上游版本时运行：

```bash
pnpm sync:site
```

该命令会生成一次 subtree 合并提交；执行前应保持工作树干净。SaaS 产品功能应优先提交到 `flaq-saas-template`，再同步到本仓库，避免产生两个独立版本。

## 真实扩展验证

### 1. 构建本地扩展

```bash
pnpm typecheck
pnpm test
pnpm build:dev
```

`dist/manifest.json` 的 `frame-src` 应只包含 `http://localhost:3000`。

### 2. 加载未打包扩展

1. 打开 Chrome 的 `chrome://extensions/`，或 Edge 的 `edge://extensions/`。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择本仓库的 `dist/`。
4. 固定 **FLAQ AI Creator**，点击图标打开右侧 Side Panel。

源码改变后重新执行 `pnpm build:dev`，再在扩展管理页点击“重新加载”。Vite 的热更新不会更新浏览器已加载的 `dist/`。

### 3. 验证清单

- 侧栏中只显示参考网站，不出现额外的插件标题栏或重复生成表单。
- 约 300–600px 宽度下，顶部移动导航、生成器和页面下方内容完整可滚动且无横向溢出。
- 图片/视频类型、模型、上传、设置、历史和语言切换与移动网页一致。
- 浏览器语言为英文、简体中文、繁体中文、日语或阿拉伯语时进入对应路由；未知语言回退英文。
- `chrome://extensions/` 中只显示 `sidePanel` 权限。
- 停止端口 3000 的网站后，约 12 秒出现重试和“在新标签页打开”入口。
- Side Panel Console 与扩展 Service Worker Console 无错误。

真实生成由参考网站调用 FLAQ API，可能产生费用；普通布局验证无需提交生成任务。

## 生产构建

生产构建必须显式指定公开站点 Origin：

```bash
VITE_SIDEPANEL_SITE_URL=https://creator.example.com pnpm build:production
```

也可将该变量写入本地且不提交的 `.env.production.local`。缺少变量时生产构建会直接失败，防止发布指向 localhost 的扩展。

生产站点必须允许扩展 iframe 嵌入：不要返回 `X-Frame-Options: DENY/SAMEORIGIN`，并确保 CSP `frame-ancestors` 包含正式扩展 Origin。发布前检查生成的 `dist/manifest.json`，确认 `frame-src` 仅包含配置的站点 Origin。

## 发布前检查

```bash
pnpm typecheck
pnpm test
VITE_SIDEPANEL_SITE_URL=https://creator.example.com pnpm build:production
```

确认 Manifest 版本、15 个 `_locales` 目录、图标和权限正确，并至少完成一次 Chrome 的真实 Side Panel 全页面流程。
