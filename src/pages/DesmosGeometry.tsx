import ToolHeader from '../components/common/ToolHeader'

export default function DesmosGeometry() {
  return (
    <div className="flex flex-col h-screen">
      <ToolHeader title="Desmos Geometry Tool" />
      <iframe
        src="https://www.desmos.com/geometry"
        className="flex-1 w-full border-0"
        title="Desmos Geometry"
        allow="fullscreen"
      />
    </div>
  )
}
