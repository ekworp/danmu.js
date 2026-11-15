---
layout: home
title: danmu.js
titleTemplate: HTML5 弹幕引擎
description: 面向现代浏览器的高性能 HTML5 弹幕引擎
hero:
  name: danmu.js
  text: 让每个 DOM 元素都能承载弹幕
  tagline: 面向现代浏览器的高性能弹幕引擎，支持响应式布局、原生媒体同步、TypeScript 和多种模块格式。
  actions:
    - theme: brand
      text: 打开 Playground
      link: '#playground'
    - theme: alt
      text: 快速开始
      link: /zh/guide/quick-start
  image:
    src: /hero.svg
    alt: danmu.js
features:
  - icon: ⚡
    title: 轻量高效
    details: 自适应调度和 DOM 回收，适合高密度弹幕场景。
  - icon: ◌
    title: 响应式布局
    details: 自动适配普通容器、隐藏容器和全屏尺寸变化。
  - icon: ◇
    title: TypeScript
    details: 提供完整类型声明，支持 ESM、CJS 和浏览器 ESM。
---

<div id="playground" class="playground-section">
  <div class="section-intro">
    <div>
      <p class="eyebrow">LIVE PLAYGROUND</p>
      <h2>马上试一下</h2>
    </div>
    <p>调整参数，观察弹幕在不同方向和尺寸下的表现。</p>
  </div>
  <Playground />
</div>

## 快速开始

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
