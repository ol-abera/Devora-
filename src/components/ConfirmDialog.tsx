import { useEffect, useRef } from "react"

/** Accessible confirmation dialog (focus moves in, Escape cancels). Used before destructive actions. */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg" onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h2 id="confirm-title" className="text-lg font-bold text-slate-900">{title}</h2>
        <p id="confirm-msg" className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[#7C3AED] hover:bg-[#6D28D9]"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
