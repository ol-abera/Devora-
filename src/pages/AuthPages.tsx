import { useState, type ReactNode } from "react"
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Check, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { ApiError, authApi } from "@/api"
import { useAuth } from "@/context/AuthContext"
import { FieldError } from "@/components/ui"
import { isEmail, type FieldErrors } from "@/lib/validation"

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-[#F8F7FC] via-white to-[#EDE9FE] px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-[#7C3AED]/10 border border-slate-100 my-8">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#5B21B6] p-10 text-white">
          <div>
            <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><span className="font-bold">D</span></div><span className="text-xl font-bold">DEVORA</span></div>
            <h2 className="text-3xl font-bold leading-tight mb-4">Learn. Practice.<br />Build.</h2>
            <p className="text-white/70 leading-relaxed">Hands-on courses you can buy one by one, in ETB.</p>
          </div>
          <div className="space-y-3">
            {["AI tutor inside every lesson", "Interactive coding playground", "Certificates you can verify", "Pay with Chapa"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80"><Check size={14} className="text-emerald-300" /> {f}</div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">{title}</h1><p className="text-sm text-slate-500 mt-1">{subtitle}</p></div>
          {children}
        </div>
      </div>
    </div>
  )
}

function TextField({ id, label, icon, error, ...rest }: { id: string; label: string; icon: ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest}
          className={`w-full pl-10 ${rest.type === "password" || rest.type === "text" && id.includes("pass") ? "pr-12" : "pr-4"} py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/10 ${error ? "border-red-300" : "border-slate-200 focus:border-[#7C3AED]"}`} />
      </div>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}

function PasswordField({ id, label, value, onChange, error, autoComplete, placeholder = "Min 8 characters" }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextField id={id} label={label} icon={<Lock size={16} />} type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} error={error} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </div>
  )
}

const submitClass = "w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#7C3AED]/20"

function useRedirectTarget() {
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  return (role: string) => from ?? (role === "instructor" ? "/instructor" : "/dashboard")
}

function applyServerError(err: unknown, setErrors: (e: FieldErrors) => void, setFormError: (m: string) => void) {
  if (err instanceof ApiError && err.fields) setErrors(err.fields)
  setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
}

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to={target(user.role)} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: FieldErrors = {}
    if (!isEmail(email)) found.email = "Enter a valid email"
    if (!password) found.password = "Enter your password"
    setErrors(found); setFormError("")
    if (Object.keys(found).length) return
    setLoading(true)
    try { const u = await login(email.trim(), password); navigate(target(u.role), { replace: true }) }
    catch (err) { applyServerError(err, setErrors, setFormError); setLoading(false) }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue learning">
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="email" label="Email" icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" placeholder="Your password" />
        {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
        <button type="submit" disabled={loading} className={submitClass}>{loading ? "Signing in…" : <>Sign In <ArrowRight size={16} /></>}</button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-[#7C3AED] hover:underline">Forgot password?</Link>
        <span className="text-slate-500">New here? <Link to="/register" className="text-[#7C3AED] font-medium hover:underline">Create an account</Link></span>
      </div>
      {import.meta.env.VITE_USE_MOCK === "true" && <p className="mt-6 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">Demo mode: student@devora.et or instructor@devora.et, password <span className="font-mono">password123</span>.</p>}
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "instructor">("student")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to={target(user.role)} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: FieldErrors = {}
    if (name.trim().length < 2) found.name = "Enter your full name"
    if (!isEmail(email)) found.email = "Enter a valid email"
    if (password.length < 8) found.password = "Use at least 8 characters"
    setErrors(found); setFormError("")
    if (Object.keys(found).length) return
    setLoading(true)
    try { const u = await register({ name: name.trim(), email: email.trim(), password, role }); toast.success("Account created"); navigate(target(u.role), { replace: true }) }
    catch (err) { applyServerError(err, setErrors, setFormError); setLoading(false) }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your engineering journey today">
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="name" label="Full name" icon={<UserIcon size={16} />} value={name} onChange={e => setName(e.target.value)} placeholder="Abebe Bekele" autoComplete="name" error={errors.name} />
        <TextField id="email" label="Email" icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
        <fieldset>
          <legend className="text-xs font-medium text-slate-600 mb-2">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["student", "instructor"] as const).map(r => (
              <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)}
                className={`p-3 rounded-xl border text-sm font-medium capitalize ${role === r ? "border-[#7C3AED] bg-[#EDE9FE] text-[#5B21B6]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{r}</button>
            ))}
          </div>
        </fieldset>
        {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
        <button type="submit" disabled={loading} className={submitClass}>{loading ? "Creating account…" : <>Create Account <ArrowRight size={16} /></>}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500 text-center">Already have an account? <Link to="/login" className="text-[#7C3AED] font-medium hover:underline">Sign in</Link></p>
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return setError("Enter a valid email")
    setError(""); setLoading(true)
    try { await authApi.forgotPassword(email.trim()); setSent(true) }
    catch (err) { setError(err instanceof Error ? err.message : "Could not send the link") }
    finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We will email you a link to choose a new one">
      {sent ? (
        <div role="status" className="text-center py-6">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={36} />
          <p className="font-medium text-slate-900">Check your email</p>
          <p className="text-sm text-slate-500 mt-1">If that address has an account, a reset link is on its way.</p>
          <Link to="/login" className="inline-block mt-5 text-sm text-[#7C3AED] font-medium">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <TextField id="email" label="Email" icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" error={error} />
          <button type="submit" disabled={loading} className={submitClass}>{loading ? "Sending…" : "Send reset link"}</button>
          <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-slate-700">Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: FieldErrors = {}
    if (password.length < 8) found.password = "Use at least 8 characters"
    if (confirm !== password) found.confirm = "Passwords do not match"
    setErrors(found); setFormError("")
    if (Object.keys(found).length) return
    setLoading(true)
    try { await authApi.resetPassword({ token, password }); setDone(true) }
    catch (err) { applyServerError(err, setErrors, setFormError) }
    finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 8 characters">
      {!token ? (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">This reset link is missing its token. <Link to="/forgot-password" className="underline">Request a new link</Link>.</p>
      ) : done ? (
        <div role="status" className="text-center py-6">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={36} />
          <p className="font-medium text-slate-900">Password updated</p>
          <Link to="/login" className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <PasswordField id="password" label="New password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
          <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" placeholder="Repeat the password" />
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          <button type="submit" disabled={loading} className={submitClass}>{loading ? "Saving…" : "Update password"}</button>
        </form>
      )}
    </AuthLayout>
  )
}
