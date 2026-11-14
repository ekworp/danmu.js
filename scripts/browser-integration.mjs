import { strict as assert } from 'node:assert'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { chromium } from 'playwright'

const port = 4174
const userDataDir = join(process.cwd(), '.cache', 'playwright', 'integration')
const server =
  process.platform === 'win32'
    ? spawn(process.env.ComSpec, ['/d', '/s', '/c', `pnpm exec serve ./ -l ${port}`], {
        stdio: 'ignore'
      })
    : spawn('pnpm', ['exec', 'serve', './', '-l', String(port)], {
        stdio: 'ignore'
      })

try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(`http://127.0.0.1:${port}/scripts/browser-bench.html`)
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    ...(process.env.BROWSER === 'chromium' ? {} : { channel: 'msedge' })
  })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:${port}/scripts/browser-bench.html`)
  await page.waitForFunction(() => window.__danmuBenchReady === true)

  const result = await page.evaluate(async () => {
    const container = document.createElement('div')
    container.style.cssText = 'position:relative;width:1280px;height:360px'
    document.body.appendChild(container)
    const danmu = new window.DanmuJs({
      container,
      comments: [],
      defaultOff: true,
      area: { start: 0.02, end: 1 },
      player: { currentTime: 0 }
    })
    let resized = false
    let destroyed = false
    danmu.on('channel_resize', () => {
      resized = true
    })
    danmu.on('destroy', () => {
      destroyed = true
    })
    danmu.resize()
    danmu.start()
    danmu.sendComment({
      id: 'integration-comment',
      start: 0,
      duration: 5000,
      mode: 'scroll',
      realTime: true,
      txt: 'integration'
    })
    await new Promise(requestAnimationFrame)
    const started = danmu.status
    const rendered = danmu.state.bullets.length
    const topBefore = Number.parseFloat(container.children[0]?.style.top || '0')
    danmu.setFontSize(20, 24)
    const topAfter = Number.parseFloat(container.children[0]?.style.top || '0')
    const syncContainer = document.createElement('div')
    syncContainer.style.cssText = 'position:relative;width:640px;height:180px'
    document.body.appendChild(syncContainer)
    let mediaTime = 0
    let mediaRate = 1
    const mediaHandlers = new Map()
    const adapter = {
      currentTime: () => mediaTime,
      playbackRate: () => mediaRate,
      on(event, handler) {
        mediaHandlers.set(event, handler)
      },
      off(event) {
        mediaHandlers.delete(event)
      }
    }
    const syncDanmu = new window.DanmuJs({
      container: syncContainer,
      comments: [],
      defaultOff: true,
      player: adapter
    })
    const syncInitial = syncDanmu.status
    mediaHandlers.get('playing')?.()
    const syncStarted = syncDanmu.status
    mediaTime = 10
    mediaHandlers.get('seeking')?.()
    mediaRate = 2
    mediaHandlers.get('ratechange')?.()
    syncDanmu.destroy()
    syncContainer.remove()
    danmu.pause()
    const paused = danmu.status
    danmu.play()
    const played = danmu.status
    danmu.stop()
    const stopped = danmu.status
    danmu.destroy()

    return {
      stylesInjected: document.querySelector('[data-danmu-js-style]') !== null,
      resized,
      destroyed,
      started,
      paused,
      played,
      stopped,
      rendered,
      topBefore,
      topAfter,
      syncInitial,
      syncStarted,
      remainingNodes: container.children.length
    }
  })

  assert.equal(result.resized, true)
  assert.equal(result.stylesInjected, true)
  assert.equal(result.destroyed, true)
  assert.equal(result.started, 'playing')
  assert.equal(result.paused, 'paused')
  assert.equal(result.played, 'playing')
  assert.equal(result.stopped, 'closed')
  assert.equal(result.rendered, 1)
  assert.ok(result.topBefore > 0)
  assert.ok(result.topAfter > 0)
  assert.equal(result.syncInitial, 'idle')
  assert.equal(result.syncStarted, 'playing')
  assert.equal(result.remainingNodes, 0)
  console.log('Browser integration checks passed')
  await context.close()
} finally {
  server.kill()
}
