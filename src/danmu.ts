import type {
  CommentData,
  CommentMode,
  DanmuConfig,
  DanmuConfigOptions,
  DanmuEventHandler,
  DanmuEventMap,
  DanmuEventName,
  GlobalHooks
} from './baseClass'
import BaseClass from './baseClass'
import type Bullet from './bullet'
import Control from './control'
import RecyclableDomList from './domRecycle'
import {
  addPlayerListener,
  getPlayerPlaybackRate,
  removePlayerListener
} from './player'
import { addObserver, unObserver } from './resizeObserver'
import { addClass, deepCopy, isNumber, styleUtil } from './utils/util'

const VERSION = typeof __VERSION__ === 'string' ? __VERSION__ : 'development'

/**
 * @typedef {import('./baseClass').CommentData} CommentData
 */
/**
 * @typedef {import('./baseClass').GlobalHooks} GlobalHooks
 */

export class DanmuJs extends BaseClass {
  private readonly listeners = new Map<
    DanmuEventName,
    Set<DanmuEventHandler<unknown>>
  >()

  on<K extends DanmuEventName>(
    event: K,
    handler: DanmuEventHandler<DanmuEventMap[K]>
  ): this {
    let handlers = this.listeners.get(event)
    if (!handlers) {
      handlers = new Set()
      this.listeners.set(event, handlers)
    }
    handlers.add(handler as DanmuEventHandler<unknown>)
    return this
  }

  once<K extends DanmuEventName>(
    event: K,
    handler: DanmuEventHandler<DanmuEventMap[K]>
  ): this {
    const wrapped = ((data: unknown) => {
      this.off(event, wrapped as DanmuEventHandler<DanmuEventMap[K]>)
      handler(data as DanmuEventMap[K])
    }) as DanmuEventHandler<DanmuEventMap[K]>
    return this.on(event, wrapped)
  }

  off<K extends DanmuEventName>(
    event: K,
    handler: DanmuEventHandler<DanmuEventMap[K]>
  ): this {
    this.listeners.get(event)?.delete(handler as DanmuEventHandler<unknown>)
    return this
  }

  emit<K extends DanmuEventName>(
    event: K,
    ...args: DanmuEventMap[K] extends undefined ? [] : [data: DanmuEventMap[K]]
  ): boolean {
    const handlers = this.listeners.get(event)
    if (!handlers) return false
    for (const handler of [...handlers]) {
      handler(args[0] as unknown)
    }
    return handlers.size > 0
  }

  constructor(options: DanmuConfigOptions = {}) {
    super()

    // logger
    this.setLogger('danmu')
    this.logger && this.logger.info(`danmu.js version: ${VERSION}`)

    // configure
    const config: DanmuConfig = (this.config = {
      overlap: false,
      area: {
        start: 0,
        end: 1,
        lines: undefined
      },
      hooks: undefined,
      live: false,
      comments: [],
      direction: 'r2l' as const,
      needResizeObserver: false,
      dropStaleComments: true,
      channelSize: undefined,
      maxCommentsLength: undefined,
      maxBulletsPerTick: 8,
      maxVisibleBullets: 200,
      bulletOffset: undefined,
      interval: 2000,
      highScorePriority: true, // 高积分优先展示
      chaseEffect: true, // 滚动弹幕追逐效果
      responsiveFontSize: false, // 根据容器主方向尺寸连续缩放普通弹幕字体
      syncPlaybackRate: false,
      defaultOff: true
    })
    deepCopy(config, options)

    /**
     * @type {GlobalHooks}
     */
    this.globalHooks = {}
    if (config.hooks) {
      this.hooks(config.hooks)
    }

    this.hideArr = []
    this.recycler = new RecyclableDomList()

    // freezed comment
    this.freezeId = null

    config.comments.forEach((comment: CommentData) => {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.mode) {
        comment.mode = 'scroll'
      }
    })

    /**
     * @type {HTMLElement}
     */
    this.container =
      config.container && config.container.nodeType === 1
        ? config.container
        : null
    if (!this.container) {
      this.emit('error', "container id can't be empty")
      return
    }
    if (config.containerStyle) {
      const style = config.containerStyle
      Object.keys(style).forEach((key) => {
        styleUtil(this.container, key, style[key])
      })
    }
    addClass(this.container, 'danmu')
    this.live = config.live
    this.player = config.player
    this._playerWaiting = false
    this._playerEvents = []
    this._bindPlayerEvents()
    this.direction = config.direction
    this._responsiveFontSizeBase = this._getResponsiveSize()
    const containerFontSize =
      typeof getComputedStyle === 'function'
        ? Number.parseFloat(getComputedStyle(this.container).fontSize)
        : 16
    this._responsiveChannelSizeBase =
      config.channelSize ||
      Math.max(
        12,
        (Number.isFinite(containerFontSize) ? containerFontSize : 16) + 4
      )
    this.bulletBtn = new Control(this)
    this.main = this.bulletBtn.main
    this.isReady = true
    this.emit('ready')
    this.logger && this.logger.info('ready')
    this.addResizeObserver()
  }

  get status() {
    return this.main.status
  }

  get state() {
    const main = this.main
    return {
      status: main.status,
      comments: main.data,
      bullets: main.queue,
      displayArea: main.channel.getRealOccupyArea()
    }
  }

  get containerPos() {
    return this.main.channel.containerPos
  }

  /**
   * @param {GlobalHooks} options
   */
  hooks(options: GlobalHooks) {
    deepCopy(this.globalHooks, options)
  }

  addResizeObserver() {
    if (this.config.needResizeObserver && this.container) {
      addObserver(this.container, () => {
        this.logger && this.logger.info('needResizeObserver')
        this.resize()
      })
    }
  }

  _getResponsiveSize() {
    if (!this.container) return 0

    const rect = this.container.getBoundingClientRect()
    return this.direction === 'b2t' ? rect.height : rect.width
  }

  _getResponsiveFontSize(item: CommentData, el?: HTMLElement) {
    if (item.responsiveFontSize_) {
      return item.responsiveFontSize_
    }

    let fontSize = item.style && item.style.fontSize
    if (!fontSize && el && typeof getComputedStyle === 'function') {
      fontSize = getComputedStyle(el).fontSize
    }
    if (!fontSize && this.container && typeof getComputedStyle === 'function') {
      fontSize = getComputedStyle(this.container).fontSize
    }
    const size = parseFloat(String(fontSize))
    if (Number.isFinite(size) && size > 0) {
      item.responsiveFontSize_ = size
      return size
    }
    return 0
  }

  _resizeResponsiveFontSize() {
    const { responsiveFontSize } = this.config
    if (!responsiveFontSize || !this._responsiveFontSizeBase) return

    const currentSize = this._getResponsiveSize()
    if (!currentSize) return
    if (!this._responsiveFontSizeBase) {
      this._responsiveFontSizeBase = currentSize
      return
    }

    const options =
      typeof responsiveFontSize === 'object' ? responsiveFontSize : {}
    const min = Number.isFinite(options.min) ? options.min : 0
    const max = Number.isFinite(options.max) ? options.max : Infinity
    const scale = currentSize / this._responsiveFontSizeBase
    const baseFontSize =
      typeof getComputedStyle === 'function'
        ? Number.parseFloat(getComputedStyle(this.container).fontSize)
        : 16
    const responsiveBaseFontSize = Number.isFinite(baseFontSize)
      ? baseFontSize
      : 16
    const scaledBaseFontSize = Math.min(
      max,
      Math.max(min, responsiveBaseFontSize * scale)
    )
    const channelSize = Math.max(
      12,
      Math.round(
        this._responsiveChannelSizeBase *
          (scaledBaseFontSize / responsiveBaseFontSize)
      )
    )
    this.config.channelSize = channelSize

    const resizeItem = (item: CommentData, el?: HTMLElement) => {
      if (item.mode === 'top' || item.mode === 'bottom') return

      const base = this._getResponsiveFontSize(item, el)
      if (!base) return

      const size = Math.min(max, Math.max(min, base * scale))
      const fontSize = `${size}px`
      if (!item.style) item.style = {}
      item.style.fontSize = fontSize
      if (el) el.style.fontSize = fontSize
    }

    this.main.data.forEach((item: CommentData) => resizeItem(item))
    this.main.queue.forEach((item: Bullet) => resizeItem(item.options, item.el))
  }

  _bindPlayerEvents() {
    const { player } = this

    if (!player) {
      return
    }

    const onWaiting = () => {
      if (this.status === 'playing') {
        this.pause()
        this._playerWaiting = true
      }
    }
    const onPlaying = () => {
      if (this._playerWaiting) {
        this._playerWaiting = false
        this.play()
      } else if (this.config.defaultOff && this.status === 'idle') {
        this.start()
      }
    }
    const onPause = () => {
      if (this.status === 'playing') {
        this.pause()
        this._playerWaiting = true
      }
    }
    const onSeeking = () => {
      if (this.main) {
        this.main.syncToTime()
      }
    }
    const onRateChange = () => {
      if (!this.main || !this.config.syncPlaybackRate) return
      this.setPlayRate('scroll', getPlayerPlaybackRate(player))
    }

    this._playerEvents = [
      ['waiting', onWaiting],
      ['playing', onPlaying],
      ['pause', onPause],
      ['seeking', onSeeking],
      ['seeked', onSeeking],
      ['ratechange', onRateChange]
    ]
    this._playerEvents.forEach(([event, handler]: [string, EventListener]) => {
      addPlayerListener(player, event, handler)
    })
  }

  _unbindPlayerEvents() {
    if (!this.player) {
      return
    }

    this._playerEvents.forEach(([event, handler]: [string, EventListener]) => {
      removePlayerListener(this.player, event, handler)
    })
    this._playerEvents = []
  }

  start() {
    this.logger && this.logger.info('start')
    this.main && this.main.start()
  }

  pause() {
    this.logger && this.logger.info('pause')
    this._playerWaiting = false
    this.main && this.main.pause()
  }

  play() {
    this.logger && this.logger.info('play')
    this.main && this.main.play()
  }

  stop() {
    this.logger && this.logger.info('stop')
    this.main && this.main.stop()
  }

  clear() {
    this.logger && this.logger.info('clear')
    this.main && this.main.clear()
  }

  destroy() {
    unObserver(this.container)
    this.logger && this.logger.info('destroy')
    this._unbindPlayerEvents()
    this.stop()
    this.bulletBtn && this.bulletBtn.destroy()
    this.recycler && this.recycler.destroy()
    this.emit('destroy')
    this.listeners.clear()
    for (const k in this) {
      Reflect.deleteProperty(this, k)
    }
  }

  /**
   * @param {CommentData} comment
   */
  sendComment(comment: CommentData) {
    const { main, logger } = this
    logger && logger.info(`sendComment: ${comment.txt || '[DOM Element]'}`)

    if (!main) return

    // Set a default bullet show time
    if (!comment.duration) {
      comment.duration = 15000
    }

    if (
      comment &&
      comment.id &&
      comment.duration &&
      (comment.el || comment.elLazyInit || comment.txt)
    ) {
      comment.duration = comment.duration ? comment.duration : 5000
      if (!comment.style) {
        comment.style = {
          opacity: undefined,
          fontSize: undefined
        }
      }
      if (comment.style) {
        if (this.opacity && this.opacity !== comment.style.opacity) {
          comment.style.opacity = this.opacity
        }
        if (this.fontSize && this.fontSize !== comment.style.fontSize) {
          comment.style.fontSize = this.fontSize
        }
      }
      if (comment.prior || comment.realTime) {
        main.insertComment(comment, true)
        if (comment.realTime) {
          main.readData()
          main.dataHandle()
        }
      } else {
        main.insertComment(comment)
      }

      main.keepPoolWatermark()
    }
  }

  setCommentID(oldID: string, newID: string) {
    this.logger &&
      this.logger.info(`setCommentID: oldID ${oldID} newID ${newID}`)
    if (oldID && newID) {
      this.main.data.some((data: CommentData) => {
        if (data.id === oldID) {
          data.id = newID
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item: Bullet) => {
        if (item.id === oldID) {
          item.id = newID
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentDuration(id: string, duration: number) {
    this.logger &&
      this.logger.info(`setCommentDuration: id ${id} duration ${duration}`)

    if (id && duration) {
      duration = duration ? duration : 5000
      this.main.data.some((data: CommentData) => {
        if (data.id === id) {
          data.duration = duration
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item: Bullet) => {
        if (item.id === id) {
          item.duration = duration
          item.pauseMove()
          this.main.status !== 'paused' && item.startMove()
          return true
        } else {
          return false
        }
      })
    }
  }

  setCommentLike(id: string, like: NonNullable<CommentData['like']>) {
    this.logger && this.logger.info(`setCommentLike: id ${id} like ${like}`)
    if (id && like) {
      this.main.data.some((data: CommentData) => {
        if (data.id === id) {
          data.like = like
          return true
        } else {
          return false
        }
      })
      this.main.queue.some((item: Bullet) => {
        if (item.id === id) {
          item.pauseMove()
          item.setLikeDom(like.el, like.style)
          if (item.danmu.main.status !== 'paused') {
            item.startMove()
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  restartComment(id: string) {
    this.logger && this.logger.info(`restartComment: id ${id}`)

    if (id) {
      const main = this.main

      this._releaseCtrl(id)

      if (main.status === 'closed') {
        // The main process has been stopped, there is no need to drive the barrage to run
        return
      }

      main.queue.some((item: Bullet) => {
        if (item.id === id) {
          if (main.status !== 'paused') {
            item.startMove(true)
          } else {
            item.status = 'paused'
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  /**
   * @private
   */
  _releaseCtrl(id: string) {
    if (this.freezeId && id === this.freezeId) {
      this.mouseControl = false
      this.freezeId = null
    }
  }

  /**
   * @private
   */
  _freezeCtrl(id: string) {
    this.mouseControl = true
    this.freezeId = id
  }

  freezeComment(id: string) {
    this.logger && this.logger.info(`freezeComment: id ${id}`)

    if (id) {
      this._freezeCtrl(id)

      this.main.queue.some((item: Bullet) => {
        if (item.id === id) {
          item.status = 'forcedPause'
          item.pauseMove()
          if (item.el && item.el.style) {
            styleUtil(item.el, 'zIndex', 10)
          }
          return true
        } else {
          return false
        }
      })
    }
  }

  removeComment(id: string) {
    this.logger && this.logger.info(`removeComment: id ${id}`)

    if (id) {
      const { main } = this

      this._releaseCtrl(id)

      // remove bullet from the queue list
      main.queue = main.queue.filter((item: Bullet) => {
        if (item.id === id) {
          item.remove()
          return false
        } else {
          return true
        }
      })

      // remove comment from the data list
      main.data = main.data.filter((item: CommentData) => item.id !== id)
    }
  }

  /**
   * @param {Array<CommentData>} comments
   * @param {boolean} isClear
   */
  updateComments(comments: CommentData[], isClear = true) {
    this.logger &&
      this.logger.info(`updateComments: ${comments.length}, isClear ${isClear}`)
    const { main } = this
    if (typeof isClear === 'boolean' && isClear) {
      main.data = []
    }
    main.data = main.data.concat(comments)
    main.sortData()
    main.keepPoolWatermark()
  }

  /**
   * 设置所有弹幕播放时长
   * @param {number} duration
   */
  setAllDuration(mode: CommentMode = 'scroll', duration: number, force = true) {
    this.logger &&
      this.logger.info(
        `setAllDuration: mode ${mode} duration ${duration} force ${force}`
      )
    if (duration) {
      duration = duration ? duration : 5000
      if (force) {
        this.main.forceDuration = duration
      }
      this.main.data.forEach((data: CommentData) => {
        if (mode === data.mode) {
          data.duration = duration
        }
      })
      this.main.queue.forEach((item: Bullet) => {
        if (mode === item.mode) {
          item.duration = duration
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  /**
   * 设置弹幕播放速率，在弹幕播放速度上乘以一个系数，控制速度的变化
   * @param {number} val
   */
  setPlayRate(mode: CommentMode = 'scroll', val: number) {
    this.logger && this.logger.info(`setPlayRate: ${val}`)
    if (isNumber(val) && val > 0) {
      this.main.playRate = val
      this.main.queue.forEach((item: Bullet) => {
        if (mode === item.mode) {
          item.pauseMove()
          if (this.main.status !== 'paused') {
            item.startMove()
          }
        }
      })
    }
  }

  setOpacity(opacity: string) {
    this.logger && this.logger.info(`setOpacity: opacity ${opacity}`)

    if (this.container) {
      this.container.style.opacity = opacity
    }
  }

  setFontSize(
    size: number,
    channelSize: number,
    options = {
      reflow: true
    }
  ) {
    this.logger &&
      this.logger.info(`setFontSize: size ${size} channelSize ${channelSize}`)
    this.fontSize = `${size}px`
    if (size) {
      this.main.data.forEach((data: CommentData) => {
        if (data.style) {
          data.style.fontSize = this.fontSize
        }
      })
      this.main.queue.forEach((item: Bullet) => {
        if (!item.options.style) {
          item.options.style = {}
        }

        item.options.style.fontSize = this.fontSize
        item.setFontSize(this.fontSize)
      })
    }
    if (channelSize) {
      this.config.channelSize = channelSize
      this.main.channel.refreshBulletPositions(channelSize)

      if (options.reflow) {
        this.main.channel.resizeSync()
      }
    }
  }

  setArea(area: DanmuConfig['area'] & { reflow?: boolean }) {
    this.logger && this.logger.info(`setArea: area ${area}`)
    this.config.area = area

    if (area.reflow !== false) {
      this.main.channel.resizeSync()
    }
  }

  hide(mode = 'scroll') {
    this.logger && this.logger.info(`hide: mode ${mode}`)
    if (this.hideArr.indexOf(mode) < 0) {
      this.hideArr.push(mode)
    }
    const arr = this.main.queue.filter(
      (item: Bullet) => mode === item.mode || (mode === 'color' && item.color)
    )
    arr.forEach((item: Bullet) => item.remove())
  }

  show(mode = 'scroll') {
    this.logger && this.logger.info(`show: mode ${mode}`)
    const index = this.hideArr.indexOf(mode)
    if (index > -1) {
      this.hideArr.splice(index, 1)
    }
  }

  /**
   * @param {'r2l'|'b2t'} direction
   */
  setDirection(direction: DanmuConfig['direction'] = 'r2l') {
    this.logger && this.logger.info(`setDirection: direction ${direction}`)
    this.direction = direction
    // this.main.channel.resize()
    this.emit('changeDirection', direction)
  }

  resize() {
    this.logger && this.logger.info('resize')
    this._resizeResponsiveFontSize()
    this.emit('channel_resize')
  }
}

export default DanmuJs
