# 实例方法

## 播放控制

```ts
danmu.start()
danmu.pause()
danmu.play()
danmu.stop()
danmu.destroy()
```

## 数据更新

```ts
danmu.sendComment(comment)
danmu.updateComments(comments, isClear = true)
danmu.setCommentID(oldID, newID)
```

## 显示和布局

```ts
danmu.hide('scroll')
danmu.show('scroll')
danmu.setArea({ start: 0.1, end: 0.9 })
danmu.setFontSize(18, 22)
danmu.setOpacity(0.8)
danmu.setDirection('b2t')
danmu.resize()
```

`resize()` 会重新计算频道和响应式字体，适合在容器从隐藏状态变为可见后调用。
