import { readFileSync } from 'node:fs'
import { defineConfig } from '@rslib/core'

// 直接读取 package.json 版本
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))
const version = packageJson.version

export default defineConfig({
  lib: [
    {
      format: 'esm',
      output: {
        distPath: './dist',
        filename: {
          js: 'index.mjs'
        }
      }
    },
    {
      format: 'cjs',
      output: {
        distPath: './dist',
        filename: {
          js: 'index.cjs'
        }
      }
    },
    {
      format: 'umd',
      umdName: 'DanmuJs',
      bundle: true,
      syntax: 'es5',
      output: {
        target: 'web',
        distPath: './browser',
        globalObject: 'globalThis',
        filename: {
          js: 'index.js'
        }
      }
    }
  ],
  define: {
    __VERSION__: JSON.stringify(version)
  },
  banner: {
    js: `/* Built @${new Date().toUTCString()} */`
  },
  output: {
    target: 'web',
    sourceMap: true,
    minify: true
  },
  tools: {
    cssExtract: false,
    rspack: {
      module: {
        rules: [
          {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
          }
        ]
      },
      plugins: []
    }
  },
  plugins: []
})
