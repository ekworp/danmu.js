# React 接入

danmu.js 不依赖框架，可以在 React `useEffect` 中初始化，并在组件卸载时销毁。

```tsx
import { useEffect, useRef } from 'react'
import DanmuJs from '@ekworp/danmu.js'
import type { CommentData } from '@ekworp/danmu.js'

export function DanmuLayer({ comments }: { comments: CommentData[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const danmu = new DanmuJs({
      container: containerRef.current,
      comments,
      needResizeObserver: true,
      responsiveFontSize: { min: 12, max: 24 }
    })

    danmu.start()
    return () => danmu.destroy()
  }, [comments])

  return <div ref={containerRef} style={{ position: 'relative', height: 300 }} />
}
```

## 注意事项

- 容器必须有明确高度，建议使用 `position: relative`。
- 不要在每次渲染时重复创建实例。
- `comments` 频繁变化时，可以使用 `updateComments()`，避免销毁并重建。
- 如果容器处于 `display: none`，显示后调用 `danmu.resize()`。
