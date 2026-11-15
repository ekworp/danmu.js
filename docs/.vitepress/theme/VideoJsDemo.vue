<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const video = ref<HTMLVideoElement | null>(null)
const danmuContainer = ref<HTMLElement | null>(null)
const commentText = ref('Video.js 实时弹幕')
const opacity = ref(1)
const fontSize = ref(16)
const duration = ref(10000)
const areaStart = ref(0.02)
const areaEnd = ref(0.98)
const hideType = ref('scroll')
const ready = ref(false)
const status = ref('正在加载 Video.js…')
const currentTime = ref(0)
const bulletCount = ref(0)
let player: any
let danmu: any
let nextId = 1
let danmuStarted = false
let monitor: number | undefined

const videoSource =
  'https://s1.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4'

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if ((window as any).videojs) {
        resolve()
      } else {
        existing.addEventListener('load', () => resolve(), { once: true })
      }
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Video.js 加载失败'))
    document.head.appendChild(script)
  })
}

function formatTimestamp(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function randomText() {
  const seed = '弹幕测试视频播放效果观察滚动全屏暂停继续随机文字'
  const length = 4 + Math.floor(Math.random() * 12)
  return Array.from({ length }, () => seed[Math.floor(Math.random() * seed.length)]).join('')
}

function createComments() {
  const starts = Array.from({ length: 1000 }, () => Math.random() * 60000)
    .sort((left, right) => left - right)
  starts[0] = 0
  starts[starts.length - 1] = 60000
  return starts.map((start, index) => ({
    id: `default-${index}`,
    start,
    duration: 9000,
    txt: `${formatTimestamp(start)} ${randomText()}`,
    mode: 'scroll' as const
  }))
}

function updateStatus(message: string) {
  status.value = message
  updateMonitor()
}

function updateMonitor(time = player?.currentTime?.() ?? 0) {
  currentTime.value = time
  bulletCount.value = danmu?.state?.bullets?.length ?? 0
}

function control(method: 'start' | 'pause' | 'play' | 'stop', message: string) {
  danmu?.[method]()
  if (method === 'start') danmuStarted = true
  updateStatus(message)
}

function sendComment(text = commentText.value) {
  if (!danmu || !player) return
  danmu.sendComment({
    id: `comment-${nextId++}`,
    start: player.currentTime() * 1000,
    duration: 8000,
    realTime: true,
    txt: text || '实时弹幕',
    style: { color: '#000' }
  })
  updateStatus('已发送弹幕')
}

function sendBurst() {
  if (!danmu || !player) return
  const start = player.currentTime() * 1000
  const seed = '批量弹幕测试海浪风景视频ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let index = 0; index < 100; index++) {
    const length = 6 + Math.floor(Math.random() * 30)
    const text = Array.from({ length }, (_, charIndex) => {
      return seed[(index + charIndex) % seed.length]
    }).join('')
    danmu.sendComment({
      id: `burst-${nextId++}`,
      start: start + index * 300,
      duration: 10000,
      txt: text,
      style: { color: '#000' }
    })
  }
  updateStatus('已发送 100 条弹幕')
}

function sendPrior() {
  if (!danmu || !player) return
  danmu.sendComment({
    id: `prior-${nextId++}`,
    start: player.currentTime() * 1000,
    duration: 5000,
    realTime: true,
    prior: true,
    noDiscard: true,
    txt: '优先弹幕：Video.js 测试',
    style: { color: '#000', border: '1px solid #f00' }
  })
  updateStatus('已发送优先弹幕')
}

function setOpacity() {
  danmu?.setOpacity(opacity.value)
  updateStatus('已更新透明度')
}

function setFontSize() {
  if (fontSize.value > 0) {
    danmu?.setFontSize(fontSize.value, fontSize.value + 4)
    updateStatus('已更新字体大小')
  }
}

function setDuration() {
  if (duration.value > 0) {
    danmu?.setAllDuration('scroll', duration.value)
    updateStatus('已更新滚动时长')
  }
}

function setArea() {
  if (areaStart.value >= 0 && areaEnd.value >= areaStart.value) {
    danmu?.setArea({ start: areaStart.value, end: areaEnd.value })
    updateStatus('已更新弹幕区域')
  }
}

function hideDanmu() {
  danmu?.hide(hideType.value)
  updateStatus('已隐藏弹幕类型')
}

function showDanmu() {
  danmu?.show(hideType.value)
  updateStatus('已显示弹幕类型')
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
      preload: 'auto',
      sources: [{ src: videoSource, type: 'video/mp4' }]
    })
    player.on('error', () => {
      status.value = '视频加载失败，请检查视频源或网络连接'
    })
    player.on('play', () => {
      if (!danmuStarted) control('start', '弹幕已开始')
      else control('play', '弹幕已继续')
    })
    player.on('pause', () => control('pause', '弹幕已暂停'))
    player.on('ended', () => control('stop', '弹幕已停止'))

    if (danmuContainer.value) {
      player.el().appendChild(danmuContainer.value)
      danmu = new DanmuJs({
        container: danmuContainer.value,
        player: video.value,
        mouseControl: true,
        mouseControlPause: true,
        area: { start: areaStart.value, end: areaEnd.value },
        comments: createComments()
      })
      danmu.on('ready', () => {
        ready.value = true
        updateStatus('danmu.js 已就绪')
      })
      danmu.on('bullet_start', () => updateStatus('弹幕播放中'))
      danmu.on('bullet_hover', ({ bullet }: any) => {
        danmu.freezeComment(bullet.id)
        window.setTimeout(() => danmu.restartComment(bullet.id), 4000)
      })
      monitor = window.setInterval(() => updateMonitor(), 250)
    }
  } catch {
    status.value = 'Video.js 或 danmu.js 加载失败，请检查网络连接'
  }
})

onUnmounted(() => {
  if (monitor) window.clearInterval(monitor)
  danmu?.destroy()
  player?.dispose()
})
</script>

<template>
  <div class="videojs-demo">
    <div class="videojs-player-shell">
      <video ref="video" class="video-js vjs-big-play-centered" controls playsinline preload="auto">
        <source :src="videoSource" type="video/mp4">
        您的浏览器不支持 HTML5 视频播放。
      </video>
      <div ref="danmuContainer" class="videojs-danmu-layer" aria-label="弹幕区域" />
    </div>
    <div class="videojs-controls">
      <div class="videojs-control-row">
        <button @click="control('start', '弹幕已开始')">开始弹幕</button>
        <button @click="control('pause', '弹幕已暂停')">暂停弹幕</button>
        <button @click="control('play', '弹幕已继续')">继续弹幕</button>
        <button @click="control('stop', '弹幕已停止')">停止弹幕</button>
        <button @click="sendComment(`实时弹幕 ${nextId}`)">发送实时弹幕</button>
        <button @click="sendBurst">发送 100 条弹幕</button>
      </div>
      <div class="videojs-control-row">
        <input v-model="commentText" aria-label="弹幕内容">
        <button @click="sendComment()">发送弹幕</button>
        <button @click="sendPrior">发送优先弹幕</button>
      </div>
      <div class="videojs-control-row">
        <label>透明度 <input v-model.number="opacity" type="number" min="0" max="1" step="0.1"></label>
        <button @click="setOpacity">设置透明度</button>
        <label>字体 <input v-model.number="fontSize" type="number" min="10" max="64"></label>
        <button @click="setFontSize">设置字体大小</button>
        <label>时长 <input v-model.number="duration" type="number" min="1000"></label>
        <button @click="setDuration">设置滚动时长</button>
      </div>
      <div class="videojs-control-row">
        <label>区域 <input v-model.number="areaStart" type="number" min="0" max="1" step="0.05"></label>
        <label>至 <input v-model.number="areaEnd" type="number" min="0" max="1" step="0.05"></label>
        <button @click="setArea">设置弹幕区域</button>
        <select v-model="hideType" aria-label="弹幕类型">
          <option value="scroll">滚动弹幕</option>
          <option value="top">顶部弹幕</option>
          <option value="bottom">底部弹幕</option>
          <option value="color">彩色弹幕</option>
        </select>
        <button @click="hideDanmu">隐藏</button>
        <button @click="showDanmu">显示</button>
      </div>
      <div class="videojs-status">
        <i :class="{ ready }" />
        <span>{{ status }}</span>
        <span class="videojs-metrics">时间 {{ currentTime.toFixed(1) }}s · 当前弹幕 {{ bulletCount }}</span>
      </div>
    </div>
  </div>
</template>
