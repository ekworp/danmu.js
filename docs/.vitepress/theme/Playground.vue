<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

type Direction = 'r2l' | 'l2r' | 'b2t' | 't2b'

const container = ref<HTMLElement | null>(null)
const status = ref('ready')
const direction = ref<Direction>('r2l')
const duration = ref(9000)
const fontSize = ref(16)
const channelSize = ref(20)
const responsive = ref(true)
let danmu: any
let DanmuJs: any
let nextId = 1

const comments = [
  '欢迎来到 danmu.js Playground',
  '调整左侧配置，实时观察效果',
  '支持横向、纵向和响应式布局',
  'TypeScript · ESM · 高性能',
  '轻量而且可控的弹幕引擎'
].map((txt, index) => ({
  id: `initial-${index}`,
  start: index * 950,
  duration: 9000,
  txt,
  mode: 'scroll'
}))

const configCode = () => `{
  direction: '${direction.value}',
  duration: ${duration.value},
  channelSize: ${channelSize.value},
  responsiveFontSize: ${responsive.value ? '{ min: 12, max: 30 }' : 'false'}
}`

function createDanmu() {
  if (!container.value || !DanmuJs) return
  danmu = new DanmuJs({
    container: container.value,
    comments: comments.map((comment) => ({ ...comment })),
    direction: direction.value,
    channelSize: channelSize.value,
    responsiveFontSize: responsive.value ? { min: 12, max: 30 } : false,
    maxVisibleBullets: 60,
    defaultOff: true,
    mouseControl: true
  })
  danmu.start()
  status.value = 'playing'
}

function restart() {
  danmu?.destroy()
  createDanmu()
}

function sendComment() {
  danmu?.sendComment({
    id: `live-${nextId++}`,
    start: 0,
    duration: duration.value,
    realTime: true,
    txt: '这是一条实时弹幕 ✦',
    mode: 'scroll'
  })
  status.value = 'sent'
}

function copyConfig() {
  navigator.clipboard?.writeText(configCode())
}

watch(direction, restart)
watch(responsive, restart)
watch([fontSize, channelSize], () => {
  danmu?.setFontSize(fontSize.value, channelSize.value)
})
watch(duration, () => {
  danmu?.setAllDuration('scroll', duration.value)
})

onMounted(async () => {
  const module = await import('../../../browser/index.mjs')
  DanmuJs = module.default
  createDanmu()
})
onUnmounted(() => danmu?.destroy())
</script>

<template>
  <div class="playground">
    <div class="playground-stage">
      <div class="playground-toolbar">
        <span class="window-dot red" />
        <span class="window-dot yellow" />
        <span class="window-dot green" />
        <span class="stage-label">danmu-container</span>
        <span class="playground-status">{{ status }}</span>
      </div>
      <div ref="container" class="danmu-playground-container">
        <span class="stage-caption">LIVE / PLAYGROUND</span>
      </div>
      <div class="playground-actions">
        <button @click="danmu?.start(); status = 'playing'">开始</button>
        <button @click="danmu?.pause(); status = 'paused'">暂停</button>
        <button @click="danmu?.play(); status = 'playing'">继续</button>
        <button class="accent" @click="sendComment">发送弹幕</button>
      </div>
    </div>
    <aside class="playground-panel">
      <div class="panel-title">
        <strong>实时配置</strong>
        <span class="live-label"><i /> LIVE</span>
      </div>
      <label>
        <span>方向 <output>{{ direction }}</output></span>
        <select v-model="direction">
          <option value="r2l">r2l · 从右到左</option>
          <option value="l2r">l2r · 从左到右</option>
          <option value="b2t">b2t · 从下到上</option>
          <option value="t2b">t2b · 从上到下</option>
        </select>
      </label>
      <label>
        <span>持续时间 <output>{{ duration }} ms</output></span>
        <input v-model.number="duration" type="range" min="3000" max="15000" step="500">
      </label>
      <label>
        <span>字体大小 <output>{{ fontSize }} px</output></span>
        <input v-model.number="fontSize" type="range" min="12" max="32">
      </label>
      <label>
        <span>轨道大小 <output>{{ channelSize }} px</output></span>
        <input v-model.number="channelSize" type="range" min="14" max="40">
      </label>
      <label class="switch-row">
        <span>响应式字体</span>
        <input v-model="responsive" type="checkbox">
        <span class="switch" />
      </label>
      <div class="config-output">
        <div class="output-title">当前配置 <button @click="copyConfig">复制</button></div>
        <pre><code>{{ configCode() }}</code></pre>
      </div>
    </aside>
  </div>
</template>
