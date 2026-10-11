import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useUpdateProfile } from "@/hooks/queries"
import { useApp } from "@/hooks/useApp"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { FieldError, PageShell } from "@/components/ui"
import { LOCALES, useI18n, type Locale } from "@/i18n"

export default function SettingsPage() {
  const { user } = useAuth()
  const { logout } = useApp()
  const { t, locale, setLocale } = useI18n()
  const update = useUpdateProfile()
  const [name, setName] = useState(user?.name ?? "")
  const [reminders, setReminders] = useState(user?.weeklyReminder ?? false)
  const [goal, setGoal] = useState(user?.weeklyGoal ?? 5)
  const [lang, setLang] = useState<Locale>(user?.locale ?? locale)
  const [error, setError] = useState("")
  const [confirmOut, setConfirmOut] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setReminders(user.weeklyReminder)
    setGoal(user.weeklyGoal)
    if (user.locale) setLang(user.locale)
  }, [user])

  if (!user) return null

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError("Enter your name (at least 2 characters)")
    setError("")
    update.mutate(
      { name: name.trim(), weeklyReminder: reminders, weeklyGoal: goal, locale: lang },
      {
        onSuccess: () => {
          setLocale(lang)
          toast.success(t("settings.saved"))
        },
        onError: err => toast.error(err.message),
      },
    )
  }

  return (
    <PageShell narrow>
      <h1 className="text-2xl font-bold text-slate-900">{t("settings.title")}</h1>
      <p className="text-sm text-slate-500 mt-1">{t("settings.subtitle")}</p>
      <p className="text-sm text-slate-400 mt-1">{user.email} · <span className="capitalize">{user.role}</span></p>
      <form onSubmit={save} noValidate className="mt-6 bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div>
          <label htmlFor="display-name" className="text-sm text-slate-600">{t("settings.displayName")}</label>
          <input id="display-name" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "name-err" : undefined} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#7C3AED]" />
          <FieldError id="name-err" message={error} />
        </div>

        <div>
          <label htmlFor="pref-lang" className="text-sm text-slate-600">{t("settings.language")}</label>
          <select
            id="pref-lang"
            value={lang}
            onChange={e => setLang(e.target.value as Locale)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#7C3AED] text-sm"
          >
            {LOCALES.map(l => (
              <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">{t("settings.languageHint")}</p>
        </div>

        <div>
          <label htmlFor="weekly-goal" className="text-sm text-slate-600">{t("settings.weeklyGoal")}</label>
          <input
            id="weekly-goal"
            type="number"
            min={1}
            max={30}
            value={goal}
            onChange={e => setGoal(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#7C3AED]"
          />
        </div>

        <label className="flex items-center justify-between text-sm text-slate-700">
          {t("settings.weeklyReminder")}
          <input type="checkbox" checked={reminders} onChange={e => setReminders(e.target.checked)} className="accent-[#7C3AED] w-4 h-4" />
        </label>

        <button type="submit" disabled={update.isPending} className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold disabled:opacity-60">
          {update.isPending ? t("settings.saving") : t("settings.save")}
        </button>
        <button type="button" onClick={() => setConfirmOut(true)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium">
          {t("settings.signOut")}
        </button>
      </form>
      <ConfirmDialog
        open={confirmOut}
        title="Sign out?"
        message="You will need to sign in again to continue learning."
        confirmLabel={t("settings.signOut")}
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => { setConfirmOut(false); void logout() }}
      />
    </PageShell>
  )
}
