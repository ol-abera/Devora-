import { useEffect, useRef, useState } from "react"
import { Globe, Check } from "lucide-react"
import { LOCALES, useI18n, type Locale } from "@/i18n"
import { useAuth } from "@/context/AuthContext"
import { authApi } from "@/api"

/** Visible language selector. Saves preference to localStorage via I18nProvider. */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n()
  const { user, setUser } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const current = LOCALES.find(l => l.code === locale)!

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        className={`inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-[#7C3AED] hover:bg-slate-50 transition-colors ${compact ? "p-2" : "px-2.5 py-1.5"}`}
      >
        <Globe size={16} aria-hidden />
        {!compact && <span className="hidden sm:inline">{current.native}</span>}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("nav.language")}
          className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 py-1 z-50"
        >
          {LOCALES.map(l => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <button
                type="button"
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${l.code === locale ? "text-[#7C3AED] font-medium" : "text-slate-700"}`}
                onClick={() => {
                  const next = l.code as Locale
                  setLocale(next)
                  setOpen(false)
                  if (user) {
                    authApi.updateProfile({ locale: next }).then(setUser).catch(() => { /* local preference still applies */ })
                  }
                }}
              >
                <span>
                  <span className="block">{l.native}</span>
                  <span className="text-xs text-slate-400">{l.label}</span>
                </span>
                {l.code === locale && <Check size={14} className="text-[#7C3AED]" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
