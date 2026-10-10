import type { Payment } from "@/api"
import { formatEtb } from "@/lib/money"

export function ReceiptCard({ purchase }: { purchase: Payment }) {
  const when = purchase.paidAt ? new Date(purchase.paidAt).toLocaleString("en-ET", { dateStyle: "medium", timeStyle: "short" }) : "Not paid"
  return (
    <article className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#5B21B6] text-white px-6 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">Devora receipt</p>
        <h2 className="text-2xl font-bold mt-1">Payment receipt</h2>
        <p className="text-sm text-white/80 mt-1">{purchase.accessGranted ? "Verified purchase" : "Not verified. No course access."}</p>
      </div>
      <div className="p-6 space-y-3 text-sm">
        <Row label="Course" value={purchase.courseTitle} />
        <Row label="Student" value={purchase.buyerName} />
        <Row label="Email" value={purchase.email} />
        <Row label="Phone" value={purchase.phone} />
        <Row label="Amount" value={formatEtb(purchase.amountEtb)} />
        <Row label="Status" value={purchase.status} />
        <Row label="Chapa reference" value={purchase.providerReference ?? "—"} mono />
        <Row label="Devora reference" value={purchase.txRef} mono />
        <Row label="Time" value={when} />
      </div>
    </article>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-2">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-right text-slate-900 font-medium ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</span>
    </div>
  )
}
