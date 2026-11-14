import BaseClass from './baseClass'
import Bullet from './bullet'
import Channel from './channel'
import { hasOwnProperty } from './utils/util'

// 单次尝试入轨弹幕数量越多，长任务及CPU耗时越多
const MAX_TRY_COUNT = 0

/**
 * @typedef {import('./baseClass').CommentData} CommentData
 */

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
class Main extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   */
  constructor(danmu) {
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

  destroy() {
    this.logger && this.logger.info('destroy')
    this._unbindEvents()
    this._cancelTick()
    this.channel && this.channel.destroy()
    this.data = []
    for (const k in this) {
      delete this[k]
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
    const updateQueue = ({ bullet }) => {
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
          item.attached_ = false
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
    const onTransitionEnd = (e) => {
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
      const onMouseover = (e) => {
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

    this._events.forEach((item) => {
      if (item[0].addEventListener) {
        item[0].addEventListener(item[1], item[2], false)
      } else if (item[0].on) {
        item[0].on(item[1], item[2])
      }
    })
  }

  /**
   * @private
   */
  _unbindEvents() {
    if (this._events.length) {
      this._events.forEach((item) => {
        if (item[0].removeEventListener) {
          item[0].removeEventListener(item[1], item[2], false)
        } else if (item[0].off) {
          item[0].off(item[1], item[2])
        }
      })
      this._events = []
    }
  }

  /**
   * @private
   */
  _cancelTick() {
    if (this.handleTimer) {
      clearTimeout(this.handleTimer)
      this.handleTimer = null
    }
  }

  /**
   * @private
   */
  _startTick() {
    const self = this
    self.retryStatus = 'normal'

    self._cancelTick()
    self.sortData()

    function dataHandle() {
      if (self._status === 'closed' && self.retryStatus === 'stop') {
        self._cancelTick()
        return
      }
      if (self._status === 'playing') {
        self.readData()
        self.dataHandle()
      }
      if (self.retryStatus !== 'stop' || self._status === 'paused') {
        self.handleTimer = setTimeout(dataHandle, 250)
      }
    }
    dataHandle()
  }
  // 启动弹幕渲染主进程
  start() {
    this.logger && this.logger.info('start')

    if (this._status === 'playing') {
      return
    }

    this._status = 'playing'
    this.queue = []
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
      // eslint-disable-next-line no-extra-semi
      ;['scroll', 'top', 'bottom'].forEach((key) => {
        this.queue.forEach((item) => {
          item.startMove()
          item.resized = true
        })
        for (let i = 0; i < channels.length; i++) {
          channels[i].queue[key].forEach((item) => {
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
      const currentTime = player.currentTime
        ? Math.floor(player.currentTime * 1000)
        : 0

      list = this.data.filter((item) => {
        if (!item.start && danmu.hideArr.indexOf(item.mode) < 0) {
          if (!item.color || danmu.hideArr.indexOf('color') < 0) {
            item.start = currentTime
          }
        }
        return (
          !item.attached_ &&
          danmu.hideArr.indexOf(item.mode) < 0 &&
          (!item.color || danmu.hideArr.indexOf('color') < 0) &&
          item.start - interval <= currentTime &&
          currentTime <= item.start + interval
        )
      })

      if (danmu.config.highScorePriority) {
        // 高积分弹幕优先展示
        list.sort(
          (prev, cur) =>
            (cur.prior && !prev.prior) || (cur.score || -1) - (prev.score || -1)
        )
      }

      if (danmu.live) {
        this.data = []
      }
    } else {
      list = this.data.splice(0, 1)
      if (list.length === 0) list = this.playedData.splice(0, 1)
    }

    if (list.length > 0 && channel.checkAvailableTrack(list[0].mode)) {
      // 提前更新轨道位置信息, 减少Bullet频繁读取容器dom信息
      channel.updatePos()

      let tryCount = MAX_TRY_COUNT

      for (let i = 0, item; i < list.length; i++) {
        item = list[i]
        if (this.forceDuration && this.forceDuration !== item.duration) {
          item.duration = this.forceDuration
        }
        bullet = new Bullet(danmu, item)
        if (!bullet.bulletCreateFail) {
          bullet.attach()
          item.attached_ = true
          result = channel.addBullet(bullet)

          if (result.result) {
            this.queue.push(bullet)
            bullet.topInit()

            tryCount = MAX_TRY_COUNT
          } else {
            bullet.detach()
            for (const k in bullet) {
              if (hasOwnProperty.call(bullet, k)) {
                delete bullet[k]
              }
            }
            bullet = null
            item.attached_ = false
            if (item.noDiscard) {
              if (item.prior) {
                this.data.unshift(item)
              } else {
                this.data.push(item)
              }
            }

            if (tryCount === 0) {
              break
            } else {
              tryCount--
            }
          }
        } else {
          if (tryCount === 0) {
            break
          } else {
            tryCount--
          }
        }
      }
    }
  }
  sortData() {
    this.data.sort((prev, cur) => (prev.start || -1) - (cur.start || -1))
  }

  keepPoolWatermark() {
    const { config, player } = this.danmu
    const { data } = this
    const priorComments = []
    let deleteCount = 0

    // Support data pool to control watermark automatically
    if (
      typeof config.maxCommentsLength === 'number' &&
      data.length > config.maxCommentsLength
    ) {
      deleteCount = data.length - config.maxCommentsLength

      for (let i = 0, comment; i < deleteCount; i++) {
        comment = data[i]
        if (comment.prior && !comment.attached_) {
          priorComments.push(data[i])
        }
      }
    } else if (config.dropStaleComments && player && player.currentTime) {
      const currentTime = Math.floor(player.currentTime * 1000),
        timePoint = currentTime - config.interval

      if (timePoint > 0) {
        for (let i = 0, comment; i < data.length; i++) {
          comment = data[i]
          if (comment.prior && !comment.attached_) {
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
  _getBulletByEvt(e) {
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
