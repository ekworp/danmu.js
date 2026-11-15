# 播放器接入

## 原生媒体元素

传入 `HTMLMediaElement` 后，danmu.js 会同步 `playing`、`pause`、`seeking`、`seeked`、`timeupdate` 和 `ratechange` 事件。

```ts
const video = document.querySelector<HTMLVideoElement>('#video')!

const danmu = new DanmuJs({
  container,
  player: video,
  comments
})
```

## 自定义播放器适配器

播放器只需要提供当前时间和事件监听能力：

```ts
const player = {
  currentTime: () => video.currentTime,
  playbackRate: () => video.playbackRate,
  on: (event, handler) => video.addEventListener(event, handler),
  off: (event, handler) => video.removeEventListener(event, handler)
}

const danmu = new DanmuJs({ container, player, comments })
```

需要跟随播放器倍速时，开启：

```ts
syncPlaybackRate: true
```
