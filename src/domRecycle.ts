import { hasOwnProperty, styleUtil } from './utils/util'

export default class RecyclableDOMList {
  [key: string]: any

  constructor(options: RecycleOptions = {}) {
    const resolvedOptions: Required<RecycleOptions> = {
      initDOM: () => document.createElement('div'),
      initSize: 10,
      ...options
    }
    this.init(resolvedOptions)
  }

  init(options: Required<RecycleOptions>) {
    this.idleList = []
    this.usingList = []
    this._id = 0
    this.options = options
    this._expand(options.initSize)
  }

  use() {
    if (!this.idleList.length) {
      this._expand(1)
    }
    const firseIdle = this.idleList.shift()
    this.usingList.push(firseIdle)
    return firseIdle
  }

  unused(dom: HTMLElement) {
    const idx = this.usingList.indexOf(dom)
    if (idx < 0) {
      return
    }
    this.usingList.splice(idx, 1)
    dom.style.opacity = '0'
    this.idleList.push(dom)
  }

  _expand(size: number) {
    for (let i = 0; i < size; i++) {
      this.idleList.push(this.options.initDOM(this._id++))
    }
  }

  destroy() {
    for (let i = 0; i < this.idleList.length; i++) {
      this.idleList[i].innerHTML = ''
      this.idleList[i].textcontent = ''
      this.clearElementStyle(this.idleList[i])
    }
    for (let i = 0; i < this.usingList.length; i++) {
      this.usingList[i].innerHTML = ''
      this.usingList[i].textcontent = ''
      this.clearElementStyle(this.usingList[i])
    }
    for (const k in this) {
      if (hasOwnProperty.call(this, k)) {
        delete this[k]
      }
    }
  }

  clearElementStyle(element: HTMLElement) {
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent : null
    if (!ua) {
      return
    }
    if (ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1) {
      styleUtil(element, 'transform', 'none')
    } else {
      element.setAttribute('style', '')
    }
  }
}

interface RecycleOptions {
  initDOM?: (id: number) => HTMLElement
  initSize?: number
}
