import { useState, useCallback } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'

type TileType = 'unit' | 'x' | 'x2'
type TileSign = 1 | -1
type Zone = 'left' | 'right'

interface PlacedTile { id: string; type: TileType; sign: TileSign; zone: Zone }

const TILE_CONFIG = {
  unit: { w: 32, h: 32, label: '1', posColor: '#fbbf24', negColor: '#f87171' },
  x:    { w: 32, h: 80, label: 'x', posColor: '#60a5fa', negColor: '#f87171' },
  x2:   { w: 80, h: 80, label: 'x²', posColor: '#34d399', negColor: '#f87171' },
}

function Tile({ type, sign, dragging = false }: { type: TileType; sign: TileSign; dragging?: boolean }) {
  const cfg = TILE_CONFIG[type]
  const color = sign === 1 ? cfg.posColor : cfg.negColor
  return (
    <div className="rounded-sm border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow select-none"
      style={{ width: cfg.w, height: cfg.h, backgroundColor: color, opacity: dragging ? 0.5 : 1, transition: 'opacity 0.15s' }}>
      {sign === -1 ? '−' : ''}{cfg.label}
    </div>
  )
}

function DraggableTile({ id, type, sign }: { id: string; type: TileType; sign: TileSign }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { source: 'board', type, sign } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ cursor: 'grab' }}>
      <Tile type={type} sign={sign} dragging={isDragging} />
    </div>
  )
}

function PaletteTile({ id, type, sign }: { id: string; type: TileType; sign: TileSign }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id, data: { source: 'palette', type, sign } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ cursor: 'grab' }} className="hover:scale-105 transition-transform">
      <Tile type={type} sign={sign} />
    </div>
  )
}

function DropZone({ id, label, tiles }: { id: Zone; label: string; tiles: PlacedTile[] }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`flex-1 rounded-xl border-2 border-dashed p-3 min-h-[180px] transition-colors ${isOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">{label}</div>
      <div className="flex flex-wrap gap-2">
        {tiles.map(t => <DraggableTile key={t.id} id={t.id} type={t.type} sign={t.sign} />)}
      </div>
    </div>
  )
}

function Trash() {
  const { isOver, setNodeRef } = useDroppable({ id: 'trash' })
  return (
    <div ref={setNodeRef} className={`flex items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed transition-colors text-xl ${isOver ? 'border-red-400 bg-red-50' : 'border-slate-200 text-slate-300'}`}>
      🗑️
    </div>
  )
}

function buildExpr(tiles: PlacedTile[], zone: Zone): string {
  const t = tiles.filter(t => t.zone === zone)
  const x2p = t.filter(t => t.type === 'x2' && t.sign === 1).length
  const x2n = t.filter(t => t.type === 'x2' && t.sign === -1).length
  const xp  = t.filter(t => t.type === 'x'  && t.sign === 1).length
  const xn  = t.filter(t => t.type === 'x'  && t.sign === -1).length
  const up  = t.filter(t => t.type === 'unit' && t.sign === 1).length
  const un  = t.filter(t => t.type === 'unit' && t.sign === -1).length
  const net = { x2: x2p - x2n, x: xp - xn, u: up - un }
  const parts: string[] = []
  if (net.x2 !== 0) parts.push(`${Math.abs(net.x2) !== 1 ? Math.abs(net.x2) : ''}x²`)
  if (net.x  !== 0) parts.push(`${Math.abs(net.x)  !== 1 ? Math.abs(net.x)  : ''}x`)
  if (net.u  !== 0) parts.push(`${Math.abs(net.u)}`)
  if (parts.length === 0) return '0'
  let expr = ''
  const signs = [net.x2, net.x, net.u].filter(v => v !== 0)
  parts.forEach((p, i) => {
    const s = signs[i]
    if (i === 0) expr += s < 0 ? '−' + p : p
    else expr += s < 0 ? ' − ' + p : ' + ' + p
  })
  return expr
}

export default function AlgebraTiles() {
  const [tiles, setTiles] = useState<PlacedTile[]>([])
  const [nextId, setNextId] = useState(1)
  const [equationMode, setEquationMode] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const data = active.data.current as { source: string; type: TileType; sign: TileSign }

    if (over.id === 'trash') {
      if (data.source === 'board') setTiles(t => t.filter(x => x.id !== active.id))
      return
    }

    const targetZone = over.id as Zone
    if (!['left', 'right'].includes(targetZone)) return

    if (data.source === 'palette') {
      setTiles(t => [...t, { id: `t${nextId}`, type: data.type, sign: data.sign, zone: targetZone }])
      setNextId(n => n + 1)
    } else if (data.source === 'board') {
      setTiles(t => t.map(tile => tile.id === active.id ? { ...tile, zone: targetZone } : tile))
    }
  }, [nextId])

  const removeZeroPairs = () => {
    setTiles(prev => {
      let next = [...prev]
      for (const type of ['unit', 'x', 'x2'] as TileType[]) {
        for (const zone of ['left', 'right'] as Zone[]) {
          const pos = next.filter(t => t.zone === zone && t.type === type && t.sign === 1)
          const neg = next.filter(t => t.zone === zone && t.type === type && t.sign === -1)
          const removePairs = Math.min(pos.length, neg.length)
          const posToRemove = pos.slice(0, removePairs).map(t => t.id)
          const negToRemove = neg.slice(0, removePairs).map(t => t.id)
          next = next.filter(t => !posToRemove.includes(t.id) && !negToRemove.includes(t.id))
        }
      }
      return next
    })
  }

  const leftExpr = buildExpr(tiles, 'left')
  const rightExpr = buildExpr(tiles, 'right')

  return (
    <div className="flex flex-col h-screen bg-violet-50">
      <ToolHeader title="Algebra Tiles" />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
          {/* Palette */}
          <div className="bg-white rounded-2xl shadow p-4 lg:w-48 flex-shrink-0">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tiles</div>
            <div className="flex flex-wrap lg:flex-col gap-3">
              {([['unit', 1], ['unit', -1], ['x', 1], ['x', -1], ['x2', 1], ['x2', -1]] as [TileType, TileSign][]).map(([type, sign]) => (
                <div key={`${type}-${sign}`} className="flex items-center gap-2">
                  <PaletteTile id={`pal-${type}-${sign}`} type={type} sign={sign} />
                  <span className="text-xs text-slate-400">{sign === 1 ? '+' : '−'}{TILE_CONFIG[type].label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Trash />
              <div className="text-xs text-slate-400 mt-1">Drag here to remove</div>
            </div>
          </div>

          {/* Board */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setEquationMode(m => !m)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${equationMode ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'}`}>
                {equationMode ? 'Equation Mode ✓' : 'Equation Mode'}
              </button>
              <button onClick={removeZeroPairs} className="bg-white text-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50">Remove Zero Pairs</button>
              <button onClick={() => setTiles([])} className="bg-red-50 text-red-500 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100">Clear</button>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">
              <DropZone id="left" label="Expression" tiles={tiles.filter(t => t.zone === 'left')} />
              {equationMode && (
                <>
                  <div className="flex items-center text-3xl font-bold text-slate-400 select-none">=</div>
                  <DropZone id="right" label="Expression" tiles={tiles.filter(t => t.zone === 'right')} />
                </>
              )}
            </div>

            {/* Expression display */}
            <div className="bg-white rounded-xl shadow px-5 py-3 text-center">
              <span className="text-navy text-xl font-semibold font-mono">
                {equationMode ? `${leftExpr} = ${rightExpr}` : leftExpr}
              </span>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
