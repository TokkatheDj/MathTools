import { describe, it, expect } from 'vitest'
import { frac, lineThrough, slopeIntercept, pointSlope, describeSlope, fracDecimal, checkChallenge, makeChallenge } from './slope-math'

const P = (x: number, y: number) => ({ x, y })

describe('slope as a reduced fraction', () => {
  it('rise 3 over run 4', () => {
    expect(lineThrough(P(0, 0), P(4, 3))).toMatchObject({ kind: 'sloped', slope: { num: 3, den: 4 } })
  })
  it('reduces: rise 4, run 6 is 2/3', () => {
    expect(lineThrough(P(1, 1), P(7, 5))).toMatchObject({ slope: { num: 2, den: 3 } })
  })
  it('the minus sign goes on top, whichever point is first', () => {
    expect(lineThrough(P(0, 0), P(2, -4))).toMatchObject({ slope: { num: -2, den: 1 } })
    expect(lineThrough(P(2, -4), P(0, 0))).toMatchObject({ slope: { num: -2, den: 1 } })
    expect(frac(3, -6)).toEqual({ num: -1, den: 2 })
  })
  it('order of the points never changes the slope', () => {
    const a = P(-3, 5), b = P(6, -1)
    expect(lineThrough(a, b)).toEqual(lineThrough(b, a))
  })
  it('horizontal is slope 0, vertical is undefined, same spot is no line', () => {
    expect(lineThrough(P(-2, 3), P(5, 3))).toMatchObject({ kind: 'sloped', slope: { num: 0, den: 1 } })
    expect(lineThrough(P(4, -1), P(4, 6))).toEqual({ kind: 'vertical', x: 4 })
    expect(lineThrough(P(2, 2), P(2, 2))).toEqual({ kind: 'none' })
  })
})

describe('y-intercept', () => {
  it('whole number: through (1, 5) and (3, 9) crosses at 3', () => {
    expect(lineThrough(P(1, 5), P(3, 9))).toMatchObject({ intercept: { num: 3, den: 1 } })
  })
  it('fraction: through (1, 1) and (3, 2) crosses at 1/2', () => {
    expect(lineThrough(P(1, 1), P(3, 2))).toMatchObject({ slope: { num: 1, den: 2 }, intercept: { num: 1, den: 2 } })
  })
  it('negative fraction: through (2, 0) and (5, 2) crosses at -4/3', () => {
    expect(lineThrough(P(2, 0), P(5, 2))).toMatchObject({ slope: { num: 2, den: 3 }, intercept: { num: -4, den: 3 } })
  })
})

describe('equations read the way a teacher writes them', () => {
  it('no "1x", no "+ -", no "+ 0"', () => {
    expect(slopeIntercept(lineThrough(P(0, 0), P(1, 1)))).toBe('y = x')
    expect(slopeIntercept(lineThrough(P(0, 0), P(1, -1)))).toBe('y = -x')
    expect(slopeIntercept(lineThrough(P(0, -3), P(1, -1)))).toBe('y = 2x - 3')
    expect(slopeIntercept(lineThrough(P(0, 4), P(2, 5)))).toBe('y = (1/2)x + 4')
    expect(slopeIntercept(lineThrough(P(2, 0), P(5, 2)))).toBe('y = (2/3)x - 4/3')
    expect(slopeIntercept(lineThrough(P(0, 2), P(4, -1)))).toBe('y = -(3/4)x + 2')
  })
  it('horizontal and vertical', () => {
    expect(slopeIntercept(lineThrough(P(-2, 3), P(5, 3)))).toBe('y = 3')
    expect(slopeIntercept(lineThrough(P(4, -1), P(4, 6)))).toBe('x = 4')
  })
  it('point-slope form, signs tidied', () => {
    expect(pointSlope(lineThrough(P(-1, 2), P(1, 8)), P(-1, 2))).toBe('y - 2 = 3(x + 1)')
    expect(pointSlope(lineThrough(P(2, -3), P(4, -2)), P(2, -3))).toBe('y + 3 = (1/2)(x - 2)')
    expect(pointSlope(lineThrough(P(0, 0), P(1, -1)), P(0, 0))).toBe('y = -x')
    expect(pointSlope(lineThrough(P(0, 3), P(2, 4)), P(0, 3))).toBe('y - 3 = (1/2)x')
  })
  it('every equation shown is true for both points', () => {
    for (const [a, b] of [[P(1, 1), P(7, 5)], [P(-3, 5), P(6, -1)], [P(2, 0), P(5, 2)], [P(-4, -4), P(3, 10)]]) {
      const l = lineThrough(a, b)
      if (l.kind !== 'sloped') throw new Error('expected a sloped line')
      for (const p of [a, b]) expect(p.y * l.slope.den * l.intercept.den).toBe(l.slope.num * p.x * l.intercept.den + l.intercept.num * l.slope.den)
    }
  })
  it('words and decimal', () => {
    expect(describeSlope(lineThrough(P(0, 0), P(4, 3)))).toBe('The line goes up 3 for every 4 it goes across.')
    expect(describeSlope(lineThrough(P(0, 0), P(2, -4)))).toBe('The line goes down 2 for every 1 it goes across.')
    expect(describeSlope(lineThrough(P(4, -1), P(4, 6)))).toMatch(/undefined/)
    expect(fracDecimal(frac(2, 3))).toBe('0.67')
    expect(fracDecimal(frac(-3, 4))).toBe('-0.75')
  })
})

describe('challenges', () => {
  it('right slope through the point passes', () => {
    expect(checkChallenge({ slope: frac(2, 3), through: P(1, -2) }, P(1, -2), P(4, 0)).ok).toBe(true)
    expect(checkChallenge({ slope: frac(2, 3), through: P(1, -2) }, P(-2, -4), P(4, 0)).ok).toBe(true)   // point not dragged onto, but on the line
  })
  it('wrong slope, or right slope missing the point, says which', () => {
    expect(checkChallenge({ slope: frac(2, 3), through: P(1, -2) }, P(1, -2), P(4, 1)).why).toMatch(/slope is 1, not 2\/3/)
    expect(checkChallenge({ slope: frac(2, 3), through: P(1, -2) }, P(0, 0), P(3, 2)).why).toMatch(/misses \(1, -2\)/)
  })
  it('undefined slope means vertical through the point', () => {
    expect(checkChallenge({ slope: 'undefined', through: P(3, 1) }, P(3, -5), P(3, 7)).ok).toBe(true)
    expect(checkChallenge({ slope: 'undefined', through: P(3, 1) }, P(2, -5), P(2, 7)).ok).toBe(false)
    expect(checkChallenge({ slope: frac(1, 1), through: P(0, 0) }, P(1, 0), P(1, 5)).why).toMatch(/vertical/)
  })
  it('generated challenges stay on the grid', () => {
    let s = 7
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    for (let i = 0; i < 200; i++) {
      const c = makeChallenge(rand)
      expect(Math.abs(c.through.x)).toBeLessThanOrEqual(4)
      expect(Math.abs(c.through.y)).toBeLessThanOrEqual(4)
    }
  })
})
