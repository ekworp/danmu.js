# Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `HTMLElement` | — | Danmaku container |
| `comments` | `CommentData[]` | `[]` | Initial comments |
| `direction` | `'r2l' \| 'l2r' \| 'b2t' \| 't2b'` | `'r2l'` | Movement direction |
| `duration` | `number` | `9000` | Default duration in milliseconds |
| `area` | `{ start, end, lines? }` | `{ start: 0, end: 1 }` | Visible area |
| `channelSize` | `number` | `20` | Virtual channel size |
| `needResizeObserver` | `boolean` | `true` | Observe container changes |
| `responsiveFontSize` | `boolean \| { min?, max? }` | `true` | Responsive font sizing |
| `maxVisibleBullets` | `number` | `Infinity` | Maximum visible comments |
| `dropStaleComments` | `boolean` | `true` | Drop stale comments |
| `defaultOff` | `boolean` | `true` | Start disabled |
| `chaseEffect` | `boolean` | `true` | Enable chase effect |
| `syncPlaybackRate` | `boolean` | `false` | Follow player playback rate |
| `mouseControl` | `boolean` | — | Enable mouse controls |

For dense streams, set a finite `maxVisibleBullets` value such as `200`.
