import { useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { paymentsApi } from "@/api"
import { PaymentStatusCard } from "@/components/payments/PaymentStatusCard"
import { ErrorState, PageShell, Spinner } from "@/components/ui"
import { useApp } from "@/hooks/useApp"
import { useCourse } from "@/hooks/queries"

/**
 * Chapa sends the customer back here: /payment/return?tx_ref=...
 * We ask the server to verify. The UI never decides access by itself.
 * While the payment is still "pending" we re-check every 4 seconds, up to 8 times.
 */
export function PaymentReturnPage() {
  const [params] = useSearchParams()
  const txRef = params.get("tx_ref") ?? params.get("trx_ref") ?? ""
  const { continueLearning, beginCheckout } = useApp()
  const qc = useQueryClient()
  const tries = useRef(0)

  const q = useQuery({
    queryKey: ["payment-verify", txRef],
    queryFn: () => { tries.current += 1; return paymentsApi.verify(txRef) },
    enabled: !!txRef,
    retry: false,
    refetchInterval: query => (query.state.data?.status === "pending" && tries.current < 8 ? 4000 : false),
  })
  const payment = q.data
  const courseQ = useCourse(payment?.courseId)

  useEffect(() => {
    if (payment && payment.status !== "pending") qc.invalidateQueries({ queryKey: ["me"] }) // refresh enrollments, notifications, purchases
  }, [payment?.status, qc, payment])

  if (!txRef) return <PageShell narrow><ErrorState message="This page needs a payment reference. Open it from your purchase history." /><Link to="/purchases" className="block text-center text-sm text-[#7C3AED] font-medium">Purchase history</Link></PageShell>
  if (q.isLoading) return <PageShell narrow><Spinner label="Verifying your payment with Chapa" /></PageShell>
  if (q.isError || !payment) return <PageShell narrow><ErrorState message={q.error?.message ?? "Could not verify this payment."} onRetry={() => { tries.current = 0; q.refetch() }} /></PageShell>

  const course = courseQ.data
  return (
    <PageShell narrow>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Payment status</h1>
        <PaymentStatusCard status={payment.status} amountEtb={payment.amountEtb} txRef={payment.txRef} accessGranted={payment.accessGranted} courseTitle={payment.courseTitle} />
        <div className="flex flex-col sm:flex-row gap-3">
          {payment.accessGranted && <button onClick={() => continueLearning({ id: payment.courseId })} className="flex-1 py-3 rounded-xl bg-[#7C3AED] text-white font-semibold">Start learning</button>}
          {payment.status === "success" && <Link to={`/purchases/${payment.txRef}`} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 text-center">View receipt</Link>}
          {payment.status === "pending" && <button onClick={() => { tries.current = 0; q.refetch() }} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700">Check again</button>}
          {!payment.accessGranted && payment.status !== "pending" && course && <button onClick={() => beginCheckout(course)} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700">Try payment again</button>}
        </div>
      </div>
    </PageShell>
  )
}
