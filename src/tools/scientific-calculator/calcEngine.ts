import * as math from 'mathjs'

// The keypad's functions, given to mathjs by name (a scope entry overrides mathjs's own).
// Until Oct 2026 the engine rewrote the TEXT instead, and got four buttons wrong:
//   - "log(" was mathjs's NATURAL log, so log(100) showed 4.605 instead of 2
//   - "ln(" and "√(" don't exist in mathjs, so those buttons always said Error
//   - degrees mode turned sin( into sin(pi/180*, converting only the first number:
//     sin(30+60) gave -0.74 instead of 1
// and cos(90°) showed 6.12e-17 (floating-point noise) where a calculator shows 0.
const NOISE = 1e-12
const clean = (v: number) => (Math.abs(v) < NOISE ? 0 : v)

function keypad(angleMode: 'DEG' | 'RAD') {
  const toRad = (x: number) => (angleMode === 'DEG' ? (x * Math.PI) / 180 : x)
  return new Map<string, unknown>([
    ['sin', (x: number) => clean(Math.sin(toRad(x)))],
    ['cos', (x: number) => clean(Math.cos(toRad(x)))],
    ['tan', (x: number) => {
      if (clean(Math.cos(toRad(x))) === 0) throw new Error('tan is undefined here') // tan(90°)
      return clean(Math.tan(toRad(x)))
    }],
    ['log', (x: number) => Math.log10(x)], // the "log" key: base 10
    ['ln', (x: number) => Math.log(x)],    // the "ln" key: base e
  ])
}

export function evaluate(expression: string, angleMode: 'DEG' | 'RAD'): string {
  try {
    const expr = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')

    const result = math.evaluate(expr, keypad(angleMode))
    if (typeof result === 'number') {
      if (!isFinite(result)) return 'Error'
      return math.format(clean(result), { notation: 'auto', precision: 10 })
    }
    return String(result)
  } catch {
    return 'Error'
  }
}
