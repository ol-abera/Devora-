import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Award, Printer, Link2, ArrowLeft } from "lucide-react"
import { useCertificates } from "@/hooks/queries"
import { ErrorState, Spinner } from "@/components/ui"
import { formatDate } from "@/lib/money"

export default function CertificatesPage() {
  const { data: certificates = [], isLoading, isError, error, refetch } = useCertificates()

  const copyLink = async (credentialId: string) => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(credentialId)}`
    try { await navigator.clipboard.writeText(url); toast.success("Verification link copied") }
    catch { toast.error("Could not copy. Link: " + url) }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors print:hidden">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-1">Verified credentials for completed courses</p>
        </div>

        {isLoading ? <Spinner label="Loading certificates" /> : isError ? <ErrorState message={error.message} onRetry={() => refetch()} /> : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Award size={28} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-500 mb-6">Complete a course to earn your first certificate.</p>
            <Link to="/courses" className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">Browse Courses</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm"
              >
                {/* Certificate header gradient */}
                <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-6 py-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <Award size={24} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Certificate of Completion</h2>
                  <p className="text-purple-200 text-sm mt-1">DEVORA Learning Platform</p>
                </div>

                {/* Certificate body */}
                <div className="px-6 py-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">This certifies that</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{cert.studentName}</h3>
                    <p className="text-sm text-gray-500 mt-2">has successfully completed</p>
                    <p className="text-lg font-semibold text-purple-700 mt-1">{cert.courseTitle}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-gray-400 text-xs">Date</p>
                      <p className="text-gray-700 font-medium">{formatDate(cert.issuedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Credential ID</p>
                      <p className="text-gray-700 font-mono text-xs">{cert.credentialId}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center gap-6 print:hidden">
                    <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700"><Printer size={16} /> Print or save as PDF</button>
                    <button onClick={() => copyLink(cert.credentialId)} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700"><Link2 size={16} /> Copy verification link</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
