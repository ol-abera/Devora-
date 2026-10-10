import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useUpdateProfile } from "@/hooks/queries"
import { useApp } from "@/hooks/useApp"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { FieldError, PageShell } from "@/components/ui"

export default function SettingsPage() {
  const { user } = useAuth()
  const { logout } = useApp()
  const update = useUpdateProfile()
  const [name, setName] = useState(user?.name ?? "")
  const [reminders, setReminders] = useState(user?.weeklyReminder ?? false)
  const [error, setError] = useState("")
  const [confirmOut, setConfirmOut] = useState(false)
  if (!user) return null

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError("Enter your name (at least 2 characters)")
    setError("")
    update.mutate({ name: name.trim(), weeklyReminder: reminders }, { onSuccess: () => toast.success("Settings saved"), onError: err => toast.error(err.message) })
  }

  return (
    <PageShell narrow>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-500 mt-1">{user.email} · <span className="capitalize">{user.role}</span></p>
      <form onSubmit={save} noValidate className="mt-6 bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div>
          <label htmlFor="display-name" className="text-sm text-slate-600">Display name</label>
          <input id="display-name" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "name-err" : undefined} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#7C3AED]" />
          <FieldError id="name-err" message={error} />
        </div>
        <label className="flex items-center justify-between text-sm text-slate-700">
          Weekly learning reminder (email)
          <input type="checkbox" checked={reminders} onChange={e => setReminders(e.target.checked)} className="accent-[#7C3AED] w-4 h-4" />
        </label>
        <button type="submit" disabled={update.isPending} className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold disabled:opacity-60">{update.isPending ? "Saving…" : "Save settings"}</button>
        <button type="button" onClick={() => setConfirmOut(true)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium">Sign out</button>
      </form>
      <ConfirmDialog open={confirmOut} title="Sign out?" message="You will need to sign in again to continue learning." confirmLabel="Sign out" onCancel={() => setConfirmOut(false)} onConfirm={() => void logout()} />
    </PageShell>
  )
}
