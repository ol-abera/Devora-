import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { BadgeCheck, ShieldX } from "lucide-react"
import { meApi } from "@/api"
import { PageShell, Spinner, ErrorState } from "@/components/ui"
import { formatDate } from "@/lib/money"

/** Public page: anyone can check a credential ID. GET /certificates/verify/:credentialId */
export default function VerifyCertificatePage() {
  const { credentialId } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(credentialId ?? "")
  const q = useQuery({ queryKey: ["verify-cert", credentialId], queryFn: () => meApi.verifyCertificate(credentialId!), enabled: !!credentialId, retry: false })

  return (
    <PageShell narrow>
      <h1 className="text-2xl font-bold text-slate-900">Verify a certificate</h1>
      <p className="text-sm text-slate-500 mt-1">Enter the credential ID printed on a Devora certificate.</p>
      <form onSubmit={e => { e.preventDefault(); if (input.trim()) navigate(`/verify/${encodeURIComponent(input.trim())}`) }} className="mt-5 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} aria-label="Credential ID" placeholder="DEV-CRS1-ABC123" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-sm outline-none focus:border-[#7C3AED]" />
        <button className="px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold">Verify</button>
      </form>
      <div className="mt-6" aria-live="polite">
        {q.isLoading && <Spinner label="Checking" />}
        {q.isError && <ErrorState message={q.error.message} onRetry={() => q.refetch()} />}
        {q.data?.valid && q.data.certificate && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <p className="flex items-center gap-2 font-semibold text-emerald-800"><BadgeCheck /> Valid certificate</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-emerald-700">Awarded to</dt><dd className="font-medium text-slate-900">{q.data.certificate.studentName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-emerald-700">Course</dt><dd className="font-medium text-slate-900 text-right">{q.data.certificate.courseTitle}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-emerald-700">Issued</dt><dd className="font-medium text-slate-900">{formatDate(q.data.certificate.issuedAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-emerald-700">Credential ID</dt><dd className="font-mono text-xs text-slate-900">{q.data.certificate.credentialId}</dd></div>
            </dl>
          </div>
        )}
        {q.data && !q.data.valid && (
          <div role="alert" className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-3 text-red-800"><ShieldX /> No certificate matches this ID.</div>
        )}
      </div>
    </PageShell>
  )
}
