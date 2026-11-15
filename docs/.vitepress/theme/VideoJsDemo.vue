<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const video = ref<HTMLVideoElement | null>(null)
const danmuContainer = ref<HTMLElement | null>(null)
const ready = ref(false)
const status = ref('正在加载 Video.js…')
let player: any
let danmu: any
let nextId = 1

const videoSource =
  'https://vjs.zencdn.net/v/oceans.mp4'

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      if ((window as any).videojs) resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Video.js 加载失败'))
    document.head.appendChild(script)
  })
}

function createComments() {
  const texts = [
    'Video.js + danmu.js',
    '弹幕会跟随视频时间同步',
    '支持暂停、拖动和倍速播放',
    '这是一个实时 Demo',
    '试试发送一条弹幕吧'
  ]
  return Array.from({ length: 80 }, (_, index) => ({
    id: `videojs-${index}`,
    start: (index * 2.4) % 55,
    duration: 9000,
    txt: texts[index % texts.length],
    mode: 'scroll' as const
  }))
}

async function sendComment() {
  if (!danmu || !player) return
  danmu.sendComment({
    id: `live-${nextId++}`,
    start: player.currentTime() * 1000,
    duration: 9000,
    realTime: true,
    txt: '实时弹幕：Hello danmu.js ✦',
    mode: 'scroll'
  })
  status.value = '已发送实时弹幕'
}

async function sendBurst() {
  if (!danmu || !player) return
  const start = player.currentTime() * 1000
  for (let index = 0; index < 20; index++) {
    danmu.sendComment({
      id: `burst-${nextId++}`,
      start: start + index * 350,
      duration: 9000,
      txt: `批量弹幕 ${index + 1}`,
      mode: 'scroll'
    })
  }
  status.value = '已发送 20 条弹幕'
}

onMounted(async () => {
  try {
    const styleId = 'videojs-docs-style'
    if (!document.getElementById(styleId)) {
      const link = document.createElement('link')
      link.id = styleId
      link.rel = 'stylesheet'
      link.href = 'https://vjs.zencdn.net/8.23.4/video-js.css'
      document.head.appendChild(link)
    }
    await loadScript('https://vjs.zencdn.net/8.23.4/video.min.js')
    const module = await import('../../../browser/index.mjs')
    const DanmuJs = module.default
    player = (window as any).videojs(video.value, {
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'metadata'
    })
    player.src({ src: videoSource, type: 'video/mp4' })
    if (danmuContainer.value) {
      player.el().appendChild(danmuContainer.value)
      danmu = new DanmuJs({
        container: danmuContainer.value,
        player: video.value,
        comments: createComments(),
        area: { start: 0.04, end: 0.96 },
        maxVisibleBullets: 80,
        mouseControl: true,
        mouseControlPause: true
      })
      danmu.on('ready', () => {
        ready.value = true
        status.value = 'danmu.js 已就绪'
      })
      danmu.on('bullet_hover', ({ bullet }: any) => {
        danmu.freezeComment(bullet.id)
        window.setTimeout(() => danmu.restartComment(bullet.id), 3000)
      })
    }
  } catch {
    status.value = 'Video.js 加载失败，请检查网络连接'
  }
})

onUnmounted(() => {
  danmu?.destroy()
  player?.dispose()
})
</script>

<template>
  <div class="videojs-demo">
    <div class="videojs-player-shell">
      <video ref="video" class="video-js vjs-big-play-centered" playsinline />
      <div ref="danmuContainer" class="videojs-danmu-layer" />
    </div>
    <div class="videojs-toolbar">
      <span class="videojs-status"><i :class="{ ready }" />{{ status }}</span>
      <div>
        <button @click="sendComment">发送实时弹幕</button>
        <button @click="sendBurst">发送弹幕组</button>
      </div>
    </div>
  </div>
</template>
