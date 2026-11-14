import Log from './utils/logger'

export type CommentMode = 'scroll' | 'top' | 'bottom'

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
  moveV?: number
  style?: Record<string, string | number>
  eventListeners?: Array<[string, EventListener]>
  like?: {
    el: HTMLElement
    style?: Record<string, string | number>
  }
  [key: string]: any
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
  containerStyle?: Record<string, string>
  player?: {
    currentTime?: number
    addEventListener?: (event: string, handler: EventListener) => void
    removeEventListener?: (event: string, handler: EventListener) => void
  }
  [key: string]: any
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
