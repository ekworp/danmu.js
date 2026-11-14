import { describe, expect, it, vi } from 'vitest'
import {
  addPlayerListener,
  getPlayerCurrentTime,
  getPlayerPlaybackRate,
  removePlayerListener
} from './player'

describe('player adapter helpers', () => {
  it('reads method-based media values with the player as this', () => {
    const player = {
      time: 12,
      rate: 1.5,
      currentTime() {
        return this.time
      },
      playbackRate() {
        return this.rate
      }
    }

    expect(getPlayerCurrentTime(player)).toBe(12)
    expect(getPlayerPlaybackRate(player)).toBe(1.5)
  })

  it('supports event-emitter style adapters', () => {
    const on = vi.fn()
    const off = vi.fn()
    const player = { on, off }
    const handler = vi.fn() as EventListener

    expect(addPlayerListener(player, 'playing', handler)).toBe(true)
    expect(removePlayerListener(player, 'playing', handler)).toBe(true)
    expect(on).toHaveBeenCalledWith('playing', handler)
    expect(off).toHaveBeenCalledWith('playing', handler)
  })
})
