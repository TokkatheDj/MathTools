import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'

const COLUMNS = [
  { name: 'Hundred\nThousands', place: 100000, color: '#7c3aed', bg: '#ede9fe' },
  { name: 'Ten\nThousands', place: 10000, color: '#db2777', bg: '#fce7f3' },
  { name: 'Thousands', place: 1000, color: '#dc2626', bg: '#fee2e2' },
  { name: 'Hundreds', place: 100, color: '#d97706', bg: '#fef3c7' },
  { name: 'Tens', place: 10, color: '#059669', bg: '#d1fae5' },
  { name: 'Ones', place: 1, color: '#2563eb', bg: '#dbeafe' },
]

export default function PlaceValue() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [input, setInput] = useState('')

  const decompose = () => {
    const n = Math.min(999999, Math.max(0, parseInt(input) || 0))
    const newCounts = [0, 0, 0, 0, 0, 0]
    let rem = n
    COLUMNS.forEach((col, i) => {
      newCounts[i] = Math.floor(rem / col.place)
      rem = rem % col.place
    })
    setCounts(newCounts)
  }

  const total = COLUMNS.reduce((sum, col, i) => sum + col.place * counts[i], 0)

  const adjust = (i: number, delta: number) => {
    setCounts(c => {
      const next = [...c]
      next[i] = Math.max(0, Math.min(9, next[i] + delta))
      return next
    })
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <ToolHeader title="Place Value" />
      <div className="flex-1 flex flex-col items-center p-6 gap-6 overflow-auto">
        {/* Total display */}
        <div className="bg-white rounded-2xl shadow px-8 py-4 text-center">
          <div className="text-4xl font-bold text-navy font-mono">{total.toLocaleString()}</div>
          <div className="text-slate-500 text-sm mt-1">Current Value</div>
        </div>

        {/* Columns */}
        <div className="flex gap-2 items-end overflow-x-auto pb-2 w-full max-w-4xl">
          {COLUMNS.map((col, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[90px] flex-1">
              <div className="text-xs font-semibold text-slate-500 text-center whitespace-pre-line leading-tight min-h-[32px] flex items-center">{col.name}</div>
              {/* Blocks */}
              <div className="rounded-xl p-2 flex flex-col items-center gap-1 w-full min-h-[180px] justify-end" style={{ backgroundColor: col.bg }}>
                {Array.from({ length: counts[i] }, (_, bi) => (
                  <div key={bi} className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ backgroundColor: col.color }}>
                    {col.place >= 1000 ? (col.place / 1000) + 'k' : col.place}
                  </div>
                ))}
                {counts[i] === 0 && <div className="text-slate-300 text-3xl select-none">0</div>}
              </div>
              {/* Count display */}
              <div className="text-2xl font-bold font-mono" style={{ color: col.color }}>{counts[i]}</div>
              {/* Controls */}
              <div className="flex gap-1">
                <button onClick={() => adjust(i, -1)} className="w-7 h-7 rounded-full bg-white shadow text-slate-600 hover:bg-slate-100 font-bold text-sm flex items-center justify-center">−</button>
                <button onClick={() => adjust(i, 1)} className="w-7 h-7 rounded-full bg-white shadow text-slate-600 hover:bg-slate-100 font-bold text-sm flex items-center justify-center">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Input decompose */}
        <div className="flex gap-3 items-center">
          <input type="number" placeholder="Enter a number (0–999999)" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && decompose()}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-navy" />
          <button onClick={decompose} className="bg-navy text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors">Decompose</button>
          <button onClick={() => { setCounts([0, 0, 0, 0, 0, 0]); setInput('') }} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100">Clear</button>
        </div>
      </div>
    </div>
  )
}
