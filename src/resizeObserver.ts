class ResizeObserverWrapper {
  private observer: ResizeObserver | null = null
  private frame: number | null = null
  private __handlers: Array<{
    target: Element
    handler: Array<() => void>
  }> = []

  constructor() {
    this.__handlers = []
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    try {
      this.observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        if (this.frame !== null) return
        this.frame = requestAnimationFrame(() => {
          this.frame = null
          this.__trigger(entries)
        })
      })
    } catch (err) {}
  }

  addObserver(target: Element, handler: () => void): void {
    if (!this.observer || !target) {
      return
    }
    this.observer && this.observer.observe(target)
    const { __handlers } = this
    let index = -1
    for (let i = 0; i < __handlers.length; i++) {
      if (__handlers[i] && target === __handlers[i].target) {
        index = i
      }
    }
    if (index > -1) {
      this.__handlers[index].handler.push(handler)
    } else {
      this.__handlers.push({
        target,
        handler: [handler]
      })
    }
  }

  unObserver(target: Element, _handler?: () => void): void {
    if (!target) {
      return
    }
    let i = -1
    this.__handlers.map((item, index) => {
      if (target === item.target) {
        i = index
      }
    })
    this.observer && this.observer.unobserve(target)
    i > -1 && this.__handlers.splice(i, 1)
  }

  destroyObserver(_target?: Element, _handler?: () => void): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame)
      this.frame = null
    }
    this.observer && this.observer.disconnect()
    this.observer = null
    this.__handlers = []
  }

  __runHandler(target: Element): void {
    const { __handlers } = this
    for (let i = 0; i < __handlers.length; i++) {
      if (__handlers[i] && target === __handlers[i].target) {
        __handlers[i].handler &&
          __handlers[i].handler.map((handler) => {
            try {
              handler()
            } catch (error) {
              console.error(error)
            }
          })
        break
      }
    }
  }

  __trigger(entries: ResizeObserverEntry[]): void {
    entries.map((item) => {
      this.__runHandler(item.target)
    })
  }
}

const resizeObserver = new ResizeObserverWrapper()

function addObserver(target: Element, handler: () => void): void {
  resizeObserver.addObserver(target, handler)
}

function unObserver(target: Element, handler?: () => void): void {
  resizeObserver.unObserver(target, handler)
}

function destroyObserver(target?: Element, handler?: () => void): void {
  resizeObserver.destroyObserver(target, handler)
}

export { addObserver, destroyObserver, unObserver }
