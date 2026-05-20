import { useState, useRef } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Mode = 'coin' | 'dice' | 'spinner'

const COIN_COLORS = { H: '#f59e0b', T: '#64748b' }
const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}
const SPINNER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export default function ProbabilityTools() {
  const [mode, setMode] = useState<Mode>('coin')
  const [results, setResults] = useState<string[]>([])
  const [animating, setAnimating] = useState(false)
  const [display, setDisplay] = useState<string>('H')
  const [spinning, setSpinning] = useState(false)
  const [spinAngle, setSpinAngle] = useState(0)
  const [sectors] = useState(['A', 'B', 'C', 'D'])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const flipCoin = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      const r = Math.random() < 0.5 ? 'H' : 'T'
      setDisplay(r)
      setResults(prev => [...prev, r])
      setAnimating(false)
    }, 600)
  }

  const flipMany = (n: number) => {
    if (animating) return
    const rs = Array.from({ length: n }, () => Math.random() < 0.5 ? 'H' : 'T')
    setDisplay(rs[rs.length - 1])
    setResults(prev => [...prev, ...rs])
  }

  const rollDice = () => {
    if (animating) return
    setAnimating(true)
    let count = 0
    intervalRef.current = setInterval(() => {
      const v = String(Math.floor(Math.random() * 6) + 1)
      setDisplay(v)
      count++
      if (count >= 8) {
        clearInterval(intervalRef.current ?? undefined)
        const final = String(Math.floor(Math.random() * 6) + 1)
        setDisplay(final)
        setResults(prev => [...prev, final])
        setAnimating(false)
      }
    }, 70)
  }

  const rollMany = (n: number) => {
    const rs = Array.from({ length: n }, () => String(Math.floor(Math.random() * 6) + 1))
    setDisplay(rs[rs.length - 1])
    setResults(prev => [...prev, ...rs])
  }

  const spinSpinner = () => {
    if (spinning) return
    setSpinning(true)
    const spins = 4 + Math.random() * 4
    const sectorAngle = 360 / sectors.length
    const offset = Math.random() * 360
    const target = spinAngle + spins * 360 + offset
    setSpinAngle(target)
    setTimeout(() => {
      const normalised = ((target % 360) + 360) % 360
      const idx = Math.floor(((360 - normalised) % 360) / sectorAngle)
      const r = sectors[idx % sectors.length]
      setDisplay(r)
      setResults(prev => [...prev, r])
      setSpinning(false)
    }, 1600)
  }

  const clearResults = () => { setResults([]); setDisplay(mode === 'coin' ? 'H' : mode === 'dice' ? '1' : 'A') }

  const freq = results.reduce<Record<string, number>>((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc }, {})
  const chartData = Object.entries(freq).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({
    name, count, pct: Math.round(count / results.length * 100)
  }))

  return (
    <div className="flex flex-col h-screen bg-pink-50">
      <ToolHeader title="Probability Tools" />
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        {/* Mode selector */}
        <div className="flex gap-2 justify-center">
          {(['coin', 'dice', 'spinner'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); clearResults() }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${mode === m ? 'bg-navy text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
              {m === 'coin' ? '🪙 Coin' : m === 'dice' ? '🎲 Dice' : '🎡 Spinner'}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Tool panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-5 lg:w-80 flex-shrink-0">
            {mode === 'coin' && (
              <>
                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg ${animating ? 'coin-flipping' : ''}`}
                  style={{ backgroundColor: COIN_COLORS[display as 'H' | 'T'] }}>
                  {display}
                </div>
                <div className="text-sm text-slate-500">{display === 'H' ? 'Heads' : 'Tails'}</div>
                <button onClick={flipCoin} disabled={animating} className="bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors">Flip Coin</button>
                <div className="flex gap-2">
                  {[10, 50, 100].map(n => <button key={n} onClick={() => flipMany(n)} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-200">×{n}</button>)}
                </div>
              </>
            )}
            {mode === 'dice' && (
              <>
                <svg width="120" height="120" viewBox="0 0 100 100" className={animating ? 'dice-rolling' : ''}>
                  <rect x="5" y="5" width="90" height="90" rx="16" fill="#1a2e4a" />
                  {DICE_DOTS[parseInt(display) || 1].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="8" fill="white" />
                  ))}
                </svg>
                <div className="text-sm text-slate-500">Rolled: {display}</div>
                <button onClick={rollDice} disabled={animating} className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-navy-light disabled:opacity-50">Roll Dice</button>
                <div className="flex gap-2">
                  {[10, 50, 100].map(n => <button key={n} onClick={() => rollMany(n)} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200">×{n}</button>)}
                </div>
              </>
            )}
            {mode === 'spinner' && (
              <>
                <div className="relative">
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: `rotate(${spinAngle}deg)`, transition: spinning ? 'transform 1.6s cubic-bezier(0.25,0.1,0.1,1)' : 'none' }}>
                    {sectors.map((s, i) => {
                      const sweep = 360 / sectors.length
                      const start = (i * sweep - 90) * Math.PI / 180
                      const end = ((i + 1) * sweep - 90) * Math.PI / 180
                      const x1 = 80 + 70 * Math.cos(start), y1 = 80 + 70 * Math.sin(start)
                      const x2 = 80 + 70 * Math.cos(end), y2 = 80 + 70 * Math.sin(end)
                      const mid = (start + end) / 2
                      return (
                        <g key={i}>
                          <path d={`M 80 80 L ${x1} ${y1} A 70 70 0 0 1 ${x2} ${y2} Z`} fill={SPINNER_COLORS[i]} stroke="white" strokeWidth="2" />
                          <text x={80 + 45 * Math.cos(mid)} y={80 + 45 * Math.sin(mid)} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="white">{s}</text>
                        </g>
                      )
                    })}
                    <circle cx="80" cy="80" r="8" fill="white" stroke="#1a2e4a" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '20px solid #1a2e4a' }} />
                </div>
                <div className="text-sm text-slate-500">Result: <strong>{display}</strong></div>
                <button onClick={spinSpinner} disabled={spinning} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50">Spin!</button>
              </>
            )}
            <div className="text-slate-400 text-xs">Total trials: {results.length}</div>
            <button onClick={clearResults} className="text-red-400 hover:text-red-600 text-xs underline">Clear Results</button>
          </div>

          {/* Chart */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 min-h-0">
            <h3 className="font-semibold text-navy text-sm">Frequency Results</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v, _name, item: any) => [`${v} (${item?.payload?.pct ?? 0}%)`, 'Count']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={SPINNER_COLORS[i % SPINNER_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-300 text-sm">Run some trials to see results</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SPINNER_COLORS[i % SPINNER_COLORS.length] }} />
                  <span className="font-medium">{d.name}:</span> {d.count} ({d.pct}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
