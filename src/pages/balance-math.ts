// The algebra behind the Balance Scale, kept free of React so it can be tested.
// Each pan holds some x-weights and some number weights: `xs` of them, and
// numbers adding up to `num`. The scale reads as the equation
//   left.xs·x + left.num = right.xs·x + right.num

export interface Side { xs: number; num: number }

export type Solution =
  | { kind: 'no-x' }                          // plain numbers only
  | { kind: 'value'; num: number; den: number } // x = num/den, reduced, den > 0
  | { kind: 'any' }                           // true for every x
  | { kind: 'never' }                         // no x balances it

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export function solve(left: Side, right: Side): Solution {
  if (left.xs === 0 && right.xs === 0) return { kind: 'no-x' }
  // Move the x's to the left and the numbers to the right: (a)x = b
  const a = left.xs - right.xs
  const b = right.num - left.num
  if (a === 0) return b === 0 ? { kind: 'any' } : { kind: 'never' }
  const sign = a < 0 ? -1 : 1
  const g = gcd(b, a)
  return { kind: 'value', num: (sign * b) / g, den: Math.abs(a) / g }
}

export function formatValue(num: number, den: number): string {
  return den === 1 ? String(num) : `${num}/${den}`
}

/** "2x + 5", "x", "5", "0" — how one pan reads as an expression. */
export function expression(side: Side): string {
  const parts: string[] = []
  if (side.xs > 0) parts.push(side.xs === 1 ? 'x' : `${side.xs}x`)
  if (side.num > 0 || parts.length === 0) parts.push(String(side.num))
  return parts.join(' + ')
}

/**
 * Beam angle in degrees (positive = right side down). With an x on the scale the
 * beam sits level whenever some x balances it, since that x is the answer.
 */
export function tiltFor(left: Side, right: Side): number {
  const s = solve(left, right)
  if (s.kind === 'value' || s.kind === 'any') return 0
  // No x, or the x's cancel ("never"): the numbers alone decide which way it tips.
  return Math.max(-25, Math.min(25, (right.num - left.num) * 3))
}
