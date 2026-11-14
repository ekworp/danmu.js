import BaseClass from './baseClass'
import Log from './utils/logger'
import {
  copyDom,
  isFunction,
  isNumber,
  styleCSSText,
  styleUtil
} from './utils/util'

// 减少频繁的内存创建
const logger = new Log('bullet')

/**
 * [Bullet 弹幕构造类]
 *
 * @description
 *  1. 几乎所有事件都可以被代理（包括CSS事件），Bullet内不要进行事件绑定。所有事件绑定均在main层处理
 */
export class Bullet extends BaseClass {
  /**
   * @param {import('./danmu').DanmuJs} danmu
   * @param {import('./baseClass').CommentData} options
   */
  constructor(danmu, options: any = {}) {
    super()
    const { container, recycler, config } = danmu

    this.setLogger(logger)
    // this.logger && this.logger.info('options.moveV', options.moveV)
    this.danmu = danmu
    this.options = options
    /** @type {number} - milliseconds */
    this.duration = options.duration
    this.id = options.id
    this.container = container
    /** @type {'scroll' | 'top' | 'bottom'} */
    this.mode =
      options.mode === 'top' || options.mode === 'bottom'
        ? options.mode
        : 'scroll'
    this.start = options.start
    this.prior = options.prior
    this.realTime = options.realTime
    this.color = options.color
    this.bookChannelId = options.bookChannelId
    this.reuseDOM = true
    this.noCopyEl = !!(config.disableCopyDOM || options.disableCopyDOM)
    this.recycler = recycler
    /**
     * @type {number} - seconds
     * @private
     */
    this._fullySlideInScreenDuration = undefined
    /**
     * @type {number} - milliseconds
     * @private
     */
    this._lastMoveTime = undefined
    /** @type {'waiting'|'start'|'end'} */
    this.status = 'waiting'

    if (!options.elLazyInit) {
      this.bulletCreateFail = !this._makeEl()
    }
  }
  get moveV() {
    const { danmu, options } = this
    let v = this._moveV

    if (!v) {
      if (options.moveV) {
        v = options.moveV
      } else {
        if (this.elPos) {
          const ctPos = danmu.containerPos
          const distance =
            this.direction === 'b2t'
              ? ctPos.height + (danmu.config.chaseEffect ? this.height : 0)
              : ctPos.width + (danmu.config.chaseEffect ? this.width : 0)

          v = (distance / this.duration) * 1000
        }
      }

      if (v) {
        v *= danmu.main.playRate

        // 固化速度，否则resize时外部获取当前弹幕时会重新计算速度，导致布局异常（重叠），同时提高性能。
        this._moveV = v
      }
    }
    return v
  }
  get direction() {
    return this.danmu.direction
  }
  get fullySlideIntoScreen() {
    let flag = true

    if (
      this.mode === 'scroll' &&
      this._lastMoveTime &&
      this._fullySlideInScreenDuration > 0
    ) {
      const now = new Date().getTime()
      const diff = (now - this._lastMoveTime) / 1000

      if (diff >= this._fullySlideInScreenDuration) {
        flag = true
      } else {
        flag = false
      }
    }
    return flag
  }

  /**
   * @private
   * @returns {Boolean}
   */
  _makeEl() {
    const { danmu, options } = this
    const { config, globalHooks } = danmu
    /**
     * @type {HTMLElement}
     */
    let el
    let cssText = ''
    const style = options.style || {}

    // The use of translate3d pushes css animations into hardware acceleration for more power!
    // Use 'perspective' to try to fix flickering problem after switching to the transform above
    style['perspective'] = '500em'

    // !!! 'backface-visibility' will cause translateX/Y stop rendering in firefox
    // style['backfaceVisibility'] = 'hidden'
    // style['webkitBackfaceVisibility'] = 'hidden'

    if (options.el || options.elLazyInit) {
      if (this.noCopyEl) {
        this.reuseDOM = false
      }

      if (options.elLazyInit) {
        if (isFunction(globalHooks.bulletCreateEl)) {
          try {
            const result = globalHooks.bulletCreateEl(options)

            if (result instanceof HTMLElement) {
              el = result
            } else {
              el = result.el
            }
          } catch (e) {}
        }
      } else {
        if (options.el.nodeType === 1 && !options.el.parentNode) {
          if (this.reuseDOM) {
            const copyDOM = copyDom(options.el)
            if (
              copyDOM instanceof HTMLElement &&
              options.eventListeners &&
              options.eventListeners.length > 0
            ) {
              options.eventListeners.forEach((eventListener) => {
                copyDOM.addEventListener(
                  eventListener.event,
                  eventListener.listener,
                  eventListener.useCapture || false
                )
              })
            }
            el = this.recycler.use()
            if (el.childNodes.length > 0) {
              el.innerHTML = ''
            }
            if (el.textContent) {
              el.textContent = ''
            }
            el.appendChild(copyDOM)
          } else {
            el = options.el
          }
        }
      }
    } else if (typeof options.txt === 'string') {
      el = this.recycler.use()
      el.textContent = options.txt
    }

    if (!el || !danmu.main) {
      return false
    }

    let offset
    if (isNumber(config.bulletOffset) && config.bulletOffset >= 0) {
      offset = config.bulletOffset
    } else {
      const containerPos = danmu.containerPos
      offset = containerPos.width / 10 > 100 ? 100 : containerPos.width / 10
    }
    const random = options.realTime ? 0 : Math.floor(Math.random() * offset)
    const left = this.updateOffset(random, true)

    style.left = left
    Object.keys(style).forEach((key) => {
      const bbqKey = key.replace(/[A-Z]/g, (val) => {
        return '-' + val.toLowerCase()
      })
      cssText += `${bbqKey}:${style[key]};`
    })
    styleCSSText(el, cssText)

    /**
     * @type {HTMLElement}
     */
    this.el = el
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style)
    }

    return true
  }

  updateOffset(val, dryRun = false) {
    this.random = val
    const left = this.danmu.containerPos.width + val + 'px'

    if (!dryRun) {
      styleUtil(this.el, 'left', this.danmu.containerPos.width + val + 'px')
    }

    return left
  }
  attach() {
    if (this.options.elLazyInit && !this.el) {
      this._makeEl()
    }

    // 防止外部钩子进行弹幕实例销毁，或者其他异常操作
    if (!this.danmu || !this.danmu.main) {
      return
    }

    const { danmu, options, el } = this
    const { globalHooks } = danmu

    if (globalHooks.bulletAttaching) {
      globalHooks.bulletAttaching(options)
    }

    if (!this.container.contains(el)) {
      this.container.appendChild(el)
    }
    this.elPos = el.getBoundingClientRect()
    if (this.direction === 'b2t') {
      this.width = this.elPos.height
      this.height = this.elPos.width
    } else {
      this.width = this.elPos.width
      this.height = this.elPos.height
    }
    if (this.moveV) {
      this.duration =
        ((this.danmu.containerPos.width + this.random + this.width) /
          this.moveV) *
        1000
    }

    if (globalHooks.bulletAttached) {
      globalHooks.bulletAttached(options, el)
    }
  }
  detach() {
    const { el, danmu, options } = this
    const { globalHooks } = danmu

    if (el) {
      // run hooks
      if (globalHooks.bulletDetaching) {
        globalHooks.bulletDetaching(options)
      }

      if (this.reuseDOM) {
        this.recycler.unused(el)
      } else {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      }

      // run hooks
      if (globalHooks.bulletDetached) {
        globalHooks.bulletDetached(options, el)
      }

      this.el = null
    }

    this.elPos = undefined
  }
  topInit() {
    this.logger &&
      this.logger.info(`topInit #${this.options.txt || '[DOM Element]'}#`)
    if (this.direction === 'b2t') {
      styleUtil(this.el, 'transformOrigin', 'left top')
      styleUtil(
        this.el,
        'transform',
        `translateX(-${this.top}px) translateY(${this.danmu.containerPos.height}px) translateZ(0px) rotate(90deg)`
      )
      styleUtil(this.el, 'transition', 'transform 0s linear 0s')
    } else {
      styleUtil(this.el, 'top', `${this.top}px`)
    }
  }
  pauseMove(isFullscreen = false) {
    if (this.status === 'paused') {
      return
    }
    if (this.status !== 'forcedPause') {
      this.status = 'paused'
    }

    // 将记忆速度删除，以备通过接口调整速度或duration时重计速度
    this._moveV = undefined

    if (!this.el) {
      return
    }
    if (this.mode === 'scroll') {
      const ctPos = this.danmu.containerPos
      if (isFullscreen) {
        const pastDuration = (new Date().getTime() - this._lastMoveTime) / 1000
        const pastS = pastDuration * this.moveV
        let ratio = 0
        let nowS = 0
        if (this.moveMoreS - pastS >= 0) {
          if (this.direction === 'b2t') {
            ratio = (this.moveMoreS - pastS) / this.moveContainerHeight
            nowS = ratio * ctPos.height
          } else {
            ratio = (this.moveMoreS - pastS) / this.moveContainerWidth
            nowS = ratio * ctPos.width
          }
        } else {
          nowS = this.moveMoreS - pastS
        }
        if (this.direction === 'b2t') {
          styleUtil(
            this.el,
            'transform',
            `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
          )
        } else {
          styleUtil(this.el, 'left', `${nowS}px`)
        }
      } else {
        if (this.direction === 'b2t') {
          styleUtil(
            this.el,
            'transform',
            `translateX(-${this.top}px) translateY(${
              this.el.getBoundingClientRect().top - ctPos.top
            }px) translateZ(0px) rotate(90deg)`
          )
        } else {
          styleUtil(
            this.el,
            'left',
            `${this.el.getBoundingClientRect().left - ctPos.left}px`
          )
        }
      }
      if (this.direction === 'b2t') {
        // this.el.style.transform = `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
        styleUtil(this.el, 'transition', 'transform 0s linear 0s')
      } else {
        styleUtil(
          this.el,
          'transform',
          'translateX(0px) translateY(0px) translateZ(0px)'
        )
        styleUtil(this.el, 'transition', 'transform 0s linear 0s')
      }
    } else {
      if (!this.pastDuration || !this.startTime) {
        this.pastDuration = 1
      } else {
        this.pastDuration =
          this.pastDuration + new Date().getTime() - this.startTime
      }
    }
  }
  startMove(force = false) {
    if (!this.hasMove) {
      this.danmu.emit('bullet_start', this)
      this.hasMove = true
    }
    if (this.status === 'forcedPause' && !force) return
    if (!this.el) return
    if (this.status === 'start') return

    this.status = 'start'

    if (this.mode === 'scroll') {
      const ctPos = this.danmu.containerPos
      if (!this.el) {
        return
      }
      const bulletPos = this.el.getBoundingClientRect()
      let fullyMovedToScreenDistance

      if (this.direction === 'b2t') {
        fullyMovedToScreenDistance = bulletPos.bottom - ctPos.bottom

        const leftDuration = (bulletPos.bottom - ctPos.top) / this.moveV
        styleUtil(this.el, 'transition', `transform ${leftDuration}s linear 0s`)
        styleUtil(
          this.el,
          'transform',
          `translateX(-${this.top}px) translateY(-${this.height}px) translateZ(0px) rotate(90deg)`
        )
        this._lastMoveTime = new Date().getTime()
        this.moveMoreS = bulletPos.top - ctPos.top
        this.moveContainerHeight = ctPos.height
      } else {
        fullyMovedToScreenDistance = bulletPos.right - ctPos.right
        const leftDistance = bulletPos.right - ctPos.left
        const leftDuration = leftDistance / this.moveV

        if (bulletPos.right > ctPos.left) {
          styleUtil(
            this.el,
            'transition',
            `transform ${leftDuration}s linear 0s`
          )
          styleUtil(
            this.el,
            'transform',
            `translateX(-${leftDistance}px) translateY(0px) translateZ(0px)`
          )

          this._lastMoveTime = new Date().getTime()
          this.moveMoreS = bulletPos.left - ctPos.left
          this.moveContainerWidth = ctPos.width
        } else {
          this.status = 'end'
          this.remove()
        }
      }

      this._fullySlideInScreenDuration = fullyMovedToScreenDistance / this.moveV
    } else {
      const newTimestamp = new Date().getTime()
      const leftDuration =
        (this.startTime && newTimestamp - this.startTime > this.duration
          ? newTimestamp - this.startTime
          : this.duration) / 1000
      styleUtil(this.el, 'left', '50%')
      styleUtil(this.el, 'margin', `0 0 0 -${this.width / 2}px`)
      styleUtil(this.el, 'visibility', 'hidden')
      styleUtil(this.el, 'transition', `visibility ${leftDuration}s 0s`)
      if (!this.pastDuration) {
        this.pastDuration = 1
      }
      this.startTime = newTimestamp
    }
  }
  remove(needPause = true) {
    this.logger &&
      this.logger.info(`remove #${this.options.txt || '[DOM Element]'}#`)

    if (needPause) {
      this.pauseMove()
    }

    if (this.el && this.el.parentNode) {
      this.detach()
      if (this.options.el && this.options.el.nodeType === 1 && this.noCopyEl) {
        styleUtil(this.options.el, 'transform', 'none')
      }
      this.danmu.emit('bullet_remove', {
        bullet: this
      })
    }
  }

  setFontSize(size) {
    if (this.el) {
      this.el.style['fontSize'] = size
    }
  }
  setLikeDom(el, style) {
    if (el) {
      Object.keys(style).forEach((key) => {
        el.style[key] = style[key]
      })
      const likeClass = 'danmu-like'
      el.className = likeClass
      if (this.el) {
        const children = this.el.querySelector('.' + likeClass)
        if (children) {
          this.el.removeChild(children)
        }
        this.el.innerHTML = `${this.el.innerHTML}${el.outerHTML}`
      }
    }
    return el
  }
}

export default Bullet
