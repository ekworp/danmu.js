export const hasOwnProperty = Object.prototype.hasOwnProperty

export function createDom(
  el = 'div',
  tpl = '',
  attrs: Record<string, string | number | boolean> = {},
  cname = ''
): HTMLElement {
  const dom = document.createElement(el)
  dom.className = cname
  dom.innerHTML = tpl
  Object.keys(attrs).forEach((item) => {
    const key = item
    const value = attrs[item]
    if (el === 'video' || el === 'audio') {
      if (value) {
        dom.setAttribute(key, String(value))
      }
    } else {
      dom.setAttribute(key, String(value))
    }
  })
  return dom
}

export function hasClass(el: HTMLElement, className: string): boolean {
  if (el.classList) {
    return Array.prototype.some.call(el.classList, (item) => item === className)
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }
}

export function addClass(el: HTMLElement, className: string): void {
  if (el.classList) {
    className
      .replace(/(^\s+|\s+$)/g, '')
      .split(/\s+/g)
      .forEach((item) => {
        item && el.classList.add(item)
      })
  } else if (!hasClass(el, className)) {
    el.className += ' ' + className
  }
}

export function removeClass(el: HTMLElement, className: string): void {
  if (el.classList) {
    className.split(/\s+/g).forEach((item) => {
      el.classList.remove(item)
    })
  } else if (hasClass(el, className)) {
    className.split(/\s+/g).forEach((item) => {
      const reg = new RegExp('(\\s|^)' + item + '(\\s|$)')
      el.className = el.className.replace(reg, ' ')
    })
  }
}

export function toggleClass(el: HTMLElement, className: string): void {
  className.split(/\s+/g).forEach((item) => {
    if (hasClass(el, item)) {
      removeClass(el, item)
    } else {
      addClass(el, item)
    }
  })
}

export function findDom(
  el: Document | HTMLElement = document,
  sel = ''
): Element | null {
  let dom: Element | null = null
  // fix querySelector IDs that start with a digit
  // https://stackoverflow.com/questions/37270787/uncaught-syntaxerror-failed-to-execute-queryselector-on-document
  try {
    dom = el.querySelector(sel)
  } catch (e) {
    if (sel.startsWith('#')) {
      dom =
        'getElementById' in el
          ? el.getElementById(sel.slice(1))
          : el.querySelector(sel)
    }
  }
  return dom
}

export function deepCopy(dst: Record<string, any>, src: Record<string, any>) {
  if (typeOf(src) === 'Object' && typeOf(dst) === 'Object') {
    Object.keys(src).forEach((key) => {
      const isDomNode = typeof Node !== 'undefined' && src[key] instanceof Node
      if (typeOf(src[key]) === 'Object' && !isDomNode) {
        if (!dst[key]) {
          dst[key] = src[key]
        } else {
          deepCopy(dst[key], src[key])
        }
      } else if (typeOf(src[key]) === 'Array') {
        dst[key] =
          typeOf(dst[key]) === 'Array' ? dst[key].concat(src[key]) : src[key]
      } else {
        dst[key] = src[key]
      }
    })
    return dst
  }
}

export function typeOf(obj: unknown): string | undefined {
  return Object.prototype.toString.call(obj).match(/([^\s.*]+)(?=]$)/g)?.[0]
}

export function copyDom(dom: HTMLElement): HTMLElement | string {
  if (dom && dom.nodeType === 1) {
    const back = document.createElement(dom.tagName)
    Array.prototype.forEach.call(dom.attributes, (node) => {
      back.setAttribute(node.name, node.value)
    })
    if (dom.innerHTML) {
      back.innerHTML = dom.innerHTML
    }
    return back
  } else {
    return ''
  }
}

function offInDestroy(object, event, fn, offEvent) {
  function onDestroy() {
    object.off(event, fn)
    object.off(offEvent, onDestroy)
  }
  object.once(offEvent, onDestroy)
}

export function attachEventListener(
  object: any,
  event: string,
  fn: (data?: any) => void,
  offEvent?: string
): void {
  if (offEvent) {
    object.on(event, fn)
    offInDestroy(object, event, fn, offEvent)
  } else {
    const _fn = (data) => {
      fn(data)
      object.off(event, _fn)
    }
    object.on(event, _fn)
  }
}

/**
 * @param {HTMLElement} elem
 * @param {string} name
 * @param {string} value
 */
export function styleUtil(
  elem: HTMLElement,
  name: string,
  value: string | number
): void {
  const style = elem.style
  try {
    ;(style as any)[name] = value
  } catch (error) {
    style.setProperty(name, String(value))
  }
}

/**
 * @param {HTMLElement} elem
 * @param {string} value
 */
export function styleCSSText(elem: HTMLElement, value: string): void {
  const style = elem.style
  try {
    style.cssText = value
  } catch (error) {}
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

export function isFunction(val: unknown): val is (...args: any[]) => any {
  return typeof val === 'function'
}

/**
 * Simple throttle
 * @param {() => void} func
 * @param {number} wait
 * @returns
 */
export function throttle(
  func: (...args: any[]) => void,
  wait: number
): (...args: any[]) => void {
  let timer = 0
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(undefined, args), wait)
  }
}
