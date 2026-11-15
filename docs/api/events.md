# 事件

```ts
danmu.on('ready', () => {
  console.log('danmu.js ready')
})

danmu.on('bullet_start', (bullet) => {
  console.log('bullet started', bullet)
})

danmu.on('bullet_hover', ({ bullet, event }) => {
  console.log('hover', bullet, event)
})

danmu.on('changeDirection', (direction) => {
  console.log('direction:', direction)
})
```

可用事件：

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `ready` | — | 实例准备完成 |
| `error` | `string` | 发生错误 |
| `destroy` | — | 实例销毁 |
| `bullet_start` | `Bullet` | 弹幕开始显示 |
| `bullet_remove` | `{ bullet }` | 弹幕移除 |
| `bullet_hover` | `{ bullet, event }` | 鼠标悬浮 |
| `channel_resize` | — | 频道重新布局 |
| `changeDirection` | `direction` | 方向发生变化 |
