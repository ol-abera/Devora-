import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Award, Printer, Link2, ArrowLeft } from "lucide-react"
import { useCertificates } from "@/hooks/queries"
import { ErrorState, Spinner } from "@/components/ui"
import { CertificateCard } from "@/components/CertificateCard"

export default function CertificatesPage() {
  const { data: certificates = [], isLoading, isError, error, refetch } = useCertificates()

  const copyLink = async (credentialId: string) => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(credentialId)}`
    try { await navigator.clipboard.writeText(url); toast.success("Verification link copied") }
    catch { toast.error("Could not copy. Link: " + url) }
  }

  // Marks one certificate as the print target, opens the print dialog (choose "Save as PDF"), then cleans up
  const print = (id: string) => {
    const el = document.getElementById(`cert-${id}`)
    if (!el) return
    el.classList.add("print-target")
    const done = () => { el.classList.remove("print-target"); window.removeEventListener("afterprint", done) }
    window.addEventListener("afterprint", done)
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Back to Dashboard</Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-1">Verified credentials for completed courses</p>
        </div>

        {isLoading ? <Spinner label="Loading certificates" /> : isError ? <ErrorState message={error.message} onRetry={() => refetch()} /> : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4"><Award size={28} className="text-purple-600" /></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-500 mb-6">Complete a course to earn your first certificate.</p>
            <Link to="/courses" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700">Browse Courses</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {certificates.map(cert => (
              <section key={cert.id} aria-label={`Certificate for ${cert.courseTitle}`}>
                <CertificateCard cert={cert} />
                <div className="mt-4 flex flex-wrap justify-center gap-6">
                  <button onClick={() => print(cert.id)} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700"><Printer size={16} /> Print or save as PDF</button>
                  <button onClick={() => copyLink(cert.credentialId)} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700"><Link2 size={16} /> Copy verification link</button>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
