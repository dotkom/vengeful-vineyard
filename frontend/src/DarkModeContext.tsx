// DarkModeContext.tsx
import { createContext, useContext, useEffect, useState } from "react"

interface DarkModeContextProps {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

export const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined)

interface DarkModeProviderProps {
  children: React.ReactNode
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const localDarkMode = window.localStorage.getItem("darkMode")
    return localDarkMode !== null
      ? JSON.parse(localDarkMode)
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(darkMode ? "light" : "dark")
    root.classList.add(darkMode ? "dark" : "light")

    window.localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  return <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>{children}</DarkModeContext.Provider>
}

export const useDarkMode = (): DarkModeContextProps => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider")
  }
  return context
}
