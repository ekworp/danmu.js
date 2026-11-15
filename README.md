# danmu.js

现代化 HTML5 弹幕引擎，支持任意 DOM 容器、原生媒体、Video.js、响应式布局和 TypeScript。

## 文档

- [English documentation](https://ekworp.github.io/danmu.js/)
- [中文文档](https://ekworp.github.io/danmu.js/zh/)
- [Video.js Demo](https://ekworp.github.io/danmu.js/guide/videojs)
- [更新日志](https://ekworp.github.io/danmu.js/changelog)

## 安装

```bash
pnpm add @ekworp/danmu.js
# 或 npm install @ekworp/danmu.js
```

## 快速开始

```html
<div id="danmu" style="position: relative; height: 300px"></div>
```

```ts
import DanmuJs from '@ekworp/danmu.js'

const danmu = new DanmuJs({
  container: document.querySelector('#danmu'),
  comments: [
    {
      id: 'welcome',
      start: 0,
      duration: 9000,
      txt: 'Hello, danmu.js!',
      mode: 'scroll'
    }
  ],
  responsiveFontSize: {
    min: 12,
    max: 24
  }
})

danmu.start()
```

发送实时弹幕：

```ts
danmu.sendComment({
  id: crypto.randomUUID(),
  start: 0,
  duration: 9000,
  realTime: true,
  txt: '实时弹幕',
  mode: 'scroll'
})
```

## 主要特性

- ESM、CommonJS 和浏览器 ESM
- 完整 TypeScript 类型声明
- 原生 `HTMLMediaElement` 和播放器适配器同步
- `r2l`、`l2r`、`b2t`、`t2b` 四种方向
- 响应式字体和轨道大小
- 隐藏容器、全屏和 ResizeObserver 支持
- 自适应调度和可见弹幕数量限制
- 动态追加、批量更新、暂停、隐藏和样式控制

默认配置包括：

```ts
{
  duration: 9000,
  defaultOff: true,
  needResizeObserver: true,
  responsiveFontSize: true,
  maxVisibleBullets: Infinity
}
```

## 开发

```bash
git clone https://github.com/ekworp/danmu.js.git
cd danmu.js
pnpm install
pnpm run check
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run docs:dev
```

## License

[MIT](./LICENSE)
