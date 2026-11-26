import { describe, it, expect } from 'vitest'
import { buildExpr, removeZeroPairs, spinnerSectorIndex, startFace, tally, type PlacedTile, type TileType, type TileSign } from './tiles-probability-math'

let n = 0
const tile = (type: TileType, sign: TileSign, zone: 'left' | 'right' = 'left'): PlacedTile => ({ id: `t${n++}`, type, sign, zone })

describe('Algebra Tiles expressions', () => {
  it('x² and two −x and three units: x² − 2x + 3', () => {
    expect(buildExpr([tile('x2', 1), tile('x', -1), tile('x', -1), tile('unit', 1), tile('unit', 1), tile('unit', 1)], 'left')).toBe('x² − 2x + 3')
  })
  it('a +x and a −x cancel to 0', () => expect(buildExpr([tile('x', 1), tile('x', -1)], 'left')).toBe('0'))
  it('leading negative: −x² − 1', () => expect(buildExpr([tile('x2', -1), tile('unit', -1)], 'left')).toBe('−x² − 1'))
  it('only counts its own side', () => expect(buildExpr([tile('x', 1, 'left'), tile('unit', 1, 'right')], 'right')).toBe('1'))
  it('removing zero pairs keeps the expression the same and leaves no pairs', () => {
    const tiles = [tile('x', 1), tile('x', -1), tile('x', 1), tile('unit', -1), tile('unit', 1), tile('unit', 1)]
    const left = removeZeroPairs(tiles)
    expect(buildExpr(left, 'left')).toBe(buildExpr(tiles, 'left'))
    expect(left.length).toBe(2)
  })
  it('does not pair tiles across the equals sign', () => {
    expect(removeZeroPairs([tile('x', 1, 'left'), tile('x', -1, 'right')]).length).toBe(2)
  })
})

describe('Probability', () => {
  it('spinner: no turn is A; a 45° clockwise turn puts D under the pointer; 135° puts C', () => {
    expect(spinnerSectorIndex(0, 4)).toBe(0)
    expect(spinnerSectorIndex(45, 4)).toBe(3)
    expect(spinnerSectorIndex(135, 4)).toBe(2)
    expect(spinnerSectorIndex(225 + 360 * 5, 4)).toBe(1)
  })
  it('spinner: each of the 4 sectors gets a quarter of the turns', () => {
    const counts = [0, 0, 0, 0]
    for (let a = 0.5; a < 360; a += 1) counts[spinnerSectorIndex(a, 4)]++
    expect(counts).toEqual([90, 90, 90, 90])
  })
  it('start faces match the NEW mode (Dice starts at 1, not "H")', () => {
    expect(startFace('coin')).toBe('H')
    expect(startFace('dice')).toBe('1')
    expect(startFace('spinner')).toBe('A')
  })
  it('tally counts and percents in order', () => {
    expect(tally(['T', 'H', 'H', 'T', 'H'])).toEqual([{ name: 'H', count: 3, pct: 60 }, { name: 'T', count: 2, pct: 40 }])
  })
})
