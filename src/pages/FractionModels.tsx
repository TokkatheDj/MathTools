import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'

function FractionCircle({ numerator, denominator, color }: { numerator: number; denominator: number; color: string }) {
  const cx = 80, cy = 80, r = 70
  if (denominator === 0) return null

  const slices = Array.from({ length: denominator }, (_, i) => {
    const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2
    const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = 1 / denominator > 0.5 ? 1 : 0
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, filled: i < numerator }
  })

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.filled ? color : '#e2e8f0'} stroke="white" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  )
}

function FractionBar({ numerator, denominator, color }: { numerator: number; denominator: number; color: string }) {
  if (denominator === 0) return null
  const w = 280, h = 56
  const segW = w / denominator
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {Array.from({ length: denominator }, (_, i) => (
        <rect key={i} x={i * segW} y={0} width={segW} height={h}
          fill={i < numerator ? color : '#e2e8f0'} stroke="white" strokeWidth="2" rx="2" />
      ))}
      <rect x={0} y={0} width={w} height={h} fill="none" stroke="#94a3b8" strokeWidth="1.5" rx="4" />
    </svg>
  )
}

function NumControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 text-sm w-24">{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">−</button>
      <span className="w-8 text-center font-bold text-navy text-lg">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center">+</button>
    </div>
  )
}

export default function FractionModels() {
  const [num, setNum] = useState(1)
  const [den, setDen] = useState(4)
  const [mode, setMode] = useState<'circle' | 'bar'>('circle')
  const [compare, setCompare] = useState(false)
  const [num2, setNum2] = useState(2)
  const [den2, setDen2] = useState(3)

  const color1 = '#f59e0b'
  const color2 = '#3b82f6'

  const cmp = compare ? (num * den2 > num2 * den ? '>' : num * den2 < num2 * den ? '<' : '=') : ''

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      <ToolHeader title="Fraction Models" />
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-auto">
        {/* Left: fraction 1 */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4">
          <div className="text-4xl font-bold text-amber-600 font-mono">
            <span>{num}</span>
            <div className="border-t-2 border-amber-600 my-1" />
            <span>{den}</span>
          </div>
          {mode === 'circle' ? <FractionCircle numerator={num} denominator={den} color={color1} /> : <FractionBar numerator={num} denominator={den} color={color1} />}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <NumControl label="Numerator" value={num} min={0} max={den} onChange={setNum} />
            <NumControl label="Denominator" value={den} min={1} max={12} onChange={v => { setDen(v); if (num > v) setNum(v) }} />
          </div>
        </div>

        {/* Center controls */}
        <div className="flex flex-col items-center justify-center gap-4">
          {compare && <span className="text-3xl font-bold text-navy">{cmp}</span>}
          <div className="flex flex-col gap-2">
            <button onClick={() => setMode(m => m === 'circle' ? 'bar' : 'circle')} className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors">
              {mode === 'circle' ? 'Show Bar' : 'Show Circle'}
            </button>
            <button onClick={() => setCompare(c => !c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${compare ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {compare ? 'Hide Compare' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Right: fraction 2 (only when comparing) */}
        {compare && (
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4">
            <div className="text-4xl font-bold text-blue-600 font-mono">
              <span>{num2}</span>
              <div className="border-t-2 border-blue-600 my-1" />
              <span>{den2}</span>
            </div>
            {mode === 'circle' ? <FractionCircle numerator={num2} denominator={den2} color={color2} /> : <FractionBar numerator={num2} denominator={den2} color={color2} />}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <NumControl label="Numerator" value={num2} min={0} max={den2} onChange={setNum2} />
              <NumControl label="Denominator" value={den2} min={1} max={12} onChange={v => { setDen2(v); if (num2 > v) setNum2(v) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
