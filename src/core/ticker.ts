export type TickCallback = () => void

/** Owns the polling lifecycle used to feed comments into the render queue. */
export class Ticker {
  private timer: ReturnType<typeof setTimeout> | null = null
  private callback: TickCallback | null = null

  start(callback: TickCallback, interval = 250): void {
    this.stop()
    this.callback = callback

    const tick = () => {
      if (!this.callback) return
      this.callback()
      this.timer = setTimeout(tick, interval)
    }

    tick()
  }

  stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.callback = null
  }
}
