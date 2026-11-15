import DefaultTheme from 'vitepress/theme'
import Playground from './Playground.vue'
import VideoJsDemo from './VideoJsDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Playground', Playground)
    app.component('VideoJsDemo', VideoJsDemo)
  }
}
