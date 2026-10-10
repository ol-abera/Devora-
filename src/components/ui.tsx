import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react"

/** Shared loading / error / empty building blocks so every screen handles all three states the same way. */
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16 text-slate-500 text-sm">
      <div className="w-5 h-5 border-2 border-slate-200 border-t-[#7C3AED] rounded-full animate-spin" />
      {label}…
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="h-40 bg-slate-100" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-3 w-2/3 bg-slate-100 rounded" />
            <div className="h-8 w-full bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="text-center py-16 px-4">
      <AlertTriangle size={40} className="mx-auto text-amber-400 mb-4" />
      <p className="text-slate-700 font-medium">Something went wrong</p>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{message ?? "We could not load this. Please try again."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9]">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto mb-4 w-fit text-slate-300">{icon ?? <Inbox size={40} />}</div>
      <p className="text-slate-600 font-medium">{title}</p>
      {hint && <p className="text-sm text-slate-400 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageShell({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#F8F7FC]">
      <div className={`${narrow ? "max-w-2xl" : "max-w-6xl"} mx-auto px-4 sm:px-6`}>{children}</div>
    </main>
  )
}

export function LinkButton({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-block px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]">{children}</Link>
}

/** Inline field error used by forms. Pair with aria-invalid on the input. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="mt-1 text-xs text-red-600">{message}</p>
}
