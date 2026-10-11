import { Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

/**
 * Pill-shaped light/dark switch.
 *  - Light: pale pill, sun on the left, dark knob on the right.
 *  - Dark:  black pill, white knob on the left, moon + stars on the right.
 * Colours are fixed hex values on purpose so the dark-mode colour overrides never change the switch itself.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${className}`}
      style={{
        backgroundColor: isDark ? "#1c1c21" : "#efeff3",
        borderColor: isDark ? "#0a0a0d" : "#e0e0e7",
        boxShadow: isDark ? "inset 0 1px 3px rgba(0,0,0,.6)" : "inset 0 1px 3px rgba(0,0,0,.12)",
      }}
    >
      {/* Sun (visible in light mode, sits opposite the knob) */}
      <Sun
        size={17}
        strokeWidth={1.75}
        aria-hidden
        className="absolute left-[0.45rem] transition-opacity duration-300"
        style={{ color: "#2a2a30", opacity: isDark ? 0 : 1 }}
      />

      {/* Moon + stars (visible in dark mode) */}
      <svg
        width="22" height="20" viewBox="0 0 22 20" aria-hidden
        className="absolute right-[0.4rem] transition-opacity duration-300"
        style={{ opacity: isDark ? 1 : 0 }}
      >
        <path d="M9.5 3.2a6.6 6.6 0 1 0 6.3 8.9A5.4 5.4 0 0 1 9.5 3.2Z" fill="#f5f5f7" />
        <path d="M16.2 2.2l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z" fill="#f5f5f7" />
        <path d="M19 9.2l.45 1.1 1.1.45-1.1.45-.45 1.1-.45-1.1-1.1-.45 1.1-.45z" fill="#f5f5f7" />
      </svg>

      {/* Knob */}
      <span
        aria-hidden
        className="absolute top-1 h-6 w-6 rounded-full transition-all duration-300 ease-out"
        style={{
          left: isDark ? "0.25rem" : "calc(100% - 1.75rem)",
          backgroundColor: isDark ? "#f5f5f7" : "#2b2b30",
          boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.5)" : "0 1px 3px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.15)",
        }}
      />
    </button>
  )
}
