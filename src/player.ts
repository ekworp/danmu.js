import type { PlayerAdapter } from './baseClass'

type PlayerValue<T> = T | (() => T)

function readValue<T>(
  owner: PlayerAdapter,
  value: PlayerValue<T> | undefined,
  fallback: T
): T {
  if (typeof value === 'function') {
    return (value as () => T).call(owner)
  }
  return value === undefined ? fallback : value
}

export function getPlayerCurrentTime(player?: PlayerAdapter): number {
  if (!player) return 0
  const value = readValue(player, player.currentTime, 0)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

export function getPlayerPlaybackRate(player?: PlayerAdapter): number {
  if (!player) return 1
  const value = readValue(player, player.playbackRate, 1)
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function addPlayerListener(
  player: PlayerAdapter,
  event: string,
  handler: EventListener
): boolean {
  if (player.addEventListener) {
    player.addEventListener(event, handler)
    return true
  }
  if (player.on) {
    player.on(event, handler as (...args: never[]) => void)
    return true
  }
  return false
}

export function removePlayerListener(
  player: PlayerAdapter,
  event: string,
  handler: EventListener
): boolean {
  if (player.removeEventListener) {
    player.removeEventListener(event, handler)
    return true
  }
  if (player.off) {
    player.off(event, handler as (...args: never[]) => void)
    return true
  }
  return false
}
