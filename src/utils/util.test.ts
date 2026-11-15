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

  it('replaces scalar defaults with object options', () => {
    const target = { responsiveFontSize: true }
    deepCopy(target, { responsiveFontSize: { min: 12, max: 24 } })

    expect(target).toEqual({
      responsiveFontSize: { min: 12, max: 24 }
    })
  })
})
