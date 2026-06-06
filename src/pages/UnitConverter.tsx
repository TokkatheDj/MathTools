import { useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'

type Category = 'Length' | 'Weight' | 'Temperature' | 'Volume' | 'Speed' | 'Area'

interface UnitDef {
  label: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

const UNITS: Record<Category, UnitDef[]> = {
  Length: [
    { label: 'mm',  toBase: v => v * 0.001,      fromBase: v => v / 0.001 },
    { label: 'cm',  toBase: v => v * 0.01,        fromBase: v => v / 0.01 },
    { label: 'm',   toBase: v => v,               fromBase: v => v },
    { label: 'km',  toBase: v => v * 1000,        fromBase: v => v / 1000 },
    { label: 'in',  toBase: v => v * 0.0254,      fromBase: v => v / 0.0254 },
    { label: 'ft',  toBase: v => v * 0.3048,      fromBase: v => v / 0.3048 },
    { label: 'yd',  toBase: v => v * 0.9144,      fromBase: v => v / 0.9144 },
    { label: 'mi',  toBase: v => v * 1609.344,    fromBase: v => v / 1609.344 },
  ],
  Weight: [
    { label: 'mg',  toBase: v => v * 0.001,       fromBase: v => v / 0.001 },
    { label: 'g',   toBase: v => v,               fromBase: v => v },
    { label: 'kg',  toBase: v => v * 1000,        fromBase: v => v / 1000 },
    { label: 't',   toBase: v => v * 1e6,         fromBase: v => v / 1e6 },
    { label: 'oz',  toBase: v => v * 28.3495,     fromBase: v => v / 28.3495 },
    { label: 'lb',  toBase: v => v * 453.592,     fromBase: v => v / 453.592 },
    { label: 'st',  toBase: v => v * 6350.29,     fromBase: v => v / 6350.29 },
  ],
  Temperature: [
    { label: '°C', toBase: v => v,                fromBase: v => v },
    { label: '°F', toBase: v => (v - 32) * 5/9,  fromBase: v => v * 9/5 + 32 },
    { label: 'K',  toBase: v => v - 273.15,       fromBase: v => v + 273.15 },
  ],
  Volume: [
    { label: 'ml',    toBase: v => v * 0.001,      fromBase: v => v / 0.001 },
    { label: 'L',     toBase: v => v,              fromBase: v => v },
    { label: 'm³',    toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { label: 'tsp',   toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
    { label: 'tbsp',  toBase: v => v * 0.0147868,  fromBase: v => v / 0.0147868 },
    { label: 'fl oz', toBase: v => v * 0.0295735,  fromBase: v => v / 0.0295735 },
    { label: 'cup',   toBase: v => v * 0.236588,   fromBase: v => v / 0.236588 },
    { label: 'pt',    toBase: v => v * 0.473176,   fromBase: v => v / 0.473176 },
    { label: 'qt',    toBase: v => v * 0.946353,   fromBase: v => v / 0.946353 },
    { label: 'gal',   toBase: v => v * 3.78541,    fromBase: v => v / 3.78541 },
  ],
  Speed: [
    { label: 'm/s',   toBase: v => v,              fromBase: v => v },
    { label: 'km/h',  toBase: v => v / 3.6,        fromBase: v => v * 3.6 },
    { label: 'mph',   toBase: v => v * 0.44704,    fromBase: v => v / 0.44704 },
    { label: 'knots', toBase: v => v * 0.514444,   fromBase: v => v / 0.514444 },
    { label: 'ft/s',  toBase: v => v * 0.3048,     fromBase: v => v / 0.3048 },
  ],
  Area: [
    { label: 'mm²', toBase: v => v * 1e-6,         fromBase: v => v / 1e-6 },
    { label: 'cm²', toBase: v => v * 1e-4,         fromBase: v => v / 1e-4 },
    { label: 'm²',  toBase: v => v,                fromBase: v => v },
    { label: 'km²', toBase: v => v * 1e6,          fromBase: v => v / 1e6 },
    { label: 'in²', toBase: v => v * 0.00064516,   fromBase: v => v / 0.00064516 },
    { label: 'ft²', toBase: v => v * 0.092903,     fromBase: v => v / 0.092903 },
    { label: 'ac',  toBase: v => v * 4046.86,      fromBase: v => v / 4046.86 },
    { label: 'ha',  toBase: v => v * 10000,        fromBase: v => v / 10000 },
  ],
}

const CATEGORIES: Category[] = ['Length', 'Weight', 'Temperature', 'Volume', 'Speed', 'Area']

const CATEGORY_COLORS: Record<Category, { text: string; bg: string; tab: string }> = {
  Length:      { text: 'text-teal-700',   bg: 'bg-teal-600',   tab: 'bg-teal-600 text-white' },
  Weight:      { text: 'text-violet-700', bg: 'bg-violet-600', tab: 'bg-violet-600 text-white' },
  Temperature: { text: 'text-orange-700', bg: 'bg-orange-500', tab: 'bg-orange-500 text-white' },
  Volume:      { text: 'text-blue-700',   bg: 'bg-blue-600',   tab: 'bg-blue-600 text-white' },
  Speed:       { text: 'text-pink-700',   bg: 'bg-pink-600',   tab: 'bg-pink-600 text-white' },
  Area:        { text: 'text-green-700',  bg: 'bg-green-600',  tab: 'bg-green-600 text-white' },
}

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) === 0) return '0'
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) {
    return n.toExponential(6).replace(/\.?0+e/, 'e')
  }
  const s = parseFloat(n.toPrecision(10)).toString()
  return s
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
    const n = parseFloat(val)
    if (isNaN(n) || val === '') return ''
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
              <label className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wide">From</label>
              <select
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
              <label className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wide">To</label>
              <select
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
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {category} — all units from {fromVal || '1'} {units[fromIdx].label}
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {units.map((u, i) => {
              if (i === fromIdx) return null
              const result = convert(fromVal || '1', fromIdx, i)
              return (
                <div key={u.label} className="flex justify-between items-baseline border-b border-slate-50 dark:border-gray-700 py-1">
                  <span className="text-slate-400 dark:text-gray-500 text-xs font-medium">{u.label}</span>
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
