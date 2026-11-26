// Maths for Number Line and Place Value (tested in number-math.test.ts).

// ---------- Number Line ----------

// Zoom the visible range about its centre: in = 2 fewer units each side (at least 2 each side),
// out = 2 more (at most 50 each side). Same steps the page always used.
export function zoomRange(min: number, max: number, dir: 'in' | 'out'): { min: number; max: number } {
  const center = Math.round((min + max) / 2)
  const half = Math.round((max - min) / 2)
  if (dir === 'in' && half > 2) { const h = Math.max(2, half - 2); return { min: center - h, max: center + h } }
  if (dir === 'out' && half < 50) { const h = half + 2; return { min: center - h, max: center + h } }
  return { min, max }
}

// Keep a marker on the visible line. Before Nov 2026 zooming in left markers outside the new
// range: they were drawn past the end of the line and clipped, while the list still showed them.
export function clampToRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Which whole numbers get a label so that at most about 20 labels show.
export function labelEvery(min: number, max: number): number {
  return Math.max(1, Math.ceil((max - min) / 20))
}

// ---------- Place Value ----------

export const PLACES = [100000, 10000, 1000, 100, 10, 1]

// Digits of a whole number 0..999999, one per place (hundred thousands down to ones).
export function decomposeNumber(n: number): number[] {
  let rem = n
  return PLACES.map(place => { const d = Math.floor(rem / place); rem %= place; return d })
}

// Read what was typed into the decompose box. Before Nov 2026 it silently changed the number:
// 1500000 became 999999, 12.7 became 12 and -5 became 0. Now it says why instead.
export function readPlaceValueInput(text: string): { value: number } | { error: string } {
  const s = text.trim()
  if (s === '') return { error: 'Type a number first.' }
  const n = Number(s)
  if (!Number.isFinite(n)) return { error: 'That is not a number.' }
  if (n < 0) return { error: 'Use a number that is 0 or more.' }
  if (!Number.isInteger(n)) return { error: 'Use a whole number (no decimals) for these place value blocks.' }
  if (n > 999999) return { error: 'The chart goes up to 999,999. Try a smaller number.' }
  return { value: n }
}

// The total shown by the blocks: each count times its place.
export function placeValueTotal(counts: number[]): number {
  return counts.reduce((sum, c, i) => sum + c * PLACES[i], 0)
}
