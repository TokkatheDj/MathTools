import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'

interface Weight { id: number; label: string; value: number }

const WEIGHT_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: 'x', value: 0 },
]

const WEIGHT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0891b2', '#7c3aed']

export default function BalanceScale() {
  const [left, setLeft] = useState<Weight[]>([])
  const [right, setRight] = useState<Weight[]>([])
  const [nextId, setNextId] = useState(1)
  const [addSide, setAddSide] = useState<'left' | 'right'>('left')
  const [selected, setSelected] = useState(0)

  const leftSum = left.reduce((s, w) => s + w.value, 0)
  const rightSum = right.reduce((s, w) => s + w.value, 0)
  const diff = rightSum - leftSum
  const tilt = Math.max(-25, Math.min(25, diff * 3))

  const hasX = left.some(w => w.label === 'x') || right.some(w => w.label === 'x')
  const xSide = left.some(w => w.label === 'x') ? 'left' : 'right'
  const numericSide = xSide === 'left' ? rightSum : leftSum
  const xCount = (xSide === 'left' ? left : right).filter(w => w.label === 'x').length
  const xValue = xCount > 0 ? numericSide / xCount : null
  const balanced = leftSum === rightSum && !hasX || (hasX && xValue !== null && leftSum === rightSum)

  const addWeight = () => {
    const opt = WEIGHT_OPTIONS[selected]
    const w: Weight = { id: nextId, label: opt.label, value: opt.value }
    setNextId(n => n + 1)
    if (addSide === 'left') setLeft(l => [...l, w])
    else setRight(r => [...r, w])
  }

  const removeWeight = (side: 'left' | 'right', id: number) => {
    if (side === 'left') setLeft(l => l.filter(w => w.id !== id))
    else setRight(r => r.filter(w => w.id !== id))
  }

  const WeightList = ({ side, weights }: { side: 'left' | 'right'; weights: Weight[] }) => (
    <div className="flex flex-wrap gap-2 min-h-[40px] justify-center">
      {weights.map((w, i) => (
        <button key={w.id} onClick={() => removeWeight(side, w.id)}
          className="w-10 h-10 rounded-full text-white text-sm font-bold shadow hover:opacity-80 transition-opacity flex items-center justify-center"
          style={{ backgroundColor: WEIGHT_COLORS[i % WEIGHT_COLORS.length] }}
          title="Click to remove">
          {w.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-cyan-50">
      <ToolHeader title="Balance Scale" />
      <div className="flex-1 flex flex-col items-center justify-between p-6 gap-4 overflow-auto">
        {/* Status */}
        {balanced && leftSum > 0 && (
          <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-semibold shadow">
            {hasX && xValue !== null ? `Balanced! x = ${xValue}` : 'Balanced! ✓'}
          </div>
        )}
        {!balanced && (leftSum > 0 || rightSum > 0) && (
          <div className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full text-sm font-semibold shadow">
            {leftSum > rightSum ? 'Left side is heavier' : 'Right side is heavier'}
          </div>
        )}

        {/* Scale SVG */}
        <div className="flex-1 flex items-center w-full max-w-2xl">
          <svg width="100%" viewBox="0 0 600 320" className="overflow-visible">
            {/* Fulcrum */}
            <polygon points="300,280 275,310 325,310" fill="#1a2e4a" />
            <rect x="270" y="275" width="60" height="10" rx="3" fill="#1a2e4a" />

            {/* Pole */}
            <line x1="300" y1="60" x2="300" y2="275" stroke="#1a2e4a" strokeWidth="4" />
            <circle cx="300" cy="60" r="8" fill="#2a4a6b" />

            {/* Beam with tilt */}
            <g transform={`rotate(${tilt}, 300, 60)`} style={{ transition: 'transform 0.5s ease' }}>
              <line x1="80" y1="60" x2="520" y2="60" stroke="#2a4a6b" strokeWidth="6" strokeLinecap="round" />
              {/* Left chain */}
              <line x1="110" y1="60" x2="110" y2="120" stroke="#64748b" strokeWidth="2" strokeDasharray="4,3" />
              {/* Right chain */}
              <line x1="490" y1="60" x2="490" y2="120" stroke="#64748b" strokeWidth="2" strokeDasharray="4,3" />
              {/* Left pan */}
              <ellipse cx="110" cy="130" rx="60" ry="14" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
              <text x="110" y="155" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af">{leftSum}</text>
              {/* Right pan */}
              <ellipse cx="490" cy="130" rx="60" ry="14" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
              <text x="490" y="155" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af">{rightSum}</text>
            </g>
          </svg>
        </div>

        {/* Weights on pans */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow p-3">
            <div className="text-sm font-semibold text-slate-500 mb-2 text-center">Left ({leftSum})</div>
            <WeightList side="left" weights={left} />
          </div>
          <div className="flex flex-col gap-2 items-center justify-center">
            <select value={selected} onChange={e => setSelected(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full text-center">
              {WEIGHT_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
            <div className="flex gap-2 w-full">
              <button onClick={() => { setAddSide('left'); addWeight() }} className="flex-1 bg-navy text-white rounded-lg py-2 text-xs font-medium hover:bg-navy-light">← Left</button>
              <button onClick={() => { setAddSide('right'); addWeight() }} className="flex-1 bg-navy text-white rounded-lg py-2 text-xs font-medium hover:bg-navy-light">Right →</button>
            </div>
            <button onClick={() => { setLeft([]); setRight([]) }} className="w-full bg-red-50 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-100">Clear All</button>
          </div>
          <div className="bg-white rounded-xl shadow p-3">
            <div className="text-sm font-semibold text-slate-500 mb-2 text-center">Right ({rightSum})</div>
            <WeightList side="right" weights={right} />
          </div>
        </div>
      </div>
    </div>
  )
}
