import DefaultTheme from 'vitepress/theme'
import Playground from './Playground.vue'
import VideoJsDemo from './VideoJsDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Playground', Playground)
    app.component('VideoJsDemo', VideoJsDemo)

    if (typeof window !== 'undefined') {
      const base = '/danmu.js/'
      const path = window.location.pathname
      const saved = window.localStorage.getItem('danmu-docs-language')
      const isHome = path === base || path === base.slice(0, -1)
      if (isHome && !saved && navigator.language.toLowerCase().startsWith('zh')) {
        window.location.replace(`${base}zh/`)
        return
      }

      document.addEventListener('click', (event) => {
        const target = event.target
        if (!(target instanceof Element)) return
        const link = target.closest('a')
        if (!link || link.origin !== window.location.origin) return
        if (link.pathname.startsWith(`${base}zh/`)) {
          window.localStorage.setItem('danmu-docs-language', 'zh')
        } else if (link.pathname.startsWith(base)) {
          window.localStorage.setItem('danmu-docs-language', 'en')
        }
      }, { capture: true })
    }
  }
}
