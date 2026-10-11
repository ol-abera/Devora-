import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import en, { type TranslationKey } from "./locales/en"
import am from "./locales/am"
import om from "./locales/om"

export type Locale = "en" | "am" | "om"

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "om", label: "Afaan Oromo", native: "Afaan Oromoo" },
]

const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en,
  am,
  om,
}

const STORAGE_KEY = "devora.locale"

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en"
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const raw of candidates) {
    const code = raw.toLowerCase().split("-")[0]
    if (code === "am" || code === "om" || code === "en") return code
    // Common regional tags
    if (raw.toLowerCase().startsWith("am-") || raw.toLowerCase() === "amh") return "am"
    if (raw.toLowerCase().startsWith("om-") || raw.toLowerCase() === "orm") return "om"
  }
  return "en" // unsupported languages fall back to English
}

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "en" || v === "am" || v === "om") return v
  } catch { /* ignore */ }
  return null
}

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  /** native label for the current locale */
  localeLabel: string
}

const I18nContext = createContext<I18nState | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale() ?? detectBrowserLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
    document.documentElement.lang = next === "am" ? "am" : next === "om" ? "om" : "en"
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === "am" ? "am" : locale === "om" ? "om" : "en"
  }, [locale])

  const t = useCallback((key: TranslationKey): string => {
    return dictionaries[locale][key] ?? en[key] ?? key
  }, [locale])

  const value = useMemo<I18nState>(() => ({
    locale,
    setLocale,
    t,
    localeLabel: LOCALES.find(l => l.code === locale)?.native ?? "English",
  }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider")
  return ctx
}

/** Call when the signed-in profile loads so server preference wins over localStorage. */
export function useSyncLocaleFromProfile(profileLocale: Locale | undefined | null) {
  const { locale, setLocale } = useI18n()
  useEffect(() => {
    if (!profileLocale) return
    if (profileLocale !== locale) setLocale(profileLocale)
  }, [profileLocale]) // eslint-disable-line react-hooks/exhaustive-deps — only when profile locale changes
}
