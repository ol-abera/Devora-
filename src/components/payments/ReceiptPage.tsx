import { Link, useParams } from "react-router-dom"
import { Printer } from "lucide-react"
import { ReceiptCard } from "@/components/payments/ReceiptCard"
import { ErrorState, PageShell, Spinner } from "@/components/ui"
import { usePayment } from "@/hooks/queries"

export function ReceiptPage() {
  const { txRef } = useParams()
  const { data: purchase, isLoading, isError, error, refetch } = usePayment(txRef)
  return (
    <PageShell narrow>
      <div className="space-y-4">
        <Link to="/purchases" className="text-sm text-slate-500 hover:text-slate-700">← Purchase history</Link>
        {isLoading ? <Spinner label="Loading receipt" /> : isError || !purchase ? <ErrorState message={error?.message ?? "Receipt not found."} onRetry={() => refetch()} /> : (
          <>
            <ReceiptCard purchase={purchase} />
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED]"><Printer size={14} /> Print or save as PDF</button>
            {!purchase.accessGranted && <p className="text-sm text-slate-500">This receipt records the Chapa attempt. Course access was not granted.</p>}
          </>
        )}
      </div>
    </PageShell>
  )
}
