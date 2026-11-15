# Instance methods

## Playback

```ts
danmu.start()
danmu.pause()
danmu.play()
danmu.stop()
danmu.destroy()
```

## Data updates

```ts
danmu.sendComment(comment)
danmu.updateComments(comments, isClear = true)
danmu.setCommentID(oldID, newID)
```

## Display and layout

```ts
danmu.hide('scroll')
danmu.show('scroll')
danmu.setArea({ start: 0.1, end: 0.9 })
danmu.setFontSize(18, 22)
danmu.setOpacity(0.8)
danmu.setDirection('b2t')
danmu.resize()
```

`resize()` recalculates channels and responsive fonts. Call it after showing a hidden container.
