import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { request, USE_MOCK } from "@/api/http"
import { usePayment } from "@/hooks/queries"
import { OrderSummary } from "@/components/payments/OrderSummary"
import { Spinner } from "@/components/ui"
import type { PaymentStatus } from "@/api"

const CHOICES: { status: PaymentStatus; label: string }[] = [
  { status: "success", label: "Pay successfully" },
  { status: "failed", label: "Simulate failed payment" },
  { status: "cancelled", label: "Cancel and go back" },
  { status: "pending", label: "Leave payment pending" },
]

/**
 * MOCK ONLY. Stands in for Chapa's hosted checkout page while the real backend is not connected.
 * With VITE_USE_MOCK=false this route shows nothing, and the browser goes to the real Chapa URL.
 */
export function MockChapaPage() {
  const { txRef } = useParams()
  const navigate = useNavigate()
  const paymentQ = usePayment(txRef)
  const [busy, setBusy] = useState<PaymentStatus | null>(null)

  if (!USE_MOCK) return <main className="pt-24 text-center text-slate-500">Not available.</main>
  if (paymentQ.isLoading || !paymentQ.data) return <main className="pt-24"><Spinner /></main>
  const p = paymentQ.data

  const choose = async (status: PaymentStatus) => {
    setBusy(status)
    if (status !== "pending") await request(`/mock/chapa/${txRef}/settle`, { method: "POST", body: { status } })
    navigate(`/payment/return?tx_ref=${encodeURIComponent(p.txRef)}`)
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#0F172A]">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center text-white mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Chapa checkout (demo)</p>
          <h1 className="text-2xl font-bold mt-2">Pay Devora</h1>
          <p className="text-sm text-slate-300 mt-2">Demo screen. With the real backend this page is hosted by Chapa. Pick an outcome.</p>
        </div>
        <OrderSummary title={p.courseTitle} amountEtb={p.amountEtb} originalEtb={0} compact />
        <p className="text-xs text-slate-400 mt-4 font-mono break-all">tx_ref {p.txRef}</p>
        <div className="mt-4 grid gap-2">
          {CHOICES.map(c => (
            <button key={c.status} disabled={busy !== null} onClick={() => choose(c.status)}
              className={`w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60 ${c.status === "success" ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]" : "bg-white/10 text-white hover:bg-white/15"}`}>
              {busy === c.status ? "Contacting Chapa…" : c.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
