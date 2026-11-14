### 概述

运用 danmu.js 可以方便地使用弹幕功能，满足任意 Web DOM 元素使用（包括 video）。弹幕实现了顶部居中、底部居中、彩色弹幕、无遮挡滚动（具体算法参考[前端算法之弹幕设计](https://segmentfault.com/a/1190000015722802)），以及其它常用的弹幕使用方式。

### 起步

1. 安装

   ```
   $ npm install @ekworp/danmu.js
   ```

2. 使用

- Step 1:

  ```html
  <div id="vs"></div>
  <video id="mse" controls>
    <source src="demo.mp4" type="video/mp4" />
  </video>
  ```

- Step 2:

   ```js
   import DanmuJs from '@ekworp/danmu.js'

  let danmujs = new DanmuJs({
    container: document.getElementById('vs'), //弹幕容器，该容器发生尺寸变化时会自动调整弹幕行为
    containerStyle: {
      //弹幕容器样式
      zIndex: 100
    },
    player: document.getElementsByTagName('video')[0], //配合音视频元素（video或audio）同步使用时需提供该项
    comments: [
      //弹幕预存数组,配合音视频元素（video或audio）同步使用时需提供该项
      {
        duration: 20000, //弹幕持续显示时间，单位为毫秒；默认值为5000
        //moveV: 100, //弹幕匀速移动速度(单位: px/秒)，设置该项时duration无效
        id: '1', //弹幕id，需唯一
        start: 2000, //弹幕出现时间（毫秒）
        prior: true, //该条弹幕优先显示，默认false
        color: true, //该条弹幕为彩色弹幕，默认false
        txt: '长弹幕长弹幕长弹幕长弹幕长弹幕', //弹幕文字内容
        style: {
          //弹幕自定义样式
          color: '#ff9500',
          fontSize: '20px',
          padding: '2px 11px'
        },
        mode: 'top', //显示模式，top顶部居中，bottom底部居中，scroll滚动，默认为scroll
        like: {
          // 点赞相关参数
          el: likeDOM, // el 仅支持传入 dom
          style: {
            // el 绑定样式
            paddingLeft: '10px',
            color: '#ff0000'
          }
        }
        // el: DOM //直接传入一个自定义的DOM元素作为弹幕，使用该项的话会忽略所提供的txt和style
      }
    ],
    area: {
      //弹幕显示区域
      start: 0, //区域顶部到播放器顶部所占播放器高度的比例
      end: 1, //区域底部到播放器顶部所占播放器高度的比例
      lines: undefined // 弹幕虚拟轨道显示行数。当指定行数时，显示范围 start/end 不生效；当弹幕字体大小超过所需要的总虚拟轨道数时，弹幕也不会出现在轨道上，因此请设置好弹幕fontSize及影响弹幕高度的其他样式，让弹幕和轨道高度匹配
    },
     needResizeObserver: true, // 容器尺寸变化时自动重新布局
     channelSize: 20, // 默认轨道大小，responsiveFontSize 开启时会同步缩放
    mouseControl: true, // 打开鼠标控制, 打开后可监听到 bullet_hover 事件。danmu.on('bullet_hover', function (data) {})
    mouseControlPause: false, // 鼠标触摸暂停。mouseControl: true 生效
    //bOffset: 1000, // 可调节弹幕横向间隔（毫秒）
       defaultOff: true, // 初始化时不启动；播放器开始播放后自动启动
       dropStaleComments: true, // 丢弃视频当前时间之前的过期弹幕
       maxVisibleBullets: Infinity, // 默认不限制同时存在的弹幕数量
       syncPlaybackRate: false, // 是否跟随播放器倍速调整弹幕速度
     chaseEffect: true, // 开启滚动弹幕追逐效果
     responsiveFontSize: {
       min: 12, // 可选，字体最小值(px)
       max: 36 // 可选，字体最大值(px)
     } // 根据容器主方向尺寸连续缩放普通弹幕字体和轨道间距
   })
  ```

这是 danmu.js 的 npm 使用方法，示例可以参考 [DEMO](https://github.com/ekworp/danmu.js/tree/main/demo/index.html)。

当前 npm 包提供 ESM、CommonJS 和自包含现代浏览器 ESM 三种入口，并附带完整 TypeScript 声明：

```ts
import DanmuJs, {
  type CommentData,
  type DanmuConfigOptions
} from '@ekworp/danmu.js'
```

播放器可以传入原生 `HTMLMediaElement`，也可以传入兼容播放器适配器：

```ts
const player = {
  currentTime: () => video.currentTime,
  playbackRate: () => video.playbackRate,
  on: (event, handler) => video.addEventListener(event, handler),
  off: (event, handler) => video.removeEventListener(event, handler)
}
```

播放器发生 `playing`、`pause`、`seeking`、`seeked`、`timeupdate` 或 `ratechange` 时，弹幕会自动同步。

默认字体为 `16px`、黑色文字，并带有白色描边和阴影。浏览器项目建议优先使用普通 ESM 入口，由应用自己的构建工具处理依赖；需要直接通过浏览器加载时可使用 `@ekworp/danmu.js/browser`。项目不再发布 UMD/ES5 全局脚本版本。

`maxVisibleBullets` 默认为 `Infinity`。高密度弹幕场景建议主动设置有限值，例如 `200`，以控制 DOM 数量和渲染性能。

### Properties

```js
danmu.status // 主进程运行状态 'idle' | 'paused' | 'playing' | 'closed'
danmu.state : {
    status: danmu.status,
    comments: Array<CommentData>, // 弹幕数据池
    bullets: Array<Bullet>, // 在轨弹幕数据
    displayArea: { width: number, height: number } // 弹幕显示区域状态
}
```

### API

```js
danmu.start() // 初始化并播放；defaultOff 为 true 时需要手动调用
danmu.pause() //弹幕暂停
danmu.play() //弹幕继续播放
danmu.stop() //弹幕停止并消失

// 单条更新弹幕数据，适合在用户发送弹幕时调用
danmu.sendComment({
  //发送弹幕
  duration: 15000,
  id: 'id',
  start: 3000, //不提供该项则立即发送
  txt: '弹幕内容',
  style: {
    color: '#ff9500',
    fontSize: '20px',
    border: 'solid 1px #ff9500',
    borderRadius: '50px',
    padding: '5px 11px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
})

// 批量更新弹幕数据，适合在从接口中获取到批量数据时调用
danmu.updateComments([
  {
    duration: 15000,
    id: 'id',
    start: 3000, //不提供该项则立即发送
    txt: '弹幕内容',
    style: {
      color: '#ff9500',
      fontSize: '20px',
      border: 'solid 1px #ff9500',
      borderRadius: '50px',
      padding: '5px 11px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  ...
])

danmu.setCommentDuration(id, duration) //按照id改变某一个弹幕的持续显示时间
danmu.setAllDuration(mode, duration) // 改变所有弹幕的持续显示时间，包括已加入队列弹幕
danmu.setPlayRate(mode, 1) // 设置弹幕播放速率，在弹幕播放速度上乘以一个系数，控制速度的变化。支持有不同显示时长弹幕的需求
danmu.setCommentID(oldID, newID) //改变某一个弹幕的id
danmu.hide(mode) //屏蔽某一类弹幕(参数可选值 scroll | top | bottom | color)
danmu.show(mode) //显示某一类弹幕(参数可选值 scroll | top | bottom | color)
danmu.setArea(area) // 修改弹幕显示区域, 参考上方config中area的配置
danmu.setOpacity(opacity) // 设置透明度
danmu.setFontSize(size, channelSize) // 设置样式 size 为字体大小 channelSize 如果不需要修改轨道大小则无需传入 channelSize
danmu.setCommentLike(id, {
  el: likeDOM,
  style: {
    paddingLeft: '10px',
    color: '#ff0000'
  }
}) // 这是点赞样式，id 为 commentid
```

### Dev

我们为开发者提供了示例，使用方式如下：

```
$ git clone git@github.com:ekworp/danmu.js.git
$ cd danmu.js
$ pnpm install
$ pnpm run check
$ pnpm run typecheck
$ pnpm run test
$ pnpm run bench
$ pnpm run bench:browser
$ pnpm run build
$ pnpm run build:types
$ pnpm serve
```

访问 [http://localhost:3000/demo/index.html](http://localhost:3000/demo/index.html)

### License

[MIT](http://opensource.org/licenses/MIT)
