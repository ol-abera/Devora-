import { BookOpen, ShieldCheck } from "lucide-react"
import { formatEtb } from "@/lib/money"

interface OrderSummaryProps {
  title: string
  subtitle?: string
  amountEtb: number
  originalEtb?: number
  compact?: boolean
}

export function OrderSummary({ title, subtitle, amountEtb, originalEtb = 0, compact }: OrderSummaryProps) {
  const discount = originalEtb > amountEtb ? originalEtb - amountEtb : 0
  return (
    <section className={`bg-white rounded-2xl border border-slate-100 ${compact ? "p-4" : "p-5"}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Order summary</p>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-[#7C3AED] flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {discount > 0 && (
          <>
            <div className="flex justify-between text-slate-500">
              <span>List price</span>
              <span className="line-through">{formatEtb(originalEtb)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatEtb(discount)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-slate-100">
          <span>Total</span>
          <span>{formatEtb(amountEtb)}</span>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-2">
        <ShieldCheck size={14} className="shrink-0" />
        Lifetime access after Chapa payment is verified. Prices in Ethiopian Birr.
      </p>
    </section>
  )
}
