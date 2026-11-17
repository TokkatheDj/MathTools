// Slope & Lines: the maths, kept apart from the drawing so it can be tested (like balance-math.ts).
// Points sit on whole-number grid spots, so every slope and intercept is an exact fraction.

export interface Point { x: number; y: number }
export interface Frac { num: number; den: number }          // den > 0, reduced; 0 is 0/1

export type Line =
  | { kind: 'none' }                                         // both points on the same spot
  | { kind: 'vertical'; x: number }                          // run = 0: slope undefined
  | { kind: 'sloped'; slope: Frac; intercept: Frac }         // y = mx + b (horizontal is slope 0/1)

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function frac(num: number, den: number): Frac {
  if (den === 0) throw new Error('denominator 0')
  if (num === 0) return { num: 0, den: 1 }
  const g = gcd(num, den)
  const sign = den < 0 ? -1 : 1                             // the minus sign always lives on top
  return { num: (sign * num) / g, den: (sign * den) / g }
}

export const rise = (a: Point, b: Point) => b.y - a.y
export const run = (a: Point, b: Point) => b.x - a.x

export function lineThrough(a: Point, b: Point): Line {
  if (a.x === b.x && a.y === b.y) return { kind: 'none' }
  if (a.x === b.x) return { kind: 'vertical', x: a.x }
  const slope = frac(rise(a, b), run(a, b))
  // b = y - m x, with m = p/q:  (q*y - p*x) / q
  const intercept = frac(slope.den * a.y - slope.num * a.x, slope.den)
  return { kind: 'sloped', slope, intercept }
}

export function fracText(f: Frac): string {
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`
}

export function fracDecimal(f: Frac): string {
  const v = f.num / f.den
  return Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toString()
}

// "3x", "-x", "x", "(2/3)x" - never "1x" or "-1x"
function coefX(m: Frac): string {
  if (m.den === 1) return m.num === 1 ? 'x' : m.num === -1 ? '-x' : `${m.num}x`
  return m.num < 0 ? `-(${-m.num}/${m.den})x` : `(${m.num}/${m.den})x`
}

// "+ 3", "- 3", "+ 1/2", "- 1/2"; nothing for 0
function plusTerm(f: Frac): string {
  if (f.num === 0) return ''
  const abs = fracText({ num: Math.abs(f.num), den: f.den })
  return f.num < 0 ? ` - ${abs}` : ` + ${abs}`
}

export function slopeIntercept(line: Line): string {
  if (line.kind === 'none') return 'Pick two different points'
  if (line.kind === 'vertical') return `x = ${line.x}`
  const { slope: m, intercept: b } = line
  if (m.num === 0) return `y = ${fracText(b)}`
  return `y = ${coefX(m)}${plusTerm(b)}`
}

// y - y1 = m(x - x1), tidied: "y - 2 = 3(x + 1)", "y = 3x" style is left to slope-intercept form
export function pointSlope(line: Line, p: Point): string {
  if (line.kind !== 'sloped') return slopeIntercept(line)
  const m = line.slope
  const ySide = p.y === 0 ? 'y' : p.y < 0 ? `y + ${-p.y}` : `y - ${p.y}`
  if (m.num === 0) return `${ySide} = 0`
  const xSide = p.x === 0 ? 'x' : p.x < 0 ? `x + ${-p.x}` : `x - ${p.x}`
  if (xSide === 'x') return `${ySide} = ${coefX(m)}`          // "y = -x", not "y = -(x)"
  const mText = m.den === 1 ? (m.num === 1 ? '' : m.num === -1 ? '-' : String(m.num)) : `(${fracText(m)})`
  return `${ySide} = ${mText}(${xSide})`
}

export function describeSlope(line: Line): string {
  if (line.kind === 'none') return 'Two points on the same spot don\'t make a line.'
  if (line.kind === 'vertical') return 'Vertical: the run is 0, and you can\'t divide by 0, so the slope is undefined.'
  const m = line.slope
  if (m.num === 0) return 'Horizontal: the rise is 0, so the slope is 0.'
  const way = m.num > 0 ? 'goes up' : 'goes down'
  return `The line ${way} ${Math.abs(m.num)} for every ${m.den} it goes across.`
}

// ---- challenges: "make a line with slope 2/3 through (1, -2)" ----
export interface Challenge { slope: Frac | 'undefined'; through: Point }

export function checkChallenge(c: Challenge, a: Point, b: Point): { ok: boolean; why: string } {
  const line = lineThrough(a, b)
  if (line.kind === 'none') return { ok: false, why: 'Your two points are on the same spot.' }
  const onLine = (p: Point) =>
    line.kind === 'vertical' ? p.x === line.x
      : p.y * line.slope.den * line.intercept.den ===
        line.slope.num * p.x * line.intercept.den + line.intercept.num * line.slope.den
  if (c.slope === 'undefined') {
    if (line.kind !== 'vertical') return { ok: false, why: 'That line isn\'t vertical yet.' }
  } else {
    if (line.kind !== 'sloped') return { ok: false, why: 'That line is vertical; its slope is undefined.' }
    if (line.slope.num !== c.slope.num || line.slope.den !== c.slope.den)
      return { ok: false, why: `Its slope is ${fracText(line.slope)}, not ${fracText(c.slope)}.` }
  }
  if (!onLine(c.through)) return { ok: false, why: `The slope is right, but the line misses (${c.through.x}, ${c.through.y}).` }
  return { ok: true, why: 'Yes! That line works.' }
}

// A fresh challenge whose line fits on a -10..10 grid (seeded so tests can repeat it).
export function makeChallenge(rand: () => number = Math.random): Challenge {
  const slopes: (Frac | 'undefined')[] = [frac(1, 1), frac(2, 1), frac(-1, 1), frac(-3, 1), frac(1, 2), frac(2, 3),
    frac(-3, 4), frac(-1, 2), frac(3, 2), frac(0, 1), 'undefined']
  const s = slopes[Math.floor(rand() * slopes.length)]
  const through = { x: Math.floor(rand() * 9) - 4, y: Math.floor(rand() * 9) - 4 }
  return { slope: s, through }
}
