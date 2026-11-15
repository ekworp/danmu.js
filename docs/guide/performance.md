# 性能调优

danmu.js 默认适合常规弹幕场景。高密度数据下，可以从以下几方面控制浏览器负载。

## 限制可见弹幕数量

```ts
const danmu = new DanmuJs({
  container,
  comments,
  maxVisibleBullets: 200
})
```

`maxVisibleBullets` 越小，DOM 数量越稳定。实时弹幕和高峰流量场景建议设置有限值。

## 控制弹幕数据

- 使用 `dropStaleComments: true` 丢弃当前时间之前的过期数据。
- 批量数据使用 `updateComments()`，不要在循环中频繁销毁实例。
- 使用 `duration` 或 `moveV` 控制弹幕在屏幕上的停留时间。
- 对实时突发数据进行时间分散，避免同一调度周期同时创建大量节点。

## 播放器同步

只有需要跟随播放器时间时才传入 `player`。如果是纯实时弹幕，可以省略播放器适配器。

```ts
syncPlaybackRate: false
```

不需要跟随倍速时保持默认值，可以减少不必要的同步处理。

## 监控运行状态

```ts
danmu.on('bullet_start', (bullet) => {
  console.log('visible:', danmu.state.bullets.length, bullet.id)
})
```

建议在开发环境中监控 `danmu.state.bullets.length`，根据实际峰值调整 `maxVisibleBullets` 和弹幕持续时间。
