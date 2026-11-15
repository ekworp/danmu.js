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

export function deepCopy(dst: object, src: object): void {
  const target = dst as Record<string, unknown>
  const source = src as Record<string, unknown>
  if (typeOf(source) === 'Object' && typeOf(target) === 'Object') {
    Object.keys(source).forEach((key) => {
      const isDomNode =
        typeof Node !== 'undefined' && source[key] instanceof Node
      if (typeOf(source[key]) === 'Object' && !isDomNode) {
        if (typeOf(target[key]) !== 'Object') {
          target[key] = source[key]
        } else {
          deepCopy(target[key] as object, source[key] as object)
        }
      } else if (typeOf(source[key]) === 'Array') {
        target[key] =
          typeOf(target[key]) === 'Array'
            ? (target[key] as unknown[]).concat(source[key] as unknown[])
            : source[key]
      } else {
        target[key] = source[key]
      }
    })
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

interface EventSource {
  on(event: string, fn: EventHandler): void
  once(event: string, fn: EventHandler): void
  off(event: string, fn: EventHandler): void
}

type EventHandler = (data?: unknown) => void

function offInDestroy(
  object: EventSource,
  event: string,
  fn: EventHandler,
  offEvent: string
) {
  function onDestroy() {
    object.off(event, fn)
    object.off(offEvent, onDestroy)
  }
  object.once(offEvent, onDestroy)
}

export function attachEventListener(
  object: EventSource,
  event: string,
  fn: EventHandler,
  offEvent?: string
): void {
  if (offEvent) {
    object.on(event, fn)
    offInDestroy(object, event, fn, offEvent)
  } else {
    const _fn = (data?: unknown) => {
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
  value: string | number | undefined
): void {
  const style = elem.style
  try {
    Object.assign(style, { [name]: value })
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

const pendingTransformFrames = new WeakMap<HTMLElement, number>()

export function cancelTransformAnimation(elem: HTMLElement): void {
  const pendingFrame = pendingTransformFrames.get(elem)
  if (pendingFrame !== undefined) {
    cancelAnimationFrame(pendingFrame)
    pendingTransformFrames.delete(elem)
  }
}

export function animateTransform(
  elem: HTMLElement,
  transform: string,
  duration: number
): void {
  cancelTransformAnimation(elem)

  styleUtil(elem, 'transition', 'none')
  void elem.offsetWidth

  const frame = requestAnimationFrame(() => {
    pendingTransformFrames.delete(elem)
    styleUtil(elem, 'transition', `transform ${duration}s linear 0s`)
    styleUtil(elem, 'transform', transform)
  })
  pendingTransformFrames.set(elem, frame)
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

export function isFunction(val: unknown): val is (...args: never[]) => unknown {
  return typeof val === 'function'
}

/**
 * Simple throttle
 * @param {() => void} func
 * @param {number} wait
 * @returns
 */
export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timer = 0
  return (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(undefined, args), wait)
  }
}
