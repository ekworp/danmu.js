# Changelog

## 1.4.0 · 2026-11-15

### Added

- Added a VitePress documentation site with GitHub Pages deployment.
- Added English and Simplified Chinese documentation routes with browser-language detection.
- Added an interactive Playground with live danmaku configuration.
- Added a full Video.js demo with media synchronization and complete controls.
- Added React integration, responsive layout, performance, and Video.js guides.
- Added automatically generated public TypeScript definitions documentation.
- Added local search, edit links, last-updated timestamps, SEO metadata, and a sitemap.

### Changed

- Made English the default documentation language and localized the Chinese navigation.
- Lazy-loaded the Playground component to reduce the initial documentation bundle.
- Improved mobile controls and runtime metrics in the Video.js demo.
- Reorganized the changelog into the VitePress documentation site.
- Changed the default comment `duration` from `5000ms` to `9000ms`.
- Stopped publishing JavaScript and declaration source maps to reduce package size.
- Replaced the legacy `demo/` pages with the VitePress documentation and embedded demos.

### CI

- Unified documentation workflows on Node.js 24.
- Removed duplicate source checks and documentation builds between workflows.
- Added documentation builds to CI and Artifact-based GitHub Pages deployment.
- Added package version and release tag validation before publishing.
- Added automatic GitHub Release creation for version tags.

### Fixed

- Restored responsive font sizing when a danmaku container starts at
  `display: none` and later becomes visible, including xgplayer containers.
- Re-established the responsive baseline when `resize()` or
  `ResizeObserver` first sees non-zero dimensions.
- Corrected responsive sizing for horizontal directions using width and
  vertical directions using height.
- Preserved `responsiveFontSize.min` and `responsiveFontSize.max` limits.
- Applied the current responsive font configuration to comments added through
  `sendComment()` and `updateComments()`.
- Fixed configuration merging when an object-valued option such as
  `responsiveFontSize: { min, max }` overrides a boolean default.
- Added regression coverage for hidden containers, fullscreen resizing,
  direction changes, font limits, and dynamic comments.
- Fixed the Video.js demo source loading, player control hit area, and
  fullscreen-safe danmaku layer.

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
