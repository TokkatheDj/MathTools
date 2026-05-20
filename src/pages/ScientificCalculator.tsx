import { useState, useCallback } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import { evaluate } from '../tools/scientific-calculator/calcEngine'

const KEYS = [
  ['sin(', 'cos(', 'tan(', '(', ')'],
  ['log(', 'ln(', 'x²', '√(', '%'],
  ['π', 'e', '^', '!', 'DEL'],
  ['7', '8', '9', '÷', 'MC'],
  ['4', '5', '6', '×', 'MR'],
  ['1', '2', '3', '−', 'M+'],
  ['0', '.', '±', '+', '='],
]

const keyStyle = (k: string) => {
  if (k === '=') return 'bg-blue-600 text-white hover:bg-blue-700 font-bold'
  if (['DEL', 'MC', 'MR', 'M+'].includes(k)) return 'bg-slate-200 text-slate-700 hover:bg-slate-300'
  if (['+', '−', '×', '÷', '^', '%'].includes(k)) return 'bg-navy text-white hover:bg-navy-light'
  if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'x²', '√(', 'π', 'e', '!', '(', ')'].includes(k))
    return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs'
  return 'bg-white text-slate-800 hover:bg-slate-50 shadow-sm'
}

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG')
  const [memory, setMemory] = useState(0)
  const [lastWasResult, setLastWasResult] = useState(false)

  const press = useCallback((key: string) => {
    setExpression(prev => {
      if (key === 'DEL') return prev.slice(0, -1)
      if (key === 'MC') { setMemory(0); return prev }
      if (key === 'MR') return prev + memory
      if (key === 'M+') {
        const r = evaluate(prev || '0', angleMode)
        setMemory(m => m + (parseFloat(r) || 0))
        return prev
      }
      if (key === '=') {
        const r = evaluate(prev || '0', angleMode)
        setResult(r)
        setLastWasResult(true)
        return prev
      }
      if (key === '±') return prev.startsWith('-') ? prev.slice(1) : '-' + prev
      if (key === 'x²') return prev + '^2'
      if (key === '!') return prev + '!'
      if (key === '−') return prev + '-'

      const next = lastWasResult && /\d/.test(key) ? key : prev + key
      setLastWasResult(false)
      const preview = evaluate(next, angleMode)
      if (preview !== 'Error') setResult(preview)
      return next
    })
  }, [angleMode, memory, lastWasResult])

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <ToolHeader title="Scientific Calculator" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm">
          {/* Display */}
          <div className="bg-navy p-4 min-h-[100px] flex flex-col justify-end">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-300 text-xs">{memory !== 0 ? `M: ${memory}` : ''}</span>
              <button
                onClick={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}
                className="text-blue-300 hover:text-white text-xs border border-blue-400 rounded px-2 py-0.5 transition-colors"
              >
                {angleMode}
              </button>
            </div>
            <div className="text-blue-200 text-xs text-right font-mono truncate min-h-[16px]">
              {expression}
            </div>
            <div className={`text-right font-mono text-3xl font-light mt-1 ${result === 'Error' ? 'text-red-400' : 'text-white'}`}>
              {result}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-2 grid gap-1.5">
            {KEYS.map((row, ri) => (
              <div key={ri} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                {row.map(k => (
                  <button
                    key={k}
                    onClick={() => press(k)}
                    className={`rounded-lg py-3 text-sm font-medium transition-colors border border-transparent ${keyStyle(k)}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
            <button
              onClick={() => { setExpression(''); setResult('0'); setLastWasResult(false) }}
              className="w-full rounded-lg py-3 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-0.5"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
