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
  attached_?: boolean
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
  bulletOffset?: number
  interval: number
  highScorePriority: boolean
  chaseEffect: boolean
  responsiveFontSize: boolean | { min?: number; max?: number }
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

export type DanmuConfigOptions = Partial<DanmuConfig>

export interface PlayerAdapter {
  currentTime?: number
  addEventListener?: (event: string, handler: EventListener) => void
  removeEventListener?: (event: string, handler: EventListener) => void
}

/* Internal classes deliberately expose dynamic state while they are being
 * migrated away from the legacy JavaScript implementation. */
export interface RuntimeConfig extends DanmuConfig {
  player?: {
    currentTime?: number
    addEventListener?: (event: string, handler: EventListener) => void
    removeEventListener?: (event: string, handler: EventListener) => void
  }
}

class BaseClass {
  [key: string]: any
  logger!: Log

  setLogger(logger: string | Log) {
    this.logger =
      logger instanceof Log ? logger : new Log((logger || '') + '.js')
  }
}

export default BaseClass
