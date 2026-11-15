import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'danmu.js',
  description: '现代化 HTML5 弹幕引擎',
  base: '/danmu.js/',
  cleanUrls: true,
  themeConfig: {
    siteTitle: '› danmu.js',
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: '配置', link: '/api/options' },
      { text: 'API', link: '/api/methods' },
      { text: 'Playground', link: '/#playground' },
      {
        text: 'v1.3.0',
        items: [
          { text: '更新日志', link: 'https://github.com/ekworp/danmu.js/blob/main/CHANGELOG.md' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '播放器接入', link: '/guide/player' },
            { text: '响应式布局', link: '/guide/responsive' },
            { text: 'Video.js Demo', link: '/guide/videojs' },
            { text: 'React 接入', link: '/guide/react' },
            { text: '性能调优', link: '/guide/performance' }
          ]
        }
      ],
      '/api/': [
        {
          text: '参考',
          items: [
            { text: '配置项', link: '/api/options' },
            { text: '弹幕数据', link: '/api/comments' },
            { text: '实例方法', link: '/api/methods' },
            { text: '事件', link: '/api/events' }
          ]
        }
      ]
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
