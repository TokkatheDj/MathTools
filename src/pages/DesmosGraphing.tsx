import { useEffect, useRef } from 'react'
import ToolHeader from '../components/common/ToolHeader'

export default function DesmosGraphing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const calcRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const D = (window as any).Desmos
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
