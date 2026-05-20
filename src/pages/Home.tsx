import { useNavigate } from 'react-router-dom'

const tools = [
  {
    id: 'algebra-tiles',
    title: 'Algebra Tiles',
    description: 'Model expressions and equations with draggable tiles',
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.8"/>
        <rect x="18" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.5"/>
        <rect x="2" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.5"/>
        <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'balance-scale',
    title: 'Balance Scale',
    description: 'Explore equations by balancing weights on a scale',
    color: '#0891b2',
    bg: '#cffafe',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="14" y="24" width="4" height="6" fill="currentColor"/>
        <rect x="6" y="28" width="20" height="3" rx="1" fill="currentColor" opacity="0.6"/>
        <path d="M16 4 L6 14 M16 4 L26 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="6" cy="17" r="4" fill="currentColor" opacity="0.7"/>
        <circle cx="26" cy="17" r="4" fill="currentColor" opacity="0.7"/>
        <circle cx="16" cy="4" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'desmos-geometry',
    title: 'Desmos Geometry',
    description: 'Explore shapes, constructions and geometric proofs',
    color: '#059669',
    bg: '#d1fae5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 29,27 3,27" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <circle cx="16" cy="3" r="2.5" fill="currentColor"/>
        <circle cx="29" cy="27" r="2.5" fill="currentColor"/>
        <circle cx="3" cy="27" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'desmos-graphing',
    title: 'Desmos Graphing',
    description: 'Graph equations and explore functions interactively',
    color: '#2563eb',
    bg: '#dbeafe',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4" y1="4" x2="4" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 24 Q10 8 16 16 Q22 24 28 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'fraction-models',
    title: 'Fraction Models',
    description: 'Visualize fractions with circles and bars',
    color: '#d97706',
    bg: '#fef3c7',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M16 3 A13 13 0 0 1 29 16 L16 16 Z" fill="currentColor" opacity="0.8"/>
        <path d="M16 3 A13 13 0 0 0 3 16 L16 16 Z" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'number-line',
    title: 'Number Line',
    description: 'Place and explore numbers on an interactive number line',
    color: '#dc2626',
    bg: '#fee2e2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="8" y1="11" x2="8" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="11" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="24" y1="11" x2="24" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="9" r="3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'place-value',
    title: 'Place Value',
    description: 'Understand digits with a visual place value chart',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="8" width="6" height="18" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="10" y="12" width="6" height="14" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="18" y="16" width="6" height="10" rx="1" fill="currentColor" opacity="0.5"/>
        <rect x="26" y="20" width="4" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'probability-tools',
    title: 'Probability Tools',
    description: 'Simulate coins, dice and spinners to explore probability',
    color: '#db2777',
    bg: '#fce7f3',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor"/>
        <rect x="17" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="25" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="9" cy="17" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M9 17 L9 11 A6 6 0 0 1 14.2 19.5 Z" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: 'scientific-calculator',
    title: 'Scientific Calculator',
    description: 'Full-featured calculator with trig, log and more',
    color: '#475569',
    bg: '#f1f5f9',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="8" y="8" width="16" height="6" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="8" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="14" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="20" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-navy text-white py-8 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="3" fill="white" opacity="0.9"/>
              <rect x="20" y="2" width="14" height="14" rx="3" fill="white" opacity="0.6"/>
              <rect x="2" y="20" width="14" height="14" rx="3" fill="white" opacity="0.6"/>
              <rect x="20" y="20" width="14" height="14" rx="3" fill="white" opacity="0.3"/>
            </svg>
            <h1 className="text-3xl font-bold tracking-tight">Math Tools</h1>
          </div>
          <p className="text-blue-200 text-sm ml-12">Interactive tools for exploring mathematics</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(`/${tool.id}`)}
              className="bg-white rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-transparent hover:border-blue-100 group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: tool.bg, color: tool.color }}
              >
                {tool.icon}
              </div>
              <h2 className="text-navy font-semibold text-base mb-1">{tool.title}</h2>
              <p className="text-slate-500 text-sm leading-snug">{tool.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
