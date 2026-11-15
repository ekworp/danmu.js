# 更新日志

## 1.4.0 · 2026-11-15

### 新增

- 新增基于 VitePress 的文档站和 GitHub Pages 自动部署。
- 新增英文和简体中文文档路由，并根据浏览器语言自动选择。
- 新增支持实时配置的交互式 Playground。
- 新增完整的 Video.js Demo，支持媒体同步和完整控制面板。
- 新增 React 接入、响应式布局、性能调优和 Video.js 指南。
- 新增自动生成的公开 TypeScript 类型文档。
- 新增本地搜索、GitHub 编辑入口、更新时间、SEO 元数据和 Sitemap。

### 变更

- 默认文档语言调整为英文，并为中文页面提供独立导航。
- Playground 改为懒加载，减少文档首页初始资源体积。
- 优化 Video.js Demo 的移动端控制和运行状态指标。
- 将更新日志整合到 VitePress 文档站。
- 默认弹幕 `duration` 从 `5000ms` 调整为 `9000ms`。
- 停止发布 JavaScript 和 TypeScript 声明 source map，减少 npm 包体积。
- 使用 VitePress 文档站和内嵌 Demo 替换旧的 `demo/` 页面。

### CI

- 文档相关 Workflow 统一使用 Node.js 24。
- 移除不同 Workflow 之间重复的源码检查和文档构建。
- 将文档构建加入 CI，并使用 Artifact 部署 GitHub Pages。
- 发布 npm 前增加 package 版本和 Release Tag 校验。
- 新增基于版本 Tag 自动创建 GitHub Release。

### 修复

- 修复弹幕容器初始为 `display: none`、之后显示时响应式字体不再生效的问题，
  兼容 xgplayer 隐藏弹幕容器。
- 修复 `resize()` 或 `ResizeObserver` 首次获取非零尺寸时无法重新建立响应式基准的问题。
- 修复横向弹幕使用容器宽度、竖向弹幕使用容器高度进行响应式计算的问题。
- 保留 `responsiveFontSize.min` 和 `responsiveFontSize.max` 限制。
- 修复通过 `sendComment()` 和 `updateComments()` 新增弹幕无法继承当前响应式字体配置的问题。
- 修复对象配置覆盖布尔默认值的问题，使
  `responsiveFontSize: { min, max }` 正常生效。
- 新增隐藏容器、全屏尺寸变化、方向切换、字体限制和动态弹幕回归测试。
- 修复 Video.js Demo 视频源加载、播放器控件点击区域和全屏弹幕层问题。

## 1.3.0 · 2026-11-14

### 新增

- 将源码迁移到 TypeScript，并加强公开类型定义。
- 新增 ESM、CommonJS 和独立浏览器 ESM 构建产物。
- 新增原生媒体和 Video.js 播放器适配器。
- 新增 `playing`、`pause`、`seeking`、`seeked`、`timeupdate` 和 `ratechange` 同步。
- 新增可选的 `syncPlaybackRate` 播放倍速同步。
- 新增 `dropStaleComments` 过期弹幕处理。
- 新增响应式字体和频道大小。
- 新增自适应弹幕调度、按时间窗口比例采样和屏幕外弹幕清理。
- 新增浏览器集成测试、媒体适配器测试和浏览器性能基准测试。
- 新增包含随机弹幕、播放控制和全屏测试的 Video.js Demo。
- 新增 `@ekworp/danmu.js` scoped npm 包配置。
- 新增 GitHub Actions CI 和 npm 发布 Workflow。

### 变更

- 将构建工具从 Rslib 切换为 tsdown。
- `defaultOff` 默认值改为 `true`。
- 默认启用 `needResizeObserver`、`responsiveFontSize` 和频道大小。
- 默认弹幕样式调整为 16px 黑色文字、白色描边和阴影。
- `maxVisibleBullets` 默认值改为 `Infinity`。
- 改进 seek 重置、媒体时间调度、频道重排和弹幕位置保持。
- 使用 Video.js Demo 替换旧的默认 Demo 页面。

### 移除

- 移除 `maxBulletsPerTick`，改用基于轨道、弹幕时长和可见容量的自适应调度。
