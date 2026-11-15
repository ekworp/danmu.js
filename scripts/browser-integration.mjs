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

    const responsiveContainer = document.createElement('div')
    responsiveContainer.style.cssText =
      'display:none;position:relative;width:400px;height:200px'
    document.body.appendChild(responsiveContainer)
    const responsiveComment = {
      id: 'responsive-comment',
      start: 0,
      duration: 9000,
      mode: 'scroll',
      txt: 'responsive'
    }
    const responsiveDanmu = new window.DanmuJs({
      container: responsiveContainer,
      comments: [responsiveComment],
      defaultOff: true,
      responsiveFontSize: { min: 12, max: 24 }
    })
    const responsiveBaseWhenHidden = responsiveDanmu._responsiveFontSizeBase
    responsiveContainer.style.display = 'block'
    responsiveDanmu.resize()
    const responsiveBaseWhenVisible = responsiveDanmu._responsiveFontSizeBase
    const responsiveFontAtBase =
      responsiveDanmu.config.comments[0]?.style?.fontSize
    responsiveContainer.style.width = '100px'
    responsiveDanmu.resize()
    const responsiveFontAtMin =
      responsiveDanmu.config.comments[0]?.style?.fontSize
    responsiveContainer.style.width = '800px'
    responsiveContainer.style.height = '400px'
    responsiveDanmu.resize()
    const responsiveFontAtFullscreen =
      responsiveDanmu.config.comments[0]?.style?.fontSize
    const responsiveChannelAtFullscreen =
      responsiveDanmu.config.channelSize
    const appendedComment = {
      id: 'responsive-appended',
      start: 0,
      duration: 9000,
      mode: 'scroll',
      txt: 'appended'
    }
    responsiveDanmu.sendComment(appendedComment)
    const appendedFontSize = appendedComment.style?.fontSize
    const updatedComment = {
      id: 'responsive-updated',
      start: 0,
      duration: 9000,
      mode: 'scroll',
      txt: 'updated'
    }
    responsiveDanmu.updateComments([updatedComment], false)
    const updatedFontSize =
      responsiveDanmu.main.data.find((item) => item.id === updatedComment.id)
        ?.style?.fontSize

    const verticalContainer = document.createElement('div')
    verticalContainer.style.cssText =
      'display:none;position:relative;width:400px;height:200px'
    document.body.appendChild(verticalContainer)
    const verticalDanmu = new window.DanmuJs({
      container: verticalContainer,
      comments: [],
      direction: 'b2t',
      defaultOff: true,
      responsiveFontSize: { min: 10, max: 24 }
    })
    const verticalBaseWhenHidden = verticalDanmu._responsiveFontSizeBase
    verticalContainer.style.display = 'block'
    verticalDanmu.resize()
    const verticalBaseWhenVisible = verticalDanmu._responsiveFontSizeBase
    verticalContainer.style.width = '1200px'
    verticalContainer.style.height = '400px'
    verticalDanmu.resize()
    const verticalFontAfterResize = verticalDanmu.config.channelSize
    responsiveDanmu.destroy()
    verticalDanmu.destroy()
    responsiveContainer.remove()
    verticalContainer.remove()

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
      responsiveBaseWhenHidden,
      responsiveBaseWhenVisible,
      responsiveFontAtBase,
      responsiveFontAtMin,
      responsiveFontAtFullscreen,
      responsiveChannelAtFullscreen,
      appendedFontSize,
      updatedFontSize,
      verticalBaseWhenHidden,
      verticalBaseWhenVisible,
      verticalFontAfterResize,
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
  assert.equal(result.responsiveBaseWhenHidden, 0)
  assert.equal(result.responsiveBaseWhenVisible, 400)
  assert.equal(result.responsiveFontAtBase, '16px')
  assert.equal(result.responsiveFontAtMin, '12px')
  assert.equal(result.responsiveFontAtFullscreen, '24px')
  assert.equal(result.responsiveChannelAtFullscreen, 30)
  assert.equal(result.appendedFontSize, '24px')
  assert.equal(result.updatedFontSize, '24px')
  assert.equal(result.verticalBaseWhenHidden, 0)
  assert.equal(result.verticalBaseWhenVisible, 200)
  assert.equal(result.verticalFontAfterResize, 30)
  assert.equal(result.syncInitial, 'idle')
  assert.equal(result.syncStarted, 'playing')
  assert.equal(result.remainingNodes, 0)
  console.log('Browser integration checks passed')
  await context.close()
} finally {
  server.kill()
}
