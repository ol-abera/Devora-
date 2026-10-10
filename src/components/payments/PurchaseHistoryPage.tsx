import { Link } from "react-router-dom"
import { Receipt } from "lucide-react"
import type { PaymentStatus } from "@/api"
import { usePayments } from "@/hooks/queries"
import { EmptyState, ErrorState, PageShell, Spinner, LinkButton } from "@/components/ui"
import { formatDate, formatEtb } from "@/lib/money"

const TONE: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
}

export function PurchaseHistoryPage() {
  const { data: payments, isLoading, isError, error, refetch } = usePayments()
  return (
    <PageShell narrow>
      <h1 className="text-3xl font-bold text-slate-900">My purchases</h1>
      <p className="text-slate-500 mt-1 text-sm">Paid courses unlock only after the payment is verified.</p>
      {isLoading ? <Spinner label="Loading purchases" /> : isError ? <ErrorState message={error.message} onRetry={() => refetch()} /> : !payments?.length ? (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100"><EmptyState icon={<Receipt size={40} />} title="No payments yet." action={<LinkButton to="/courses">Browse courses</LinkButton>} /></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {payments.map(p => (
            <li key={p.txRef} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{p.courseTitle}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(p.createdAt)} · <span className="font-mono">{p.txRef}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">{formatEtb(p.amountEtb)}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${TONE[p.status]}`}>{p.status}</span>
                <Link to={p.status === "pending" ? `/payment/return?tx_ref=${encodeURIComponent(p.txRef)}` : `/purchases/${p.txRef}`} className="text-sm font-medium text-[#7C3AED]">{p.status === "pending" ? "Check status" : "Receipt"}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
