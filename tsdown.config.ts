import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as {
  version: string
}

const shared = {
  entry: ['src/index.ts'],
  define: {
    __VERSION__: JSON.stringify(version)
  },
  dts: false,
  minify: true,
  sourcemap: false,
  clean: true,
  fixedExtension: true,
  outputOptions: {
    exports: 'named'
  },
  css: {
    minify: true,
    target: 'es2020'
  }
} as const

export default defineConfig([
  {
    ...shared,
    outDir: 'dist',
    format: ['esm', 'cjs'],
    platform: 'neutral'
  },
  {
    ...shared,
    outDir: 'browser',
    format: 'esm',
    platform: 'browser',
    target: 'es2020'
  }
])
