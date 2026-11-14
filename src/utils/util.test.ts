import { describe, expect, it } from 'vitest'
import { deepCopy, isNumber, typeOf } from './util'

describe('utility functions', () => {
  it('identifies values without coercion', () => {
    expect(isNumber(1)).toBe(true)
    expect(isNumber(Number.NaN)).toBe(false)
    expect(isNumber('1')).toBe(false)
    expect(typeOf([])).toBe('Array')
    expect(typeOf({})).toBe('Object')
  })

  it('deep copies nested configuration values', () => {
    const target = { area: { start: 0 }, comments: [] }
    deepCopy(target, { area: { end: 1 }, comments: [{ id: 'a' }] })

    expect(target).toEqual({
      area: { start: 0, end: 1 },
      comments: [{ id: 'a' }]
    })
  })
})
