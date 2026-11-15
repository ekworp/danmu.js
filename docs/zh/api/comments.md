# 弹幕数据

```ts
interface CommentData {
  id?: string
  start: number
  duration: number
  txt?: string
  mode: 'scroll' | 'top' | 'bottom'
  color?: string
  prior?: boolean
  realTime?: boolean
  moveV?: number
  style?: Record<string, string | number | undefined>
}
```

## 显示模式

- `scroll`：横向滚动弹幕
- `top`：顶部居中弹幕
- `bottom`：底部居中弹幕

## 自定义样式

```ts
{
  id: 'styled',
  start: 1000,
  duration: 9000,
  mode: 'scroll',
  txt: '彩色弹幕',
  style: {
    color: '#ff9500',
    fontSize: '20px',
    padding: '2px 11px'
  }
}
```
