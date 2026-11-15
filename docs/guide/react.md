# React integration

danmu.js is framework agnostic. Initialize it in `useEffect` and destroy it when the component unmounts.

```tsx
import { useEffect, useRef } from 'react'
import DanmuJs, { type CommentData } from '@ekworp/danmu.js'

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

## Notes

- Give the container an explicit height.
- Do not create a new instance on every render.
- Use `updateComments()` for frequent data changes.
- Call `danmu.resize()` after showing a previously hidden container.
