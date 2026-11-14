export type TickCallback = () => void

/** Owns the polling lifecycle used to feed comments into the render queue. */
export class Ticker {
  private timer: ReturnType<typeof setTimeout> | null = null
  private frame: number | null = null
  private callback: TickCallback | null = null

  start(callback: TickCallback, interval = 250): void {
    this.stop()
    this.callback = callback

    let lastTick = -Infinity
    const tick = (timestamp = Date.now()) => {
      if (!this.callback) return
      if (timestamp - lastTick >= interval) {
        lastTick = timestamp
        this.callback()
      }
      if (typeof requestAnimationFrame === 'function') {
        this.frame = requestAnimationFrame(tick)
      } else {
        this.timer = setTimeout(() => tick(Date.now()), interval)
      }
    }

    tick()
  }

  stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.frame !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.frame)
      this.frame = null
    }
    this.callback = null
  }
}
