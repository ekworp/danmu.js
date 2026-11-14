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
    danmu.pause()
    const paused = danmu.status
    danmu.play()
    const played = danmu.status
    danmu.stop()
    const stopped = danmu.status
    danmu.destroy()

    return {
      resized,
      destroyed,
      started,
      paused,
      played,
      stopped,
      rendered,
      remainingNodes: container.children.length
    }
  })

  assert.equal(result.resized, true)
  assert.equal(result.destroyed, true)
  assert.equal(result.started, 'playing')
  assert.equal(result.paused, 'paused')
  assert.equal(result.played, 'playing')
  assert.equal(result.stopped, 'closed')
  assert.equal(result.rendered, 1)
  assert.equal(result.remainingNodes, 0)
  console.log('Browser integration checks passed')
  await context.close()
} finally {
  server.kill()
}
