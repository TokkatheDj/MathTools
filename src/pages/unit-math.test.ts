import { describe, it, expect } from 'vitest'
import { UNITS, convertValue, readNumber, fmt, compareFractions, type Category } from './unit-math'

const idx = (cat: Category, label: string) => UNITS[cat].findIndex(u => u.label === label)
const conv = (cat: Category, from: string, to: string, v: number) => fmt(convertValue(cat, idx(cat, from), idx(cat, to), v))

describe('Unit Converter: the conversions students check by hand come out exact', () => {
  it('1 gallon = 16 cups (was 16.00000845)', () => expect(conv('Volume', 'gal', 'cup', 1)).toBe('16'))
  it('1 gallon = 4 quarts and 1 quart = 2 pints', () => {
    expect(conv('Volume', 'gal', 'qt', 1)).toBe('4')
    expect(conv('Volume', 'qt', 'pt', 1)).toBe('2')
  })
  it('1 cup = 16 tbsp = 8 fl oz; 1 tbsp = 3 tsp', () => {
    expect(conv('Volume', 'cup', 'tbsp', 1)).toBe('16')
    expect(conv('Volume', 'cup', 'fl oz', 1)).toBe('8')
    expect(conv('Volume', 'tbsp', 'tsp', 1)).toBe('3')
  })
  it('1 gallon = 3.785411784 L', () => expect(conv('Volume', 'gal', 'L', 1)).toBe('3.785411784'))
  it('1 lb = 16 oz; 1 stone = 14 lb; 1 lb = 0.45359237 kg', () => {
    expect(conv('Weight', 'lb', 'oz', 1)).toBe('16')
    expect(conv('Weight', 'st', 'lb', 1)).toBe('14')
    expect(conv('Weight', 'lb', 'kg', 1)).toBe('0.45359237')
  })
  it('1 mile = 5280 ft; 1 yd = 3 ft; 1 ft = 12 in', () => {
    expect(conv('Length', 'mi', 'ft', 1)).toBe('5280')
    expect(conv('Length', 'yd', 'ft', 1)).toBe('3')
    expect(conv('Length', 'ft', 'in', 1)).toBe('12')
  })
  it('1 acre = 43560 ft² (was 43560.05726); 1 ft² = 144 in²; 1 ha = 10000 m²', () => {
    expect(conv('Area', 'ac', 'ft²', 1)).toBe('43560')
    expect(conv('Area', 'ft²', 'in²', 1)).toBe('144')
    expect(conv('Area', 'ha', 'm²', 1)).toBe('10000')
  })
  it('60 mph = 88 ft/s; 1 knot = 1.852 km/h (was 1.8519984); 36 km/h = 10 m/s', () => {
    expect(conv('Speed', 'mph', 'ft/s', 60)).toBe('88')
    expect(conv('Speed', 'knots', 'km/h', 1)).toBe('1.852')
    expect(conv('Speed', 'km/h', 'm/s', 36)).toBe('10')
  })
  it('temperatures: 212 °F = 100 °C, -40 °F = -40 °C, 0 K = -273.15 °C, 37 °C = 98.6 °F', () => {
    expect(conv('Temperature', '°F', '°C', 212)).toBe('100')
    expect(conv('Temperature', '°F', '°C', -40)).toBe('-40')
    expect(conv('Temperature', 'K', '°C', 0)).toBe('-273.15')
    expect(conv('Temperature', '°C', '°F', 37)).toBe('98.6')
  })
  it('a round trip lands back on the start for every unit', () => {
    for (const cat of Object.keys(UNITS) as Category[]) {
      UNITS[cat].forEach((_, i) => {
        const there = convertValue(cat, i, 0, 7.25), back = convertValue(cat, 0, i, there)
        expect(back).toBeCloseTo(7.25, 9)
      })
    }
  })
})

describe('readNumber and fmt', () => {
  it('reads "2.5" but not "12abc" or empty', () => {
    expect(readNumber(' 2.5 ')).toBe(2.5)
    expect(readNumber('12abc')).toBeNaN()
    expect(readNumber('')).toBeNaN()
  })
  it('shows tiny and huge numbers in scientific form, and float noise rounded away', () => {
    expect(fmt(15.999999999999998)).toBe('16')
    expect(fmt(0.00001)).toBe('1e-5')
    expect(fmt(2.5e9)).toBe('2.5e+9')
  })
})

describe('Fraction Models comparison', () => {
  it('1/4 < 2/3, 3/4 > 2/3, 2/4 = 1/2', () => {
    expect(compareFractions(1, 4, 2, 3)).toBe('<')
    expect(compareFractions(3, 4, 2, 3)).toBe('>')
    expect(compareFractions(2, 4, 1, 2)).toBe('=')
  })
})
