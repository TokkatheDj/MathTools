import { useState, useRef, useCallback } from 'react'
import ToolHeader from '../components/common/ToolHeader'

interface Marker { id: number; value: number; color: string }

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function NumberLine() {
  const [min, setMin] = useState(-10)
  const [max, setMax] = useState(10)
  const [markers, setMarkers] = useState<Marker[]>([{ id: 1, value: 0, color: COLORS[0] }])
  const [nextId, setNextId] = useState(2)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<number | null>(null)

  const SVG_W = 700, SVG_H = 120
  const PAD = 40
  const lineY = 70

  const toX = (v: number) => PAD + ((v - min) / (max - min)) * (SVG_W - 2 * PAD)
  const toVal = (x: number) => {
    const raw = min + ((x - PAD) / (SVG_W - 2 * PAD)) * (max - min)
    return Math.round(Math.max(min, Math.min(max, raw)))
  }

  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const labelEvery = Math.ceil((max - min) / 20)

  const onPointerDown = (id: number) => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = id
  }

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current === null || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (SVG_W / rect.width)
    const val = toVal(x)
    setMarkers(ms => ms.map(m => m.id === dragging.current ? { ...m, value: val } : m))
  }, [min, max])

  const onPointerUp = () => { dragging.current = null }

  const addMarker = () => {
    const mid = Math.round((min + max) / 2)
    setMarkers(ms => [...ms, { id: nextId, value: mid, color: COLORS[nextId % COLORS.length] }])
    setNextId(n => n + 1)
  }

  const zoom = (dir: 'in' | 'out') => {
    const center = Math.round((min + max) / 2)
    const half = Math.round((max - min) / 2)
    if (dir === 'in' && half > 2) { setMin(center - Math.max(2, half - 2)); setMax(center + Math.max(2, half - 2)) }
    if (dir === 'out' && half < 50) { setMin(center - (half + 2)); setMax(center + (half + 2)) }
  }

  return (
    <div className="flex flex-col h-screen bg-red-50">
      <ToolHeader title="Number Line" />
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl">
          <svg ref={svgRef} width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            onPointerMove={onPointerMove} onPointerUp={onPointerUp} className="overflow-visible">
            {/* Line */}
            <line x1={PAD} y1={lineY} x2={SVG_W - PAD} y2={lineY} stroke="#1a2e4a" strokeWidth="3" strokeLinecap="round" />
            {/* Arrowheads */}
            <polygon points={`${SVG_W - PAD + 12},${lineY} ${SVG_W - PAD},${lineY - 6} ${SVG_W - PAD},${lineY + 6}`} fill="#1a2e4a" />
            <polygon points={`${PAD - 12},${lineY} ${PAD},${lineY - 6} ${PAD},${lineY + 6}`} fill="#1a2e4a" />
            {/* Ticks */}
            {ticks.map(v => {
              const x = toX(v)
              const major = v % 5 === 0
              return (
                <g key={v}>
                  <line x1={x} y1={lineY - (major ? 10 : 6)} x2={x} y2={lineY + (major ? 10 : 6)} stroke="#475569" strokeWidth={major ? 2 : 1} />
                  {v % labelEvery === 0 && (
                    <text x={x} y={lineY + 26} textAnchor="middle" fontSize="12" fill="#475569" fontFamily="system-ui">{v}</text>
                  )}
                </g>
              )
            })}
            {/* Markers */}
            {markers.map(m => (
              <g key={m.id} onPointerDown={onPointerDown(m.id)} style={{ cursor: 'grab' }}>
                <circle cx={toX(m.value)} cy={lineY - 26} r="16" fill={m.color} opacity="0.9" />
                <text x={toX(m.value)} y={lineY - 21} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" fontFamily="system-ui">{m.value}</text>
                <line x1={toX(m.value)} y1={lineY - 10} x2={toX(m.value)} y2={lineY} stroke={m.color} strokeWidth="2" strokeDasharray="3,2" />
              </g>
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => zoom('in')} className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light">Zoom In +</button>
          <button onClick={() => zoom('out')} className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light">Zoom Out −</button>
          <button onClick={addMarker} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add Marker</button>
          <button onClick={() => setMarkers([])} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">Clear Markers</button>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {markers.map(m => (
            <div key={m.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="font-mono font-bold" style={{ color: m.color }}>{m.value}</span>
              <button onClick={() => setMarkers(ms => ms.filter(x => x.id !== m.id))} className="text-slate-400 hover:text-red-500 text-xs ml-1">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
