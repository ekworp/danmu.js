# Player integration

## Native media elements

Pass an `HTMLMediaElement` to synchronize `playing`, `pause`, `seeking`, `seeked`, `timeupdate`, and `ratechange` events.

```ts
const video = document.querySelector<HTMLVideoElement>('#video')!

const danmu = new DanmuJs({
  container,
  player: video,
  comments
})
```

## Custom player adapters

An adapter only needs the current time and event methods:

```ts
const player = {
  currentTime: () => video.currentTime,
  playbackRate: () => video.playbackRate,
  on: (event, handler) => video.addEventListener(event, handler),
  off: (event, handler) => video.removeEventListener(event, handler)
}

const danmu = new DanmuJs({ container, player, comments })
```

Enable playback-rate synchronization when needed:

```ts
syncPlaybackRate: true
```
