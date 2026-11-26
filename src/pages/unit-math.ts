// Unit conversion maths for the Unit Converter (tested in unit-math.test.ts).
//
// Every factor is the exact legal definition. Before Nov 2026 the page used rounded factors
// (1 gal = 3.78541 L, 1 cup = 0.236588 L, 1 acre = 4046.86 m²...), so students saw
// "1 gal = 16.00000845 cup", "1 cup = 15.9999459 tbsp" and "1 acre = 43560.05726 ft²".
// US kitchen units are built down from the gallon so their ratios are exact by construction.

export type Category = 'Length' | 'Weight' | 'Temperature' | 'Volume' | 'Speed' | 'Area'

export interface UnitDef {
  label: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

// A unit that is just `size` base units.
const linear = (label: string, size: number): UnitDef => ({ label, toBase: v => v * size, fromBase: v => v / size })

const GALLON_L = 3.785411784          // 231 cubic inches, exactly
const POUND_G = 453.59237             // exactly, by the 1959 international agreement

export const UNITS: Record<Category, UnitDef[]> = {
  Length: [                           // base: metre
    linear('mm', 0.001), linear('cm', 0.01), linear('m', 1), linear('km', 1000),
    linear('in', 0.0254), linear('ft', 0.3048), linear('yd', 0.9144), linear('mi', 1609.344),
  ],
  Weight: [                           // base: gram
    linear('mg', 0.001), linear('g', 1), linear('kg', 1000), linear('t', 1e6),
    linear('oz', POUND_G / 16), linear('lb', POUND_G), linear('st', POUND_G * 14),
  ],
  Temperature: [                      // base: degree Celsius
    { label: '°C', toBase: v => v, fromBase: v => v },
    { label: '°F', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
    { label: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  ],
  Volume: [                           // base: litre
    linear('ml', 0.001), linear('L', 1), linear('m³', 1000),
    linear('tsp', GALLON_L / 768), linear('tbsp', GALLON_L / 256), linear('fl oz', GALLON_L / 128),
    linear('cup', GALLON_L / 16), linear('pt', GALLON_L / 8), linear('qt', GALLON_L / 4), linear('gal', GALLON_L),
  ],
  Speed: [                            // base: metre per second
    linear('m/s', 1), linear('km/h', 1000 / 3600), linear('mph', 1609.344 / 3600),
    linear('knots', 1852 / 3600), linear('ft/s', 0.3048),
  ],
  Area: [                             // base: square metre
    linear('mm²', 1e-6), linear('cm²', 1e-4), linear('m²', 1), linear('km²', 1e6),
    linear('in²', 0.0254 ** 2), linear('ft²', 0.3048 ** 2), linear('ac', 43560 * 0.3048 ** 2), linear('ha', 10000),
  ],
}

// Convert a number between two units of one category.
export function convertValue(category: Category, fromIdx: number, toIdx: number, value: number): number {
  const units = UNITS[category]
  return units[toIdx].fromBase(units[fromIdx].toBase(value))
}

// Read a typed number strictly: "12abc" and "" are not numbers (parseFloat read "12abc" as 12).
export function readNumber(text: string): number {
  const s = text.trim()
  return s === '' ? NaN : Number(s)
}

// Show a result: 10 significant digits, so float noise like 15.999999999999998 shows as 16.
export function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) === 0) return '0'
  if (Math.abs(n) >= 1e9 || Math.abs(n) < 1e-4) return n.toExponential(6).replace(/\.?0+e/, 'e')
  return parseFloat(n.toPrecision(10)).toString()
}

// Fraction Models' comparison of a/b with c/d, by cross-multiplying.
export function compareFractions(a: number, b: number, c: number, d: number): '<' | '=' | '>' {
  const left = a * d, right = c * b
  return left > right ? '>' : left < right ? '<' : '='
}
