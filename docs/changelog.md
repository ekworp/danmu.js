# 更新日志

## 1.3.0 · 2026-11-14

### Added

- Migrated the source code to TypeScript with stricter public types.
- Added ESM, CommonJS, and standalone browser ESM builds.
- Added native media and Video.js-compatible player adapters.
- Added synchronization for `playing`, `pause`, `seeking`, `seeked`,
  `timeupdate`, and `ratechange` media events.
- Added opt-in playback-rate synchronization with `syncPlaybackRate`.
- Added stale-comment handling with `dropStaleComments`.
- Added responsive font and channel sizing.
- Added adaptive visible-comment scheduling with time-window proportional
  sampling and automatic cleanup of off-screen bullets.
- Added browser integration tests, media adapter tests, and browser
  performance benchmarks.
- Added the Video.js demo with dense randomized timed comments, playback
  controls, fullscreen support, and responsive layout testing.
- Added scoped npm package metadata for `@ekworp/danmu.js`.
- Added GitHub Actions CI and npm staging workflow.

### Changed

- Switched the build tool from Rslib to tsdown.
- Made `defaultOff` default to `true`.
- Made `needResizeObserver`, `responsiveFontSize`, and the default channel
  size active by default.
- Set the default danmu style to 16px black text with a white outline and
  shadow.
- Changed the default visible-bullet limit to `Infinity`; applications with
  dense danmu should configure a finite `maxVisibleBullets` value.
- Improved seek reset, media-time scheduling, track reflow, and bullet
  position preservation.
- Replaced the old default demo page with the Video.js demo.

### Removed

- Removed the `maxBulletsPerTick` configuration option in favor of adaptive
  scheduling based on track availability, bullet duration, and visible
  capacity.
