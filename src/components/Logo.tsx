/** Official Devora logo asset (icon + wordmark). */

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/devora-logo.png"
      alt="Devora"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function Logo({
  size = 44,
  textClass = "text-xl font-bold text-slate-900 tracking-tight",
  showText = false,
}: {
  size?: number
  textClass?: string
  /** When true, shows "DEVORA" text next to the mark. Default false because the asset already includes the wordmark. */
  showText?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      {showText && <span className={textClass}>DEVORA</span>}
    </span>
  )
}

/** Larger centered logo for auth pages. */
export function AuthLogo({ size = 88 }: { size?: number }) {
  return (
    <img
      src="/devora-logo.png"
      alt="Devora"
      className="mx-auto object-contain drop-shadow-sm"
      style={{ width: size, height: size }}
    />
  )
}
