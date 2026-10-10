import type { Certificate } from "@/api"
import { formatDate } from "@/lib/money"
import { LogoMark } from "@/components/Logo"

/**
 * Landscape (A4 ratio) certificate. All sizes use container units (cqw), so it looks the same
 * on a phone, on desktop and when printed. Printing is handled by the .print-target rules in styles.css.
 */
export function CertificateCard({ cert }: { cert: Certificate }) {
  const verifyUrl = `${window.location.host}/verify/${cert.credentialId}`
  return (
    <div id={`cert-${cert.id}`} className="@container w-full">
      <div className="certificate relative w-full aspect-[1.414/1] rounded-[1.2cqw] overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#4C1D95] p-[1.1cqw] shadow-xl shadow-[#7C3AED]/15">
        <div className="relative h-full w-full bg-white rounded-[0.7cqw] overflow-hidden">
          {/* inner frame */}
          <div className="absolute inset-[1.2cqw] border border-[#7C3AED]/30 rounded-[0.4cqw] pointer-events-none" />
          {/* corner ornaments */}
          {[
            "top-[1.2cqw] left-[1.2cqw]",
            "top-[1.2cqw] right-[1.2cqw] rotate-90",
            "bottom-[1.2cqw] right-[1.2cqw] rotate-180",
            "bottom-[1.2cqw] left-[1.2cqw] -rotate-90",
          ].map(pos => (
            <svg key={pos} viewBox="0 0 40 40" className={`absolute w-[6cqw] h-[6cqw] ${pos}`} aria-hidden="true">
              <path d="M2 38V2h36" fill="none" stroke="#7C3AED" strokeWidth="2" />
              <path d="M8 38V8h30" fill="none" stroke="#06B6D4" strokeWidth="1" />
              <circle cx="2" cy="2" r="2.5" fill="#7C3AED" />
            </svg>
          ))}
          {/* watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none" aria-hidden="true">
            <LogoMark size={420} className="w-[48cqw] h-[48cqw]" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-between px-[7cqw] py-[4.2cqw] text-center">
            {/* header */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-[1cqw]">
                <LogoMark size={64} className="w-[4.6cqw] h-[4.6cqw]" />
                <span className="text-[3.2cqw] font-extrabold tracking-tight text-slate-900 leading-none">DEVORA</span>
              </div>
              <p className="mt-[2cqw] text-[1.35cqw] font-semibold tracking-[0.5em] text-[#7C3AED] uppercase pl-[0.5em]">Certificate of Completion</p>
              <div className="mt-[1cqw] flex items-center gap-[0.8cqw]" aria-hidden="true">
                <span className="h-px w-[8cqw] bg-gradient-to-r from-transparent to-[#7C3AED]/60" />
                <span className="w-[0.6cqw] h-[0.6cqw] rotate-45 bg-[#06B6D4]" />
                <span className="h-px w-[8cqw] bg-gradient-to-l from-transparent to-[#7C3AED]/60" />
              </div>
            </div>

            {/* body */}
            <div className="w-full">
              <p className="text-[1.5cqw] text-slate-500">This certificate is proudly presented to</p>
              <h3 className="mt-[0.8cqw] font-serif italic text-[5cqw] leading-tight text-slate-900 break-words">{cert.studentName}</h3>
              <div className="mx-auto mt-[0.8cqw] h-px w-[60%] bg-slate-200" />
              <p className="mt-[1.4cqw] text-[1.5cqw] text-slate-500">for successfully completing the course</p>
              <p className="mt-[0.6cqw] text-[2.5cqw] font-bold leading-snug text-[#5B21B6]">{cert.courseTitle}</p>
            </div>

            {/* footer */}
            <div className="w-full grid grid-cols-3 items-end gap-[2cqw]">
              <div className="text-left">
                <p className="text-[1.1cqw] uppercase tracking-widest text-slate-400">Date of issue</p>
                <p className="mt-[0.3cqw] text-[1.55cqw] font-semibold text-slate-800 border-b border-slate-300 pb-[0.4cqw]">{formatDate(cert.issuedAt)}</p>
              </div>

              {/* seal */}
              <div className="flex justify-center">
                <svg viewBox="0 0 100 100" className="w-[9.5cqw] h-[9.5cqw] drop-shadow" role="img" aria-label="Devora seal">
                  <defs>
                    <linearGradient id={`gold-${cert.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#FCD34D" />
                      <stop offset="1" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                  <polygon fill={`url(#gold-${cert.id})`} points={Array.from({ length: 48 }, (_, i) => {
                    const a = (i * Math.PI) / 24
                    const r = i % 2 ? 44 : 49
                    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
                  }).join(" ")} />
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="31" fill="#4C1D95" />
                  <path d="M40 34h10c8.3 0 14 5.3 14 13.2S58.300 61 50 61H40V34Zm7 6.200v14.600h3c4.400 0 7-2.800 7-7.300s-2.600-7.300-7-7.300h-3Z" transform="translate(-1 3)" fill="#fff" fillRule="evenodd" />
                </svg>
              </div>

              <div className="text-right">
                <p className="text-[1.1cqw] uppercase tracking-widest text-slate-400">Credential ID</p>
                <p className="mt-[0.3cqw] text-[1.45cqw] font-mono font-semibold text-slate-800 border-b border-slate-300 pb-[0.4cqw] break-all">{cert.credentialId}</p>
              </div>
            </div>
            <p className="text-[1cqw] text-slate-400">Verify this certificate at {verifyUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
