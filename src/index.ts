import DanmuJs from './danmu'
import css from './style/index.scss?inline'

if (
  typeof document !== 'undefined' &&
  !document.querySelector('[data-danmu-js-style]')
) {
  const style = document.createElement('style')
  style.setAttribute('data-danmu-js-style', '')
  style.textContent = css
  document.head.appendChild(style)
}

export type {
  CommentData,
  CommentMode,
  CommentRuntime,
  DanmuConfig,
  DanmuConfigOptions,
  DanmuEventHandler,
  DanmuEventMap,
  DanmuEventName,
  GlobalHooks,
  LikeData,
  PlayerAdapter
} from './baseClass'
export { DanmuJs as default, DanmuJs }
