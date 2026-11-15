---
layout: home
title: danmu.js
titleTemplate: HTML5 Danmaku Engine
description: A modern, high-performance HTML5 danmaku engine
hero:
  name: danmu.js
  text: Put danmaku on any DOM element
  tagline: A modern danmaku engine with responsive layout, media synchronization, TypeScript support, and multiple module formats.
  actions:
    - theme: brand
      text: Open Playground
      link: '#playground'
    - theme: alt
      text: Quick start
      link: /guide/quick-start
  image:
    src: /hero.svg
    alt: danmu.js
features:
  - icon: ⚡
    title: Fast and lightweight
    details: Adaptive scheduling and DOM recycling for dense danmaku streams.
  - icon: ◌
    title: Responsive layout
    details: Handles regular containers, hidden containers, and fullscreen resizing.
  - icon: ◇
    title: TypeScript ready
    details: Complete type declarations with ESM, CJS, and browser ESM builds.
---

<div id="playground" class="playground-section">
  <div class="section-intro">
    <div>
      <p class="eyebrow">LIVE PLAYGROUND</p>
      <h2>Try it now</h2>
    </div>
    <p>Adjust the configuration and see danmaku move in real time.</p>
  </div>
  <Playground />
</div>

## Quick start

```bash
pnpm add @ekworp/danmu.js
```

```ts
import DanmuJs from '@ekworp/danmu.js'

const danmu = new DanmuJs({
  container: document.querySelector('#danmu'),
  comments: [
    {
      id: 'hello',
      start: 0,
      duration: 9000,
      txt: 'Hello, danmu.js!',
      mode: 'scroll'
    }
  ],
  responsiveFontSize: { min: 12, max: 24 }
})

danmu.start()
```

<div class="home-links">
  <a href="/danmu.js/guide/quick-start">Read the quick start →</a>
  <a href="/danmu.js/api/options">Browse configuration →</a>
</div>
