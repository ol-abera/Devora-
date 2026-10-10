import { Ban, CheckCircle2, Clock3, XCircle } from "lucide-react"
import type { PaymentStatus } from "@/api"
import { formatEtb } from "@/lib/money"

const COPY: Record<PaymentStatus, { title: string; body: string; tone: string }> = {
  pending: {
    title: "Pending",
    body: "Chapa has not confirmed this payment yet. The course stays locked until the server verifies it. This page checks again automatically.",
    tone: "text-amber-800 bg-amber-50",
  },
  success: {
    title: "Payment verified",
    body: "Your payment was verified with Chapa and your course is unlocked.",
    tone: "text-emerald-800 bg-emerald-50",
  },
  failed: {
    title: "Failed",
    body: "Chapa did not complete this payment. Your course stays locked, and you can try again.",
    tone: "text-red-800 bg-red-50",
  },
  cancelled: {
    title: "Cancelled",
    body: "You left Chapa before paying. The course remains locked.",
    tone: "text-slate-700 bg-slate-100",
  },
}

const ICONS = { pending: Clock3, success: CheckCircle2, failed: XCircle, cancelled: Ban } as const

export function PaymentStatusCard({ status, amountEtb, txRef, accessGranted, courseTitle }: {
  status: PaymentStatus; amountEtb: number; txRef: string; accessGranted: boolean; courseTitle: string
}) {
  const meta = COPY[status]
  const Icon = ICONS[status]
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6" role="status" aria-live="polite">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${meta.tone}`}>
        <Icon size={16} /> {meta.title}
      </div>
      <h2 className="text-xl font-bold text-slate-900 mt-4">{courseTitle}</h2>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{meta.body}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-slate-400 text-xs">Amount</dt><dd className="font-semibold text-slate-900">{formatEtb(amountEtb)}</dd></div>
        <div><dt className="text-slate-400 text-xs">Reference</dt><dd className="font-mono text-xs text-slate-700 break-all">{txRef}</dd></div>
        <div><dt className="text-slate-400 text-xs">Access</dt><dd className="font-semibold">{accessGranted ? "Unlocked" : "Locked"}</dd></div>
        <div><dt className="text-slate-400 text-xs">Provider</dt><dd className="font-semibold text-slate-900">Chapa</dd></div>
      </dl>
    </section>
  )
}
