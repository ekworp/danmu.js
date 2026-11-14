import { performance } from 'node:perf_hooks'

const comments = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  start: index * 1000,
  duration: 5000,
  mode: 'scroll',
  style: { color: '#fff', fontSize: '16px' }
}))

function deepCopy(value) {
  if (Array.isArray(value)) return value.map(deepCopy)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepCopy(item)])
    )
  }
  return value
}

function measure(name, callback, iterations = 100) {
  const start = performance.now()
  for (let index = 0; index < iterations; index++) callback()
  const elapsed = performance.now() - start
  console.log(`${name}: ${elapsed.toFixed(2)} ms (${iterations} iterations)`)
}

console.log('danmu.js performance baseline')
measure('copy 1,000 comments', () => deepCopy(comments), 20)
measure('sort 1,000 comments', () => {
  comments.slice().sort((left, right) => right.start - left.start)
})
