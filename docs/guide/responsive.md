# 响应式布局

默认开启 `needResizeObserver` 和 `responsiveFontSize`：

```ts
const danmu = new DanmuJs({
  container,
  needResizeObserver: true,
  responsiveFontSize: {
    min: 12,
    max: 24
  }
})
```

字体会根据容器主方向尺寸缩放：

- `r2l` / `l2r` 使用容器宽度
- `b2t` / `t2b` 使用容器高度

如果容器初始化时处于 `display: none`，首次显示后调用 `resize()` 即可重新建立响应式基准：

```ts
container.style.display = 'block'
danmu.resize()
```

不需要额外监听 fullscreen 事件。`ResizeObserver` 会处理普通尺寸变化和全屏尺寸变化。
