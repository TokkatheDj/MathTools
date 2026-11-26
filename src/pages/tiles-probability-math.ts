// Maths for Algebra Tiles and Probability Tools (tested in tiles-probability-math.test.ts).

// ---------- Algebra Tiles ----------

export type TileType = 'unit' | 'x' | 'x2'
export type TileSign = 1 | -1
export type Zone = 'left' | 'right'
export interface PlacedTile { id: string; type: TileType; sign: TileSign; zone: Zone }

// The expression a side shows: positive and negative tiles of a kind cancel (zero pairs),
// written "x² − 2x + 3" with a proper minus sign.
export function buildExpr(tiles: PlacedTile[], zone: Zone): string {
  const net = (type: TileType) => tiles.filter(t => t.zone === zone && t.type === type).reduce((s, t) => s + t.sign, 0)
  const terms: [number, string][] = [[net('x2'), 'x²'], [net('x'), 'x'], [net('unit'), '']]
  const shown = terms.filter(([n]) => n !== 0)
  if (!shown.length) return '0'
  return shown.map(([n, v], i) => {
    const mag = Math.abs(n), body = v && mag === 1 ? v : `${mag}${v}`
    return i === 0 ? (n < 0 ? '−' : '') + body : (n < 0 ? ' − ' : ' + ') + body
  }).join('')
}

// Take out every zero pair (one positive and one negative tile of the same kind, same side).
export function removeZeroPairs(tiles: PlacedTile[]): PlacedTile[] {
  let next = [...tiles]
  for (const type of ['unit', 'x', 'x2'] as TileType[]) {
    for (const zone of ['left', 'right'] as Zone[]) {
      const pos = next.filter(t => t.zone === zone && t.type === type && t.sign === 1)
      const neg = next.filter(t => t.zone === zone && t.type === type && t.sign === -1)
      const k = Math.min(pos.length, neg.length)
      const gone = new Set([...pos.slice(0, k), ...neg.slice(0, k)].map(t => t.id))
      next = next.filter(t => !gone.has(t.id))
    }
  }
  return next
}

// ---------- Probability ----------

export type Mode = 'coin' | 'dice' | 'spinner'

// Which sector sits under the top pointer after the wheel has turned `angle` degrees clockwise.
// Sector 0 is drawn from 12 o'clock going clockwise, so the pointer is over the wheel's
// original angle (360 − angle), measured clockwise from the top.
export function spinnerSectorIndex(angle: number, sectorCount: number): number {
  const turned = ((angle % 360) + 360) % 360
  return Math.floor(((360 - turned) % 360) / (360 / sectorCount)) % sectorCount
}

// The starting face for a mode. Before Nov 2026 a mode switch used the OLD mode's start, so
// switching from Coin to Dice showed "Rolled: H".
export function startFace(mode: Mode): string {
  return mode === 'coin' ? 'H' : mode === 'dice' ? '1' : 'A'
}

// Counts and percents for the chart, in order.
export function tally(results: string[]): { name: string; count: number; pct: number }[] {
  const freq: Record<string, number> = {}
  for (const r of results) freq[r] = (freq[r] || 0) + 1
  return Object.entries(freq).sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count, pct: Math.round(count / results.length * 100) }))
}
