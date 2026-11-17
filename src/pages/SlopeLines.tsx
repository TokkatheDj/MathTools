import { useRef, useState } from 'react'
import ToolHeader from '../components/common/ToolHeader'
import {
  type Point, type Challenge, lineThrough, rise, run, fracText, fracDecimal, slopeIntercept, pointSlope,
  describeSlope, checkChallenge, makeChallenge,
} from './slope-math'

const MIN = -10, MAX = 10, SIZE = 500, PAD = 20
const SCALE = (SIZE - 2 * PAD) / (MAX - MIN)
const toX = (x: number) => PAD + (x - MIN) * SCALE
const toY = (y: number) => SIZE - PAD - (y - MIN) * SCALE
const clamp = (v: number) => Math.max(MIN, Math.min(MAX, v))
const A_COLOR = '#2563eb', B_COLOR = '#dc2626'
const HALO = 'stroke-white dark:stroke-gray-800'   // a halo the colour of the card, so labels read over lines

export default function SlopeLines() {
  const [pts, setPts] = useState<[Point, Point]>([{ x: -2, y: -1 }, { x: 2, y: 2 }])
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [verdict, setVerdict] = useState<{ ok: boolean; why: string } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<0 | 1 | null>(null)
  const [a, b] = pts
  const line = lineThrough(a, b)

  const move = (i: 0 | 1, p: Point) => {
    setPts(ps => (i === 0 ? [p, ps[1]] : [ps[0], p]))
    setVerdict(null)
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const sx = ((e.clientX - r.left) * SIZE) / r.width, sy = ((e.clientY - r.top) * SIZE) / r.height
    move(dragging.current, { x: clamp(Math.round((sx - PAD) / SCALE + MIN)), y: clamp(Math.round(MAX - (sy - PAD) / SCALE)) })
  }
  const onKey = (i: 0 | 1) => (e: React.KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }
    if (!d[e.key]) return
    e.preventDefault()
    const p = pts[i]
    move(i, { x: clamp(p.x + d[e.key][0]), y: clamp(p.y + d[e.key][1]) })
  }

  // the line, drawn edge to edge
  let seg: [Point, Point] | null = null
  if (line.kind === 'vertical') seg = [{ x: line.x, y: MIN }, { x: line.x, y: MAX }]
  if (line.kind === 'sloped') {
    const m = line.slope.num / line.slope.den, c = line.intercept.num / line.intercept.den
    seg = [{ x: MIN, y: m * MIN + c }, { x: MAX, y: m * MAX + c }]
  }
  const yInt = line.kind === 'sloped' ? line.intercept.num / line.intercept.den : null
  const ticks = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)
  const r = rise(a, b), u = run(a, b)

  const newChallenge = () => { setChallenge(makeChallenge()); setVerdict(null) }
  const target = challenge
    ? (challenge.slope === 'undefined' ? 'an undefined slope (a vertical line)' : `slope ${fracText(challenge.slope)}`)
    : ''

  return (
    <div className="flex flex-col min-h-screen bg-sky-50 dark:bg-gray-900">
      <ToolHeader title="Slope & Lines" />
      <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-6xl w-full mx-auto">
        <div className="flex-1 min-w-0">
          <svg
            ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[560px] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm touch-none select-none"
            onPointerMove={onPointerMove} onPointerUp={() => (dragging.current = null)} onPointerLeave={() => (dragging.current = null)}
            role="img" aria-label={`Coordinate grid. Point A at (${a.x}, ${a.y}), point B at (${b.x}, ${b.y}). ${slopeIntercept(line)}`}
          >
            <defs><clipPath id="grid"><rect x={PAD} y={PAD} width={SIZE - 2 * PAD} height={SIZE - 2 * PAD} /></clipPath></defs>
            {ticks.map(t => (
              <g key={t}>
                <line x1={toX(t)} y1={PAD} x2={toX(t)} y2={SIZE - PAD} className={t === 0 ? 'stroke-slate-700 dark:stroke-gray-300' : 'stroke-slate-200 dark:stroke-gray-700'} strokeWidth={t === 0 ? 2 : 1} />
                <line x1={PAD} y1={toY(t)} x2={SIZE - PAD} y2={toY(t)} className={t === 0 ? 'stroke-slate-700 dark:stroke-gray-300' : 'stroke-slate-200 dark:stroke-gray-700'} strokeWidth={t === 0 ? 2 : 1} />
                {t !== 0 && t % 2 === 0 && (
                  <>
                    <text x={toX(t)} y={toY(0) + 15} fontSize="12" textAnchor="middle" className="fill-slate-500 dark:fill-gray-400">{t}</text>
                    <text x={toX(0) - 6} y={toY(t) + 4} fontSize="12" textAnchor="end" className="fill-slate-500 dark:fill-gray-400">{t}</text>
                  </>
                )}
              </g>
            ))}
            <g clipPath="url(#grid)">
              {seg && <line x1={toX(seg[0].x)} y1={toY(seg[0].y)} x2={toX(seg[1].x)} y2={toY(seg[1].y)} stroke="#7c3aed" strokeWidth="3" />}
              {line.kind === 'sloped' && u !== 0 && (
                <>
                  <line x1={toX(a.x)} y1={toY(a.y)} x2={toX(b.x)} y2={toY(a.y)} stroke="#0d9488" strokeWidth="3" strokeDasharray="7 5" />
                  <line x1={toX(b.x)} y1={toY(a.y)} x2={toX(b.x)} y2={toY(b.y)} stroke="#d97706" strokeWidth="3" strokeDasharray="7 5" />
                  <text x={(toX(a.x) + toX(b.x)) / 2} y={toY(a.y) + (r >= 0 ? 18 : -8)} fontSize="16" fontWeight="700" textAnchor="middle" fill="#0d9488" className={HALO} paintOrder="stroke" strokeWidth={5}>run {u}</text>
                  <text x={toX(b.x) + (u >= 0 ? 8 : -8)} y={(toY(a.y) + toY(b.y)) / 2 + 5} fontSize="16" fontWeight="700" textAnchor={u >= 0 ? 'start' : 'end'} fill="#d97706" className={HALO} paintOrder="stroke" strokeWidth={5}>rise {r}</text>
                </>
              )}
              {yInt !== null && yInt >= MIN && yInt <= MAX && <circle cx={toX(0)} cy={toY(yInt)} r="6" fill="#7c3aed" stroke="white" strokeWidth="2" />}
              {challenge && <circle cx={toX(challenge.through.x)} cy={toY(challenge.through.y)} r="11" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="4 3" />}
            </g>
            {[a, b].map((p, i) => (
              <g key={i} tabIndex={0} role="button" className="cursor-grab focus:outline-none"
                 aria-label={`Point ${i === 0 ? 'A' : 'B'} at (${p.x}, ${p.y}). Use the arrow keys to move it.`}
                 onPointerDown={e => { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); dragging.current = i as 0 | 1 }}
                 onKeyDown={onKey(i as 0 | 1)}>
                <circle cx={toX(p.x)} cy={toY(p.y)} r="18" fill="transparent" />
                <circle cx={toX(p.x)} cy={toY(p.y)} r="10" fill={i === 0 ? A_COLOR : B_COLOR} stroke="white" strokeWidth="3" />
                <text x={toX(p.x) + 14} y={toY(p.y) - 12} fontSize="16" fontWeight="700" fill={i === 0 ? A_COLOR : B_COLOR} className={HALO} paintOrder="stroke" strokeWidth={5}>
                  {i === 0 ? 'A' : 'B'} ({p.x}, {p.y})
                </text>
              </g>
            ))}
          </svg>
          <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-2">Drag A or B, or tap one and use the arrow keys.</p>
        </div>

        <div className="lg:w-80 flex flex-col gap-4">
          <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm" aria-live="polite">
            <h2 className="text-navy dark:text-white font-semibold mb-2">Slope</h2>
            {line.kind === 'sloped' && (
              <p className="text-3xl font-bold text-navy dark:text-white" data-testid="slope">
                m = <span className="text-amber-600">{r}</span>/<span className="text-teal-600">{u}</span>
                {fracText(line.slope) !== `${r}/${u}` && <> = {fracText(line.slope)}</>}
                {line.slope.den !== 1 && <span className="text-lg font-normal text-slate-500"> ≈ {fracDecimal(line.slope)}</span>}
              </p>
            )}
            {line.kind === 'vertical' && <p className="text-3xl font-bold text-navy dark:text-white" data-testid="slope">undefined</p>}
            {line.kind === 'none' && <p className="text-xl font-bold text-navy dark:text-white" data-testid="slope">no line</p>}
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">{describeSlope(line)}</p>
          </section>
          <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-navy dark:text-white font-semibold mb-2">Equation</h2>
            <p className="font-mono text-lg text-violet-700 dark:text-violet-300" data-testid="slope-intercept">{slopeIntercept(line)}</p>
            {line.kind === 'sloped' && (
              <>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">slope-intercept: y = mx + b, b = {fracText(line.intercept)}</p>
                <p className="font-mono text-base text-slate-700 dark:text-gray-200 mt-3" data-testid="point-slope">{pointSlope(line, a)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">point-slope, through A: y - y₁ = m(x - x₁)</p>
              </>
            )}
          </section>
          <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-navy dark:text-white font-semibold mb-2">Challenge</h2>
            {challenge ? (
              <p className="text-slate-700 dark:text-gray-200 text-sm" data-testid="challenge">
                Make a line with <b>{target}</b> that goes through <b className="text-green-700 dark:text-green-400">({challenge.through.x}, {challenge.through.y})</b>, the green ring.
              </p>
            ) : (
              <p className="text-slate-500 dark:text-gray-400 text-sm">Get a target line, then move A and B to make it.</p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={newChallenge} className="px-3 py-2 rounded-lg bg-navy text-white text-sm font-semibold min-h-[44px]">
                {challenge ? 'New challenge' : 'Start a challenge'}
              </button>
              {challenge && (
                <button onClick={() => setVerdict(checkChallenge(challenge, a, b))}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold min-h-[44px]">Check</button>
              )}
            </div>
            {verdict && (
              <p role="status" data-testid="verdict" className={`mt-3 text-sm font-semibold ${verdict.ok ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {verdict.why}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
