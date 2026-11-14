import type { Bullet } from './bullet'
import Log from './utils/logger'

export type CommentMode = 'scroll' | 'top' | 'bottom'

export type StyleValue = string | number | undefined

export type StyleMap = Record<string, StyleValue>

export interface LikeData {
  el: HTMLElement
  style?: StyleMap
}

export interface CommentEventListener {
  event: string
  listener: EventListener
  useCapture?: boolean
}

export interface CommentData {
  id?: string
  start: number
  duration: number
  prior?: boolean
  score?: number
  txt?: string
  el?: HTMLElement | (() => HTMLElement)
  elLazyInit?: boolean
  mode: CommentMode
  realTime?: boolean
  color?: string
  bookChannelId?: [number, number]
  disableCopyDOM?: boolean
  noDiscard?: boolean
  moveV?: number
  style?: StyleMap
  eventListeners?: CommentEventListener[]
  like?: LikeData
  responsiveFontSize_?: number
}

export interface CommentRuntime {
  attached: boolean
  status: 'pending' | 'playing' | 'finished'
  element?: HTMLElement
  channel?: [number, number]
}

export interface GlobalHooks {
  bulletCreateEl?: (
    item: CommentData
  ) => HTMLElement | ({ el: HTMLElement } & GlobalHooks)
  bulletAttaching?: (item: CommentData) => void
  bulletAttached?: (item: CommentData) => void
  bulletDetaching?: (item: CommentData) => void
  bulletDetached?: (item: CommentData, element: HTMLElement) => void
}

export interface DanmuConfig {
  overlap: boolean
  area: {
    start: number
    end: number
    lines?: number
  }
  hooks?: GlobalHooks
  live: boolean
  comments: CommentData[]
  direction: 'r2l' | 'l2r' | 'b2t' | 't2b'
  needResizeObserver: boolean
  dropStaleComments: boolean
  channelSize?: number
  maxCommentsLength?: number
  maxVisibleBullets: number
  bulletOffset?: number
  interval: number
  highScorePriority: boolean
  chaseEffect: boolean
  responsiveFontSize: boolean | { min?: number; max?: number }
  syncPlaybackRate: boolean
  container?: HTMLElement
  containerStyle?: StyleMap
  player?: PlayerAdapter
  mouseControl?: boolean
  mouseControlPause?: boolean
  mouseEnterControl?: boolean
  defaultOff?: boolean
  disableCopyDOM?: boolean
  bOffset?: number
}

export type DanmuConfigOptions = Omit<
  Partial<DanmuConfig>,
  'area' | 'responsiveFontSize'
> & {
  area?: Partial<DanmuConfig['area']>
  responsiveFontSize?: DanmuConfig['responsiveFontSize']
}

export interface DanmuEventMap {
  ready: undefined
  error: string
  destroy: undefined
  bullet_remove: { bullet: Bullet }
  bullet_start: Bullet
  bullet_hover: { bullet: Bullet; event: MouseEvent }
  channel_resize: undefined
  changeDirection: DanmuConfig['direction']
}

export type DanmuEventName = keyof DanmuEventMap

export type DanmuEventHandler<T> = (data: T) => void

export interface PlayerAdapter {
  currentTime?: number | (() => number)
  playbackRate?: number | (() => number)
  paused?: boolean | (() => boolean)
  addEventListener?: (event: string, handler: EventListener) => void
  removeEventListener?: (event: string, handler: EventListener) => void
  on?: (event: string, handler: (...args: never[]) => void) => void
  off?: (event: string, handler: (...args: never[]) => void) => void
}

class BaseClass {
  // Temporary compatibility boundary for legacy runtime fields.
  [key: string]: any
  protected logger!: Log

  setLogger(logger: string | Log) {
    this.logger =
      logger instanceof Log ? logger : new Log((logger || '') + '.js')
  }
}

export default BaseClass
