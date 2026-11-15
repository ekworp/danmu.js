# 配置项

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `container` | `HTMLElement` | — | 弹幕容器 |
| `comments` | `CommentData[]` | `[]` | 初始弹幕数据 |
| `direction` | `'r2l' \| 'l2r' \| 'b2t' \| 't2b'` | `'r2l'` | 弹幕移动方向 |
| `duration` | `number` | `9000` | 默认持续时间，单位毫秒 |
| `area` | `{ start, end, lines? }` | `{ start: 0, end: 1 }` | 弹幕显示区域 |
| `channelSize` | `number` | `20` | 虚拟轨道大小 |
| `needResizeObserver` | `boolean` | `true` | 自动响应容器变化 |
| `responsiveFontSize` | `boolean \| { min?, max? }` | `true` | 响应式字体 |
| `maxVisibleBullets` | `number` | `Infinity` | 同时存在的弹幕上限 |
| `dropStaleComments` | `boolean` | `true` | 丢弃过期弹幕 |
| `defaultOff` | `boolean` | `true` | 是否默认不启动 |
| `chaseEffect` | `boolean` | `true` | 开启滚动弹幕追逐效果 |
| `syncPlaybackRate` | `boolean` | `false` | 是否同步播放器倍速 |
| `mouseControl` | `boolean` | — | 开启鼠标控制 |

## 高密度场景

默认 `maxVisibleBullets` 为 `Infinity`。数据量较大时建议设置有限值：

```ts
maxVisibleBullets: 200
```
