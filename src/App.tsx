import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { DarkModeContext } from './context/DarkModeContext'
import { useDarkMode } from './hooks/useDarkMode'
import Home from './pages/Home'

// Each tool loads when it's opened, so the home page doesn't download the maths
// library, the charts and the drag-and-drop kit up front.
const AlgebraTiles = lazy(() => import('./pages/AlgebraTiles'))
const BalanceScale = lazy(() => import('./pages/BalanceScale'))
const DesmosGeometry = lazy(() => import('./pages/DesmosGeometry'))
const DesmosGraphing = lazy(() => import('./pages/DesmosGraphing'))
const FractionModels = lazy(() => import('./pages/FractionModels'))
const NumberLine = lazy(() => import('./pages/NumberLine'))
const PlaceValue = lazy(() => import('./pages/PlaceValue'))
const ProbabilityTools = lazy(() => import('./pages/ProbabilityTools'))
const ScientificCalculator = lazy(() => import('./pages/ScientificCalculator'))
const UnitConverter = lazy(() => import('./pages/UnitConverter'))

export default function App() {
  const darkMode = useDarkMode()
  return (
    <DarkModeContext.Provider value={darkMode}>
      <HashRouter>
        <main>
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-500 dark:bg-gray-900 dark:text-gray-400">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/algebra-tiles" element={<AlgebraTiles />} />
          <Route path="/balance-scale" element={<BalanceScale />} />
          <Route path="/desmos-geometry" element={<DesmosGeometry />} />
          <Route path="/desmos-graphing" element={<DesmosGraphing />} />
          <Route path="/fraction-models" element={<FractionModels />} />
          <Route path="/number-line" element={<NumberLine />} />
          <Route path="/place-value" element={<PlaceValue />} />
          <Route path="/probability-tools" element={<ProbabilityTools />} />
          <Route path="/scientific-calculator" element={<ScientificCalculator />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
        </Routes>
        </Suspense>
        </main>
      </HashRouter>
    </DarkModeContext.Provider>
  )
}
