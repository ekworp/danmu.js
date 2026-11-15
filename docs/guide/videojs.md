# Video.js Demo

This example places danmu.js inside a Video.js player and synchronizes comments with the native video timeline.

<VideoJsDemo />

## Core integration

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

## Important details

1. Put the danmaku container inside `player.el()` so it stays inside the player in fullscreen mode.
2. Pass the native `HTMLVideoElement` to `player` so danmu.js can synchronize media events.
3. Convert the player's current time to milliseconds when sending live comments.

See the [full demo component source](/guide/videojs#demo-component-source).
