# Responsive layout

`needResizeObserver` and `responsiveFontSize` are enabled by default:

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

Font size follows the container's primary axis:

- `r2l` / `l2r` use the container width.
- `b2t` / `t2b` use the container height.

If the container starts with `display: none`, call `resize()` after showing it:

```ts
container.style.display = 'block'
danmu.resize()
```

No fullscreen-specific listener is required. `ResizeObserver` handles regular and fullscreen size changes.
