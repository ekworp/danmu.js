# Video.js Demo

这个示例演示 danmu.js 如何覆盖在 Video.js 播放器内部，并与原生视频时间同步。

<VideoJsDemo />

## 核心代码

```ts
import DanmuJs from '@ekworp/danmu.js'
import videojs from 'video.js'

const player = videojs('video', {
  controls: true,
  responsive: true,
  fluid: true
})

const danmu = new DanmuJs({
  container: document.querySelector('#danmu'),
  player: player.tech().el(),
  comments: [
    {
      id: 'welcome',
      start: 0,
      duration: 9000,
      txt: 'Video.js + danmu.js',
      mode: 'scroll'
    }
  ]
})
```

## 关键点

1. 将弹幕容器放入 `player.el()`，这样进入 Video.js 全屏时弹幕层也会保持在播放器内部。
2. 将原生 `HTMLVideoElement` 传给 `player`，danmu.js 会自动同步媒体事件。
3. 实时弹幕的 `start` 使用播放器当前时间乘以 `1000` 转换为毫秒。

当前文档 Demo 使用 CDN 加载 Video.js，生产项目也可以通过 npm 安装：

```bash
pnpm add video.js @ekworp/danmu.js
```
