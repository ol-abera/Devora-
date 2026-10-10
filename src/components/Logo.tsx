import { useId } from "react"

/** The Devora mark. Swap the SVG body here to change the logo everywhere (navbar, footer, certificates). */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Devora logo">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M21 16h12c9.4 0 16 6.2 16 16s-6.6 16-16 16H21V16Zm8 7.2v17.6h3.6c5 0 8.2-3.4 8.2-8.8s-3.2-8.8-8.2-8.8H29Z" fill="#fff" fillRule="evenodd" />
      <circle cx="47" cy="17" r="4" fill="#06B6D4" />
    </svg>
  )
}

export function Logo({ size = 32, textClass = "text-xl font-bold text-slate-900 tracking-tight" }: { size?: number; textClass?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className={textClass}>DEVORA</span>
    </span>
  )
}
