import { describe, expect, it } from 'vitest'
import { validAreaLineRule } from './validator'

describe('validAreaLineRule', () => {
  it('accepts non-negative integers', () => {
    expect(validAreaLineRule(0)).toBe(true)
    expect(validAreaLineRule(3)).toBe(true)
  })

  it('rejects invalid line values', () => {
    expect(validAreaLineRule(-1)).toBe(false)
    expect(validAreaLineRule(1.5)).toBe(false)
    expect(validAreaLineRule('1')).toBe(false)
  })
})
