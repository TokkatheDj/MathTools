import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import { solve, formatValue, expression, tiltFor, type Side } from './balance-math'

interface Weight { id: number; label: string; value: number }

const WEIGHT_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: 'x', value: 0 },
]

// -700 shades, so the white numbers on them stay readable (all above 4.5:1).
const WEIGHT_COLORS = ['#1d4ed8', '#047857', '#b45309', '#b91c1c', '#6d28d9', '#be185d', '#0e7490', '#7c3aed']

function WeightList({ weights, onRemove }: { weights: Weight[]; onRemove: (id: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2 min-h-[40px] justify-center">
      {weights.map((w, i) => (
        <button key={w.id} onClick={() => onRemove(w.id)}
          className="w-10 h-10 rounded-full text-white text-sm font-bold shadow hover:opacity-80 transition-opacity flex items-center justify-center"
          style={{ backgroundColor: WEIGHT_COLORS[i % WEIGHT_COLORS.length] }}
          title="Click to remove" aria-label={`Remove ${w.label}`}>
          {w.label}
        </button>
      ))}
    </div>
  )
}

const sideOf = (ws: Weight[]): Side => ({
  xs: ws.filter(w => w.label === 'x').length,
  num: ws.reduce((s, w) => s + w.value, 0),
})

export default function BalanceScale() {
  const [left, setLeft] = useState<Weight[]>([])
  const [right, setRight] = useState<Weight[]>([])
  const [nextId, setNextId] = useState(1)
  const [selected, setSelected] = useState(0)

  const L = sideOf(left), R = sideOf(right)
  const leftSum = L.num, rightSum = R.num
  const hasX = L.xs + R.xs > 0
  const solution = solve(L, R)
  const tilt = tiltFor(L, R)
  const equation = `${expression(L)} = ${expression(R)}`

  // The side is passed in, not read from state: a setState just before this call
  // wouldn't have landed yet, which sent weights to the wrong pan.
  const addWeight = (side: 'left' | 'right') => {
    const opt = WEIGHT_OPTIONS[selected]
    const w: Weight = { id: nextId, label: opt.label, value: opt.value }
    setNextId(n => n + 1)
    if (side === 'left') setLeft(l => [...l, w])
    else setRight(r => [...r, w])
  }

  const removeWeight = (side: 'left' | 'right', id: number) => {
    if (side === 'left') setLeft(l => l.filter(w => w.id !== id))
    else setRight(r => r.filter(w => w.id !== id))
  }


  return (
    <div className="flex flex-col h-screen bg-cyan-50 dark:bg-gray-900">
      <ToolHeader title="Balance Scale" />
      <div className="flex-1 flex flex-col items-center justify-between p-6 gap-4 overflow-auto">
        {/* Status */}
        {hasX && (
          <div className="text-center">
            <div className="text-lg font-semibold text-navy dark:text-white">{equation}</div>
            <div className={`mt-1 inline-block px-6 py-2 rounded-full text-sm font-semibold shadow ${solution.kind === 'value' || solution.kind === 'any' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {solution.kind === 'value' && `Balanced when x = ${formatValue(solution.num, solution.den)}`}
              {solution.kind === 'any' && 'Balanced for every value of x'}
              {solution.kind === 'never' && 'No value of x can balance this'}
            </div>
          </div>
        )}
        {!hasX && leftSum > 0 && leftSum === rightSum && (
          <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full text-sm font-semibold shadow">Balanced! ✓</div>
        )}
        {!hasX && leftSum !== rightSum && (
          <div className="bg-amber-100 text-amber-800 px-6 py-2 rounded-full text-sm font-semibold shadow">
            {leftSum > rightSum ? 'Left side is heavier' : 'Right side is heavier'}
          </div>
        )}

        {/* Scale SVG */}
        <div className="flex-1 flex items-center w-full max-w-2xl">
          <svg width="100%" viewBox="0 0 600 320" className="overflow-visible">
            {/* Fulcrum */}
            <polygon points="300,280 275,310 325,310" fill="#1a2e4a" className="dark:fill-slate-300" />
            <rect x="270" y="275" width="60" height="10" rx="3" fill="#1a2e4a" className="dark:fill-slate-300" />

            {/* Pole */}
            <line x1="300" y1="60" x2="300" y2="275" stroke="#1a2e4a" className="dark:stroke-slate-300" strokeWidth="4" />
            <circle cx="300" cy="60" r="8" fill="#2a4a6b" className="dark:fill-slate-400" />

            {/* Beam with tilt */}
            <g transform={`rotate(${tilt}, 300, 60)`} style={{ transition: 'transform 0.5s ease' }}>
              <line x1="80" y1="60" x2="520" y2="60" stroke="#2a4a6b" className="dark:stroke-slate-400" strokeWidth="6" strokeLinecap="round" />
              {/* Left chain */}
              <line x1="110" y1="60" x2="110" y2="120" stroke="#64748b" className="dark:stroke-slate-400" strokeWidth="2" strokeDasharray="4,3" />
              {/* Right chain */}
              <line x1="490" y1="60" x2="490" y2="120" stroke="#64748b" className="dark:stroke-slate-400" strokeWidth="2" strokeDasharray="4,3" />
              {/* Left pan */}
              <ellipse cx="110" cy="130" rx="60" ry="14" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
              <text x="110" y="155" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af" className="dark:fill-blue-300">{expression(L)}</text>
              {/* Right pan */}
              <ellipse cx="490" cy="130" rx="60" ry="14" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
              <text x="490" y="155" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af" className="dark:fill-blue-300">{expression(R)}</text>
            </g>
          </svg>
        </div>

        {/* Weights on pans */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3">
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-2 text-center">Left ({expression(L)})</div>
            <WeightList weights={left} onRemove={id => removeWeight('left', id)} />
          </div>
          <div className="flex flex-col gap-2 items-center justify-center">
            <select aria-label="Weight to add" value={selected} onChange={e => setSelected(Number(e.target.value))}
              className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm w-full text-center">
              {WEIGHT_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
            <div className="flex gap-2 w-full">
              <button onClick={() => addWeight('left')} className="flex-1 bg-navy text-white rounded-lg py-2 text-xs font-medium hover:bg-navy-light">← Left</button>
              <button onClick={() => addWeight('right')} className="flex-1 bg-navy text-white rounded-lg py-2 text-xs font-medium hover:bg-navy-light">Right →</button>
            </div>
            <button onClick={() => { setLeft([]); setRight([]) }} className="w-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg py-2 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50">Clear All</button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3">
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-2 text-center">Right ({expression(R)})</div>
            <WeightList weights={right} onRemove={id => removeWeight('right', id)} />
          </div>
        </div>
      </div>
    </div>
  )
}
