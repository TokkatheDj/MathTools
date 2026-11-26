import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import { UNITS, fmt, readNumber, type Category } from './unit-math'  // exact factors, tested

const CATEGORIES: Category[] = ['Length', 'Weight', 'Temperature', 'Volume', 'Speed', 'Area']

const CATEGORY_COLORS: Record<Category, { text: string; bg: string; tab: string }> = {
  Length:      { text: 'text-teal-700',   bg: 'bg-teal-700',   tab: 'bg-teal-700 text-white' },
  Weight:      { text: 'text-violet-700', bg: 'bg-violet-600', tab: 'bg-violet-600 text-white' },
  Temperature: { text: 'text-orange-700', bg: 'bg-orange-700', tab: 'bg-orange-700 text-white' },
  Volume:      { text: 'text-blue-700',   bg: 'bg-blue-600',   tab: 'bg-blue-600 text-white' },
  Speed:       { text: 'text-pink-700',   bg: 'bg-pink-700',   tab: 'bg-pink-700 text-white' },
  Area:        { text: 'text-green-700',  bg: 'bg-green-700',  tab: 'bg-green-700 text-white' },
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('Length')
  const [fromIdx, setFromIdx] = useState(0)
  const [toIdx, setToIdx] = useState(2)
  const [fromVal, setFromVal] = useState('1')
  const [toVal, setToVal] = useState('')
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from')

  const units = UNITS[category]

  const convert = (val: string, srcIdx: number, dstIdx: number): string => {
    const n = readNumber(val)
    if (isNaN(n)) return ''
    const base = units[srcIdx].toBase(n)
    return fmt(units[dstIdx].fromBase(base))
  }

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat)
    setFromIdx(0)
    setToIdx(Math.min(2, UNITS[cat].length - 1))
    setFromVal('1')
    setToVal(convert('1', 0, Math.min(2, UNITS[cat].length - 1)))
    setLastEdited('from')
  }

  const handleFromVal = (val: string) => {
    setFromVal(val)
    setToVal(convert(val, fromIdx, toIdx))
    setLastEdited('from')
  }

  const handleToVal = (val: string) => {
    setToVal(val)
    setFromVal(convert(val, toIdx, fromIdx))
    setLastEdited('to')
  }

  const handleFromUnit = (idx: number) => {
    setFromIdx(idx)
    if (lastEdited === 'from') setToVal(convert(fromVal, idx, toIdx))
    else setFromVal(convert(toVal, toIdx, idx))
  }

  const handleToUnit = (idx: number) => {
    setToIdx(idx)
    if (lastEdited === 'from') setToVal(convert(fromVal, fromIdx, idx))
    else setFromVal(convert(toVal, idx, fromIdx))
  }

  const swap = () => {
    setFromIdx(toIdx)
    setToIdx(fromIdx)
    setFromVal(toVal || fromVal)
    setToVal(fromVal)
    setLastEdited('from')
  }

  // Sync display values when units change
  const displayTo = lastEdited === 'from' ? convert(fromVal, fromIdx, toIdx) : toVal
  const displayFrom = lastEdited === 'to' ? convert(toVal, toIdx, fromIdx) : fromVal

  const colors = CATEGORY_COLORS[category]

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-gray-900">
      <ToolHeader title="Unit Converter" />
      <div className="flex-1 flex flex-col items-center p-4 gap-4 overflow-auto">

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                category === cat
                  ? CATEGORY_COLORS[cat].tab
                  : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Converter card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-lg">
          <div className="flex items-center gap-3">

            {/* From */}
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="unit-from" className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">From</label>
              <select
                id="unit-from"
                value={fromIdx}
                onChange={e => handleFromUnit(Number(e.target.value))}
                className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
              <input
                type="number"
                value={displayFrom}
                onChange={e => handleFromVal(e.target.value)}
                className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 text-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
                placeholder="0"
              />
            </div>

            {/* Swap button */}
            <button
              onClick={swap}
              className="mt-8 p-2.5 rounded-full bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-500 dark:text-gray-400 transition-colors flex-shrink-0"
              title="Swap units"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 6h14M12 2l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12H2M6 8l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* To */}
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="unit-to" className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">To</label>
              <select
                id="unit-to"
                value={toIdx}
                onChange={e => handleToUnit(Number(e.target.value))}
                className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
              <input
                type="number"
                value={displayTo}
                onChange={e => handleToVal(e.target.value)}
                className="border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 text-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
                placeholder="0"
              />
            </div>

          </div>

          {/* Formula line */}
          {fromVal !== '' && displayTo !== '' && (
            <div className={`mt-4 text-center text-sm font-medium ${colors.text} dark:text-gray-400`}>
              {displayFrom} {units[fromIdx].label} = {displayTo} {units[toIdx].label}
            </div>
          )}
        </div>

        {/* Reference table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {category} — all units from {fromVal || '1'} {units[fromIdx].label}
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {units.map((u, i) => {
              if (i === fromIdx) return null
              const result = convert(fromVal || '1', fromIdx, i)
              return (
                <div key={u.label} className="flex justify-between items-baseline border-b border-slate-50 dark:border-gray-700 py-1">
                  <span className="text-slate-500 dark:text-gray-400 text-xs font-medium">{u.label}</span>
                  <span className="text-slate-800 dark:text-gray-200 text-sm font-mono font-semibold">{result}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
