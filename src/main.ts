import type { CommentData, CommentRuntime } from './baseClass'
import BaseClass from './baseClass'
import Bullet from './bullet'
import Channel from './channel'
import { Ticker } from './core/ticker'
import type { DanmuJs } from './danmu'
import { getPlayerCurrentTime } from './player'
import { hasOwnProperty } from './utils/util'

interface EventBindingTarget {
  addEventListener?: (
    event: string,
    handler: EventListener,
    options?: boolean
  ) => void
  removeEventListener?: (
    event: string,
    handler: EventListener,
    options?: boolean
  ) => void
  on?: (event: string, handler: (...args: never[]) => void) => void
  off?: (event: string, handler: (...args: never[]) => void) => void
}

/**
 * @typedef {import('./baseClass').CommentData} CommentData
 */

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
class Main extends BaseClass {
  data!: CommentData[]
  playedData!: CommentData[]
  queue!: Bullet[]
  private ticker = new Ticker()
  private readonly runtime = new WeakMap<CommentData, CommentRuntime>()
  private displayedComments = new WeakSet<CommentData>()
  private tickRequested = false
  private lastBulletLaunch = 0

  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu: DanmuJs) {
    super()
    this.setLogger('main')
    this.danmu = danmu
    this.container = danmu.container
    this.channel = new Channel(danmu) // 弹幕轨道实例

    /**
     * @type {Array<CommentData>}
     */
    this.data = [].concat(danmu.config.comments)
    this.playedData = []

    /**
     * @type {Array<Bullet>}
     */
    this.queue = [] // 等待播放的弹幕队列
    this.timer = null // 弹幕动画定时器句柄

    /**
     * 弹幕播放速率
     * @type {number}
     */
    this.playRate = 1

    /**
     * @type {'normal'|'stop'}
     */
    this.retryStatus = 'normal'
    this.interval = danmu.config.interval // 弹幕队列缓存间隔
    /**
     * @type {'idle' | 'paused' | 'playing' | 'closed'}
     */
    this._status = 'idle' // 当前弹幕正在闲置
    /**
     * @type {Array<[HTMLElement, string, Function]>}
     */
    this._events = []

    this._bindEvents()
  }

  get status() {
    return this._status
  }

  getCommentRuntime(comment: CommentData): CommentRuntime {
    let runtime = this.runtime.get(comment)
    if (!runtime) {
      runtime = { attached: false, status: 'pending' }
      this.runtime.set(comment, runtime)
    }
    return runtime
  }

  setCommentAttached(comment: CommentData, attached: boolean): void {
    const runtime = this.getCommentRuntime(comment)
    runtime.attached = attached
    runtime.status = attached ? 'playing' : 'pending'
  }

  destroy() {
    this.logger && this.logger.info('destroy')
    this._unbindEvents()
    this._cancelTick()
    this.channel && this.channel.destroy()
    this.data = []
    for (const k in this) {
      Reflect.deleteProperty(this, k)
    }
  }

  /**
   * @private
   */
  _bindEvents() {
    const { danmu, container } = this
    this._unbindEvents()

    /**
     * 在渲染队列中移除已经展示完的弹幕对象
     * @param {{
     *   bullet: Bullet
     * }} data
     */
    const updateQueue = ({ bullet }: { bullet: Bullet }) => {
      const { data, queue } = this
      queue.some((item, index) => {
        if (item.id === bullet.id) {
          queue.splice(index, 1)
          return true
        } else {
          return false
        }
      })
      data.some((item) => {
        if (item.id === bullet.id) {
          this.setCommentAttached(item, false)
          return true
        } else {
          return false
        }
      })
    }
    this._events.push([danmu, 'bullet_remove', updateQueue])

    /**
     * @param {TransitionEvent} e
     */
    const onTransitionEnd = (e: TransitionEvent) => {
      const bullet = this._getBulletByEvt(e)

      if (bullet) {
        bullet.status = 'end'
        bullet.remove(false)
      }
    }
    this._events.push([container, 'transitionend', onTransitionEnd])

    if (danmu.config.mouseControl || danmu.config.mouseEnterControl) {
      /**
       * @param {MouseEvent} e
       */
      const onMouseover = (e: MouseEvent) => {
        const { danmu } = this
        let bullet

        if (!danmu || (danmu.mouseControl && danmu.config.mouseControlPause)) {
          return
        }

        bullet = this._getBulletByEvt(e)

        if (bullet) {
          if (bullet.status !== 'waiting' && bullet.status !== 'end') {
            danmu.emit('bullet_hover', {
              bullet: bullet,
              event: e
            })
          }
        }
      }
      this._events.push([container, 'mouseover', onMouseover])
    }

    this._events.forEach((item: unknown) => {
      const [target, event, handler] = item as [
        EventBindingTarget,
        string,
        EventListener
      ]
      if (target.addEventListener) {
        target.addEventListener(event, handler, false)
      } else if (target.on) {
        target.on(event, handler as (...args: never[]) => void)
      }
    })
  }

  /**
   * @private
   */
  _unbindEvents() {
    if (this._events.length) {
      this._events.forEach((item: unknown) => {
        const [target, event, handler] = item as [
          EventBindingTarget,
          string,
          EventListener
        ]
        if (target.removeEventListener) {
          target.removeEventListener(event, handler, false)
        } else if (target.off) {
          target.off(event, handler as (...args: never[]) => void)
        }
      })
      this._events = []
    }
  }

  /**
   * @private
   */
  _cancelTick() {
    this.ticker.stop()
  }

  syncToTime(): void {
    for (const bullet of [...this.queue]) {
      bullet.remove()
    }
    this.queue = []
    this.data.forEach((comment) => {
      this.setCommentAttached(comment, false)
    })
    this.playedData = []
    this.displayedComments = new WeakSet<CommentData>()
    this.channel.reset()
    if (this._status === 'playing') {
      this._startTick()
    }
  }

  requestTick(): void {
    if (this._status !== 'playing' || this.tickRequested) return
    this.tickRequested = true
    queueMicrotask(() => {
      this.tickRequested = false
      if (this._status === 'playing') {
        this.readData()
        this.dataHandle()
      }
    })
  }

  private selectFairCandidates(
    list: CommentData[],
    limit: number
  ): CommentData[] {
    if (list.length <= limit) return list

    const buckets = new Map<number, CommentData[]>()
    for (const item of list) {
      const bucket = Math.floor(item.start / 1000)
      const items = buckets.get(bucket)
      if (items) {
        items.push(item)
      } else {
        buckets.set(bucket, [item])
      }
    }

    const entries = [...buckets.entries()]
    const quotas = entries.map(([, items]) => ({
      items,
      quota: 0,
      ideal: (items.length * limit) / list.length,
      remainder: 0
    }))
    let remaining = limit

    for (const entry of quotas) {
      entry.quota = Math.min(Math.floor(entry.ideal), entry.items.length)
      entry.remainder = entry.ideal - entry.quota
      entry.quota = Math.min(entry.quota, entry.items.length)
      remaining -= entry.quota
    }

    while (remaining > 0) {
      const entry = quotas
        .filter((item) => item.quota < item.items.length)
        .sort((left, right) => {
          const remainder = right.remainder - left.remainder
          return remainder || right.items.length - left.items.length
        })[0]
      if (!entry) break
      entry.quota++
      remaining--
    }

    const selected: CommentData[] = []
    for (const { items, quota } of quotas) {
      if (quota === 0) continue
      if (quota === items.length) {
        selected.push(...items)
        continue
      }

      for (let i = 0; i < quota; i++) {
        const index = Math.floor((i * items.length) / quota)
        selected.push(items[index])
      }
    }

    return selected
  }

  private getVisibleBulletCount(): number {
    this.channel.cleanupExpiredBullets()
    const containerRect = this.container.getBoundingClientRect()
    let count = 0

    for (const bullet of this.queue) {
      if (!bullet.el || bullet.status === 'end') continue
      const rect = bullet.el.getBoundingClientRect()
      if (
        rect.right > containerRect.left &&
        rect.left < containerRect.right &&
        rect.bottom > containerRect.top &&
        rect.top < containerRect.bottom
      ) {
        count++
      }
    }

    return count
  }

  /**
   * Calculate how many comments may enter on this tick.  The visible limit is
   * a capacity limit, not a batch size: comments are paced according to the
   * time it takes a bullet to cross the container and the tracks that can
   * actually accept one.
   */
  private getLaunchBudget(
    candidates: CommentData[],
    availableSlots: number
  ): number {
    if (availableSlots <= 0 || candidates.length === 0) return 0

    const mode = candidates[0].mode || 'scroll'
    const availableTracks = this.channel.getAvailableTrackCount(mode)
    if (availableTracks <= 0) return 0

    const first = candidates[0]
    const containerSize =
      this.danmu.direction === 'b2t'
        ? this.channel.containerHeight
        : this.channel.containerWidth
    const speed =
      first.moveV && first.moveV > 0
        ? first.moveV * this.playRate
        : containerSize > 0 && first.duration > 0
          ? (containerSize / first.duration) * 1000
          : 0
    const travelTime =
      speed > 0 ? (containerSize / speed) * 1000 : first.duration
    const maxVisible = this.danmu.config.maxVisibleBullets
    const target =
      Number.isFinite(maxVisible) && maxVisible > 0
        ? Math.max(1, Math.min(maxVisible, availableTracks))
        : Math.max(1, availableTracks)
    const launchInterval = Math.max(1, travelTime / target)
    const now = Date.now()

    // The initial credit is derived from the track/visible capacity rather
    // than being a per-tick comment limit.
    const trackRate = Math.max(1, Math.floor(availableTracks / target))
    if (this.lastBulletLaunch === 0) {
      return Math.min(availableSlots, availableTracks, trackRate)
    }
    if (now - this.lastBulletLaunch < launchInterval) {
      return 0
    }
    const due = Math.max(
      1,
      Math.floor((now - this.lastBulletLaunch) / launchInterval)
    )
    return Math.min(availableSlots, availableTracks, trackRate, due)
  }

  /**
   * @private
   */
  _startTick() {
    this.retryStatus = 'normal'
    this.sortData()
    this.ticker.start(() => {
      if (this._status === 'closed' && this.retryStatus === 'stop') {
        this._cancelTick()
        return
      }
      if (this._status === 'playing') {
        this.readData()
        this.dataHandle()
      }
    })
  }
  // 启动弹幕渲染主进程
  start() {
    this.logger && this.logger.info('start')

    if (this._status === 'playing') {
      return
    }

    this._status = 'playing'
    this.queue = []
    this.lastBulletLaunch = 0
    this.container.innerHTML = ''
    this.channel.reset()
    this._startTick()
  }
  stop() {
    this.logger && this.logger.info('stop')

    if (this._status === 'closed') {
      return
    }

    this._status = 'closed'
    this.retryStatus = 'stop'
    this.queue = []
    this.lastBulletLaunch = 0

    if (this.container) {
      this.container.innerHTML = ''
    }
    this.channel && this.channel.reset()
    this._cancelTick()
  }
  clear() {
    this.logger && this.logger.info('clear')
    this.channel && this.channel.reset()
    this.data = []
    this.queue = []
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
  play() {
    if (this._status === 'closed') {
      this.logger && this.logger.info('play ignored')
      return
    }

    this.logger && this.logger.info('play')
    this._status = 'playing'
    const channels = this.channel.channels
    if (channels && channels.length > 0) {
      ;['scroll', 'top', 'bottom'].forEach((key) => {
        this.queue.forEach((item: Bullet) => {
          item.startMove()
          item.resized = true
        })
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach((item: Bullet) => {
            item.resized = false
          })
        }
      })
    }
    this._startTick()
  }
  pause() {
    if (this._status === 'closed') {
      this.logger && this.logger.info('pause ignored')
      return
    }

    this.logger && this.logger.info('pause')
    this._status = 'paused'
    this._cancelTick()

    const channels = this.channel.channels
    if (channels && channels.length > 0) {
      // ['scroll', 'top', 'bottom'].forEach( key => {
      //   for (let i = 0; i < channels.length; i++) {
      //     channels[i].queue[key].forEach(item => {
      //       item.pauseMove()
      //     })
      //   }
      // })
      this.queue.forEach((item) => {
        item.pauseMove()
      })
    }
  }
  dataHandle() {
    if (this._status === 'paused' || this._status === 'closed') {
      return
    }
    if (this.queue.length) {
      this.queue.forEach((item) => {
        if (item.status === 'waiting') {
          item.startMove()
        }
      })
    }
  }
  readData() {
    const { danmu, interval, channel } = this,
      player = danmu.player
    let result,
      /**
       * @type {Bullet}
       */
      bullet,
      /**
       * @type {Array<CommentData>}
       */
      list

    if (!danmu.isReady || !danmu.main) return

    if (player) {
      const currentTime = Math.floor(getPlayerCurrentTime(player) * 1000)
      const staleWindow = interval * 2

      list = this.data.filter((item) => {
        if (!item.start && danmu.hideArr.indexOf(item.mode) < 0) {
          if (!item.color || danmu.hideArr.indexOf('color') < 0) {
            item.start = currentTime
          }
        }
        return (
          !this.getCommentRuntime(item).attached &&
          !this.displayedComments.has(item) &&
          danmu.hideArr.indexOf(item.mode) < 0 &&
          (!item.color || danmu.hideArr.indexOf('color') < 0) &&
          item.start - interval <= currentTime &&
          (!danmu.config.dropStaleComments ||
            currentTime <= item.start + staleWindow)
        )
      })

      if (danmu.config.highScorePriority) {
        // 高积分弹幕优先展示
        list.sort(
          (prev, cur) =>
            (cur.prior && !prev.prior ? 1 : 0) ||
            (cur.score || -1) - (prev.score || -1)
        )
      }

      if (danmu.live) {
        this.data = []
      }
    } else {
      list = this.data.splice(0, 1)
      if (list.length === 0) list = this.playedData.splice(0, 1)
    }

    const maxVisible = this.danmu.config.maxVisibleBullets
    const availableSlots = Number.isFinite(maxVisible)
      ? Math.max(maxVisible - this.getVisibleBulletCount(), 0)
      : Infinity
    const launchBudget = this.getLaunchBudget(list, availableSlots)
    list = this.selectFairCandidates(list, launchBudget)
    if (
      list.length > 0 &&
      launchBudget > 0 &&
      channel.checkAvailableTrack(list[0].mode)
    ) {
      // 提前更新轨道位置信息, 减少Bullet频繁读取容器dom信息
      channel.updatePos()

      for (let i = 0, item; i < list.length; i++) {
        item = list[i]
        if (this.forceDuration && this.forceDuration !== item.duration) {
          item.duration = this.forceDuration
        }
        bullet = new Bullet(danmu, item)
        if (!bullet.bulletCreateFail) {
          bullet.attach()
          this.setCommentAttached(item, true)
          result = channel.addBullet(bullet)

          if (result.result) {
            this.queue.push(bullet)
            bullet.topInit()
            this.displayedComments.add(item)
            this.lastBulletLaunch = Date.now()
          } else {
            bullet.detach()
            for (const k in bullet) {
              if (hasOwnProperty.call(bullet, k)) {
                Reflect.deleteProperty(bullet, k)
              }
            }
            bullet = null
            this.setCommentAttached(item, false)
            if (item.noDiscard) {
              if (item.prior) {
                this.data.unshift(item)
              } else {
                this.data.push(item)
              }
            }
          }
        }
      }
    }
  }
  sortData() {
    this.data.sort((prev, cur) => (prev.start || -1) - (cur.start || -1))
  }

  insertComment(comment: CommentData, prioritize = false): void {
    if (prioritize) {
      this.data.unshift(comment)
      return
    }

    let low = 0
    let high = this.data.length
    const start = comment.start || -1
    while (low < high) {
      const middle = (low + high) >>> 1
      if ((this.data[middle].start || -1) <= start) {
        low = middle + 1
      } else {
        high = middle
      }
    }
    this.data.splice(low, 0, comment)
  }

  keepPoolWatermark() {
    const { config, player } = this.danmu
    const { data } = this
    const priorComments: CommentData[] = []
    let deleteCount = 0

    // Support data pool to control watermark automatically
    if (
      typeof config.maxCommentsLength === 'number' &&
      data.length > config.maxCommentsLength
    ) {
      deleteCount = data.length - config.maxCommentsLength

      for (let i = 0, comment; i < deleteCount; i++) {
        comment = data[i]
        if (comment.prior && !this.getCommentRuntime(comment).attached) {
          priorComments.push(data[i])
        }
      }
    } else if (config.dropStaleComments && player) {
      const currentTime = Math.floor(getPlayerCurrentTime(player) * 1000),
        timePoint = currentTime - config.interval * 2

      if (timePoint > 0) {
        for (let i = 0, comment; i < data.length; i++) {
          comment = data[i]
          if (comment.prior && !this.getCommentRuntime(comment).attached) {
            priorComments.push(data[i])
          }

          if (comment.start > timePoint) {
            deleteCount = i
            break
          }
        }
      }
    }

    if (deleteCount > 0) {
      data.splice(0, deleteCount)

      // Keep high-priority comments data.
      this.data = priorComments.concat(data)
    }
  }

  /**
   * @param {EventTarget} e
   * @private
   */
  _getBulletByEvt(e: Event) {
    const target = e.target || e.srcElement
    const { queue } = this

    let bullet
    for (let i = 0, item; i < queue.length; i++) {
      item = queue[i]
      if (item && item.el && (item.el === target || item.el.contains(target))) {
        bullet = item
        break
      }
    }

    return bullet
  }
}

export default Main
