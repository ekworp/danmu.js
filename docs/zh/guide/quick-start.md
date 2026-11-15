# 快速开始

## 安装

```bash
pnpm add @ekworp/danmu.js
# 或 npm install @ekworp/danmu.js
```

## 创建容器

弹幕容器需要有明确的尺寸：

```html
<div id="danmu" style="position: relative; height: 300px"></div>
```

## 初始化

```ts
import DanmuJs from '@ekworp/danmu.js'

const container = document.querySelector<HTMLElement>('#danmu')!

const danmu = new DanmuJs({
  container,
  comments: [
    {
      id: 'welcome',
      start: 0,
      duration: 9000,
      txt: '欢迎使用 danmu.js',
      mode: 'scroll'
    }
  ]
})

danmu.start()
```

默认情况下，`defaultOff` 为 `true`，需要主动调用 `start()`。如果传入原生 `video` 或 `audio`，弹幕会跟随播放器同步。

## 实时发送

```ts
danmu.sendComment({
  id: crypto.randomUUID(),
  start: 0,
  duration: 9000,
  realTime: true,
  txt: '这是一条实时弹幕',
  mode: 'scroll'
})
```

继续阅读：[播放器接入](/zh/guide/player)、[响应式布局](/zh/guide/responsive)。
