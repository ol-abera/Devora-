import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type Theme = "light" | "dark"

const STORAGE_KEY = "devora_theme"

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === "dark" || v === "light" ? v : null
  } catch { return null }
}

function systemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Puts the `dark` class on <html> (Tailwind's dark variant + the colour overrides in styles.css key off it). */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme // native inputs, selects and scrollbars follow the theme too
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0d0c16" : "#7C3AED")
}

type ThemeState = {
  theme: Theme
  isDark: boolean
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // First visit: follow the device setting. After the user clicks the toggle, their choice wins.
  const [theme, setThemeState] = useState<Theme>(() => readStored() ?? systemTheme())

  useEffect(() => { applyTheme(theme) }, [theme])

  // While the user has not chosen manually, follow the device if it changes (e.g. automatic night mode).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => { if (!readStored()) setThemeState(mq.matches ? "dark" : "light") }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    // Briefly enable colour transitions so the switch fades instead of snapping
    const root = document.documentElement
    root.classList.add("theme-transition")
    window.setTimeout(() => root.classList.remove("theme-transition"), 350)
    setThemeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode: preference lasts for this visit only */ }
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme])

  const value = useMemo<ThemeState>(() => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }), [theme, setTheme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
