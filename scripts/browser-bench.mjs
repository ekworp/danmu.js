import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { chromium } from 'playwright'

const port = 4173
const userDataDir = join(process.cwd(), '.cache', 'playwright', 'edge')
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
  const browser = await chromium.launchPersistentContext(userDataDir, {
    channel: 'msedge'
  })
  const page = await browser.newPage()
  page.on('console', (message) => console.log(`[browser] ${message.text()}`))
  page.on('pageerror', (error) => console.error(`[browser] ${error.message}`))
  await page.goto(`http://127.0.0.1:${port}/scripts/browser-bench.html`)
  await page.waitForFunction(() => window.__danmuBenchReady === true)

  const result = await page.evaluate(async () => {
    const run = async (count) => {
      const container = document.createElement('div')
      container.style.cssText =
        'position:relative;width:1280px;height:360px;overflow:hidden'
      document.body.appendChild(container)
      const comments = Array.from({ length: count }, (_, index) => ({
        id: `browser-${count}-${index}`,
        start: 0,
        duration: 5000,
        mode: 'scroll',
        txt: `comment-${index}`
      }))
      const danmu = new window.DanmuJs({
        container,
        comments,
        defaultOff: true,
        player: { currentTime: 0 }
      })

      await new Promise(requestAnimationFrame)
      const start = performance.now()
      danmu.start()
      await new Promise(requestAnimationFrame)
      const elapsed = performance.now() - start
      const bulletCount = container.children.length
      danmu.destroy()
      container.remove()

      return { count, elapsed, bulletCount, remainingNodes: container.children.length }
    }

    return Promise.all([run(100), run(1000), run(5000)])
  })

  console.table(
    result.map(({ count, elapsed, bulletCount, remainingNodes }) => ({
      comments: count,
      'start + layout (ms)': elapsed.toFixed(2),
      'rendered bullets': bulletCount,
      'nodes after destroy': remainingNodes
    }))
  )
  await browser.close()
} finally {
  server.kill()
}
