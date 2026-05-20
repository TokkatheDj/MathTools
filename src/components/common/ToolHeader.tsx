import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
}

export default function ToolHeader({ title }: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 bg-navy text-white px-4 h-14 shadow-md flex-shrink-0">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors text-sm font-medium"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" />
        </svg>
        Math Tools
      </button>
      <span className="text-blue-300 select-none">/</span>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </div>
  )
}
