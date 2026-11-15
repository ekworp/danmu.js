# Comment data

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

## Display modes

- `scroll`: horizontal scrolling comment
- `top`: centered top comment
- `bottom`: centered bottom comment

## Custom styles

```ts
{
  id: 'styled',
  start: 1000,
  duration: 9000,
  mode: 'scroll',
  txt: 'A styled comment',
  style: {
    color: '#ff9500',
    fontSize: '20px',
    padding: '2px 11px'
  }
}
```
