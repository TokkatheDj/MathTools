import { describe, it, expect } from 'vitest'
import { solve, formatValue, expression, tiltFor } from './balance-math'

const side = (xs: number, num: number) => ({ xs, num })

describe('solve', () => {
  it('x + 2 = 5 gives x = 3 (the old code said 5)', () => {
    expect(solve(side(1, 2), side(0, 5))).toEqual({ kind: 'value', num: 3, den: 1 })
  })
  it('x = 5 with x alone on a pan (the old code gave no answer)', () => {
    expect(solve(side(1, 0), side(0, 5))).toEqual({ kind: 'value', num: 5, den: 1 })
  })
  it('x + 2 = 2 gives x = 0 (the old code said 2)', () => {
    expect(solve(side(1, 2), side(0, 2))).toEqual({ kind: 'value', num: 0, den: 1 })
  })
  it('x may sit on the right', () => {
    expect(solve(side(0, 10), side(2, 4))).toEqual({ kind: 'value', num: 3, den: 1 })
  })
  it('x on both sides: 3x + 1 = x + 7 gives x = 3', () => {
    expect(solve(side(3, 1), side(1, 7))).toEqual({ kind: 'value', num: 3, den: 1 })
  })
  it('fractions come out reduced: 2x = 5 gives 5/2, 4x = 2 gives 1/2', () => {
    expect(solve(side(2, 0), side(0, 5))).toEqual({ kind: 'value', num: 5, den: 2 })
    expect(solve(side(4, 0), side(0, 2))).toEqual({ kind: 'value', num: 1, den: 2 })
  })
  it('negative and fraction answers: x + 5 = 2 gives -3; x + 5 = 3x + 2 gives 3/2', () => {
    expect(solve(side(1, 5), side(0, 2))).toEqual({ kind: 'value', num: -3, den: 1 })
    expect(solve(side(1, 5), side(3, 2))).toEqual({ kind: 'value', num: 3, den: 2 })
  })
  it('the x\'s cancel: every x works, or none does', () => {
    expect(solve(side(2, 3), side(2, 3))).toEqual({ kind: 'any' })
    expect(solve(side(1, 2), side(1, 5))).toEqual({ kind: 'never' })
  })
  it('no x at all', () => {
    expect(solve(side(0, 4), side(0, 4))).toEqual({ kind: 'no-x' })
  })
})

describe('formatting', () => {
  it('formatValue', () => {
    expect(formatValue(3, 1)).toBe('3')
    expect(formatValue(-1, 2)).toBe('-1/2')
  })
  it('expression reads like the pan', () => {
    expect(expression(side(0, 0))).toBe('0')
    expect(expression(side(1, 0))).toBe('x')
    expect(expression(side(2, 5))).toBe('2x + 5')
    expect(expression(side(0, 7))).toBe('7')
  })
})

describe('tiltFor', () => {
  it('level whenever some x balances it', () => {
    expect(tiltFor(side(1, 2), side(0, 5))).toBe(0)
    expect(tiltFor(side(2, 3), side(2, 3))).toBe(0)
  })
  it('numbers decide when there is no x or the x\'s cancel', () => {
    expect(tiltFor(side(0, 1), side(0, 3))).toBe(6)
    expect(tiltFor(side(1, 5), side(1, 2))).toBe(-9)
    expect(tiltFor(side(0, 0), side(0, 50))).toBe(25)
  })
})
