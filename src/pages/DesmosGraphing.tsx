import { useEffect, useRef } from 'react'
import ToolHeader from '../components/common/ToolHeader'

// The bits of the Desmos API this page uses (loaded from their CDN in index.html).
interface DesmosCalculator { destroy(): void }
interface DesmosApi { GraphingCalculator(el: HTMLElement, options: Record<string, unknown>): DesmosCalculator }

export default function DesmosGraphing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const calcRef = useRef<DesmosCalculator | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const D = (window as Window & { Desmos?: DesmosApi }).Desmos
    if (!D) return
    calcRef.current = D.GraphingCalculator(containerRef.current, {
      keypad: true,
      expressions: true,
      settingsMenu: true,
      border: false,
    })
    return () => {
      calcRef.current?.destroy()
      calcRef.current = null
    }
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <ToolHeader title="Desmos Graphing Calculator" />
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
