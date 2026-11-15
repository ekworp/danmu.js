import { defineConfig } from 'vitepress'

const navEn = [
  { text: 'Guide', link: '/guide/quick-start' },
  { text: 'Config', link: '/api/options' },
  { text: 'API', link: '/api/methods' },
  { text: 'Playground', link: '/#playground' },
  { text: 'Changelog', link: '/changelog' },
  { text: 'v1.3.0', items: [{ text: 'GitHub', link: 'https://github.com/ekworp/danmu.js' }] }
]

const sidebarEn = {
  '/guide/': [
    {
      text: 'Guide',
      items: [
        { text: 'Quick start', link: '/guide/quick-start' },
        { text: 'Player integration', link: '/guide/player' },
        { text: 'Responsive layout', link: '/guide/responsive' },
        { text: 'Video.js Demo', link: '/guide/videojs' },
        { text: 'React integration', link: '/guide/react' },
        { text: 'Performance', link: '/guide/performance' }
      ]
    }
  ],
  '/api/': [
    {
      text: 'Reference',
      items: [
        { text: 'Configuration', link: '/api/options' },
        { text: 'Comment data', link: '/api/comments' },
        { text: 'Type definitions', link: '/api/generated' },
        { text: 'Instance methods', link: '/api/methods' },
        { text: 'Events', link: '/api/events' }
      ]
    }
  ]
}

const navZh = [
  { text: '指南', link: '/zh/guide/quick-start' },
  { text: '配置', link: '/zh/api/options' },
  { text: 'API', link: '/zh/api/methods' },
  { text: 'Playground', link: '/zh/#playground' },
  { text: '更新日志', link: '/zh/changelog' },
  { text: 'v1.3.0', items: [{ text: 'GitHub', link: 'https://github.com/ekworp/danmu.js' }] }
]

const sidebarZh = {
  '/zh/guide/': [
    {
      text: '开始使用',
      items: [
        { text: '快速开始', link: '/zh/guide/quick-start' },
        { text: '播放器接入', link: '/zh/guide/player' },
        { text: '响应式布局', link: '/zh/guide/responsive' },
        { text: 'Video.js Demo', link: '/zh/guide/videojs' },
        { text: 'React 接入', link: '/zh/guide/react' },
        { text: '性能调优', link: '/zh/guide/performance' }
      ]
    }
  ],
  '/zh/api/': [
    {
      text: '参考',
      items: [
        { text: '配置项', link: '/zh/api/options' },
        { text: '弹幕数据', link: '/zh/api/comments' },
        { text: '类型定义', link: '/zh/api/generated' },
        { text: '实例方法', link: '/zh/api/methods' },
        { text: '事件', link: '/zh/api/events' }
      ]
    }
  ]
}

export default defineConfig({
  title: 'danmu.js',
  description: 'Modern HTML5 danmaku engine',
  base: '/danmu.js/',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://ekworp.github.io/danmu.js/'
  },
  head: [
    ['meta', { name: 'theme-color', content: '#2f9c68' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'danmu.js · HTML5 Danmaku Engine' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'A modern, high-performance HTML5 danmaku engine.'
      }
    ],
    ['meta', { property: 'og:image', content: 'https://ekworp.github.io/danmu.js/hero.svg' }]
  ],
  locales: {
    root: { label: 'English', lang: 'en' },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: navZh,
        sidebar: sidebarZh
      }
    }
  },
  themeConfig: {
    siteTitle: '› danmu.js',
    nav: navEn,
    sidebar: sidebarEn,
    lastUpdated: true,
    lastUpdatedText: 'Last updated',
    editLink: {
      pattern: 'https://github.com/ekworp/danmu.js/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ekworp/danmu.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@ekworp/danmu.js' }
    ],
    footer: {
      message: 'Built for the moving web',
      copyright: 'Released under the MIT License.'
    },
    search: { provider: 'local' },
    outline: 'deep'
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
