# Quick start

## Install

```bash
pnpm add @ekworp/danmu.js
# or npm install @ekworp/danmu.js
```

## Create a container

The danmaku container needs an explicit size:

```html
<div id="danmu" style="position: relative; height: 300px"></div>
```

## Initialize

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
      txt: 'Welcome to danmu.js',
      mode: 'scroll'
    }
  ]
})

danmu.start()
```

`defaultOff` is `true` by default, so call `start()` explicitly. When a native `video` or `audio` element is provided, danmu.js follows the media timeline.

## Send live comments

```ts
danmu.sendComment({
  id: crypto.randomUUID(),
  start: 0,
  duration: 9000,
  realTime: true,
  txt: 'A live comment',
  mode: 'scroll'
})
```

Continue with [player integration](/guide/player) or [responsive layout](/guide/responsive).
