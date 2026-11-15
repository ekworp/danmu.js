# Performance

danmu.js works well for regular streams by default. For dense data, use the following controls.

## Limit visible comments

```ts
const danmu = new DanmuJs({
  container,
  comments,
  maxVisibleBullets: 200
})
```

Use a finite `maxVisibleBullets` value to keep DOM growth predictable.

## Control comment data

- Keep `dropStaleComments: true` to discard comments behind the current time.
- Use `updateComments()` for batches instead of recreating the instance.
- Spread burst traffic across time instead of creating many nodes in one tick.
- Use `duration` or `moveV` to control how long comments remain visible.

## Player synchronization

Only pass a `player` when timeline synchronization is required. Keep `syncPlaybackRate: false` unless playback-rate synchronization is needed.

## Monitor runtime state

```ts
danmu.on('bullet_start', (bullet) => {
  console.log('visible:', danmu.state.bullets.length, bullet.id)
})
```
