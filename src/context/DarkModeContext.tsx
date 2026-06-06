import { createContext, useContext } from 'react'

interface DarkModeCtx { isDark: boolean; toggle: () => void }
export const DarkModeContext = createContext<DarkModeCtx>({ isDark: false, toggle: () => {} })
export const useDarkModeContext = () => useContext(DarkModeContext)
