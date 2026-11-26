import { describe, it, expect } from 'vitest'
import { zoomRange, clampToRange, labelEvery, decomposeNumber, readPlaceValueInput, placeValueTotal } from './number-math'

describe('Number Line', () => {
  it('zooming in from -10..10 gives -8..8; out gives -12..12', () => {
    expect(zoomRange(-10, 10, 'in')).toEqual({ min: -8, max: 8 })
    expect(zoomRange(-10, 10, 'out')).toEqual({ min: -12, max: 12 })
  })
  it('stops zooming in at 2 each side and out at 50 each side', () => {
    expect(zoomRange(-2, 2, 'in')).toEqual({ min: -2, max: 2 })
    expect(zoomRange(-50, 50, 'out')).toEqual({ min: -50, max: 50 })
  })
  it('a marker at 10 is pulled onto the line when the range shrinks to -8..8', () => {
    expect(clampToRange(10, -8, 8)).toBe(8)
    expect(clampToRange(-9, -8, 8)).toBe(-8)
    expect(clampToRange(3, -8, 8)).toBe(3)
  })
  it('labels every number up to a range of 20, then every 2nd, 3rd ...', () => {
    expect(labelEvery(-10, 10)).toBe(1)
    expect(labelEvery(-20, 20)).toBe(2)
    expect(labelEvery(-50, 50)).toBe(5)
  })
})

describe('Place Value', () => {
  it('decomposes 304,519 into 3, 0, 4, 5, 1, 9', () => expect(decomposeNumber(304519)).toEqual([3, 0, 4, 5, 1, 9]))
  it('decomposes 7 and 999,999', () => {
    expect(decomposeNumber(7)).toEqual([0, 0, 0, 0, 0, 7])
    expect(decomposeNumber(999999)).toEqual([9, 9, 9, 9, 9, 9])
  })
  it('the blocks add back up to the number', () => {
    for (const n of [0, 5, 60, 708, 4321, 90009, 123456]) expect(placeValueTotal(decomposeNumber(n))).toBe(n)
  })
  it('reads whole numbers 0..999999', () => {
    expect(readPlaceValueInput(' 4321 ')).toEqual({ value: 4321 })
    expect(readPlaceValueInput('0')).toEqual({ value: 0 })
  })
  it('says why instead of silently changing the number (1500000, 12.7, -5, empty)', () => {
    expect('error' in readPlaceValueInput('1500000')).toBe(true)
    expect('error' in readPlaceValueInput('12.7')).toBe(true)
    expect('error' in readPlaceValueInput('-5')).toBe(true)
    expect('error' in readPlaceValueInput('')).toBe(true)
  })
})
