import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AlgebraTiles from './pages/AlgebraTiles'
import BalanceScale from './pages/BalanceScale'
import DesmosGeometry from './pages/DesmosGeometry'
import DesmosGraphing from './pages/DesmosGraphing'
import FractionModels from './pages/FractionModels'
import NumberLine from './pages/NumberLine'
import PlaceValue from './pages/PlaceValue'
import ProbabilityTools from './pages/ProbabilityTools'
import ScientificCalculator from './pages/ScientificCalculator'

export default function App() {
  return (
    <HashRouter>
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
      </Routes>
    </HashRouter>
  )
}
