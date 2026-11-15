# Events

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

| Event | Payload | Description |
| --- | --- | --- |
| `ready` | — | Instance is ready |
| `error` | `string` | An error occurred |
| `destroy` | — | Instance was destroyed |
| `bullet_start` | `Bullet` | A comment started |
| `bullet_remove` | `{ bullet }` | A comment was removed |
| `bullet_hover` | `{ bullet, event }` | Pointer hovered a comment |
| `channel_resize` | — | Channels were recalculated |
| `changeDirection` | `direction` | Direction changed |
