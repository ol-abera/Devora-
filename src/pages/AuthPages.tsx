import { useState, type ReactNode } from "react"
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Check, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { ApiError, authApi, USE_MOCK } from "@/api"
import { useAuth } from "@/context/AuthContext"
import { FieldError } from "@/components/ui"
import { isEmail, type FieldErrors } from "@/lib/validation"
import { getGoogleClientId, requestGoogleIdToken } from "@/lib/googleAuth"
import { useI18n } from "@/i18n"

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
const googleBtnClass = "w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

function useRedirectTarget() {
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  return (role: string) => from ?? (role === "instructor" ? "/instructor" : "/dashboard")
}

function applyServerError(err: unknown, setErrors: (e: FieldErrors) => void, setFormError: (m: string) => void) {
  if (err instanceof ApiError && err.fields) setErrors(err.fields)
  setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
}

/** Shared Google sign-in / sign-up control with loading, error, and cancellation states. */
function GoogleAuthButton({
  role,
  disabled,
}: {
  role?: "student" | "instructor"
  disabled?: boolean
}) {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const run = async () => {
    setError("")
    setLoading(true)
    try {
      let idToken: string
      const clientId = getGoogleClientId()

      if (USE_MOCK || !clientId) {
        idToken = role === "instructor" ? "mock-google-instructor" : "mock-google-student"
      } else {
        const result = await requestGoogleIdToken(clientId)
        if (!result.ok) {
          if (result.reason === "cancelled") {
            setError(t("auth.googleCancelled"))
          } else {
            setError(result.message || t("auth.googleError"))
          }
          setLoading(false)
          return
        }
        idToken = result.idToken
      }

      const user = await loginWithGoogle(idToken, role)
      toast.success(user.name ? `Welcome, ${user.name}` : "Signed in")
      navigate(target(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.googleError"))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={run} disabled={disabled || loading} className={googleBtnClass} aria-busy={loading}>
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-[#7C3AED] rounded-full animate-spin" aria-hidden />
            {t("auth.googleLoading")}
          </>
        ) : (
          <>
            <GoogleIcon />
            {t("auth.continueWithGoogle")}
          </>
        )}
      </button>
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
    </div>
  )
}

function OrDivider() {
  const { t } = useI18n()
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">{t("auth.orContinueWith")}</span></div>
    </div>
  )
}

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const { t } = useI18n()
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
    <AuthLayout title={t("auth.welcomeBack")} subtitle={t("auth.signInSubtitle")}>
      <GoogleAuthButton disabled={loading} />
      <OrDivider />
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="email" label={t("auth.email")} icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label={t("auth.password")} value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" placeholder="Your password" />
        {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
        <button type="submit" disabled={loading} className={submitClass}>{loading ? t("auth.signingIn") : <>{t("auth.signIn")} <ArrowRight size={16} /></>}</button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-[#7C3AED] hover:underline">{t("auth.forgotPassword")}</Link>
        <span className="text-slate-500">{t("auth.newHere")} <Link to="/register" className="text-[#7C3AED] font-medium hover:underline">{t("auth.createAccount")}</Link></span>
      </div>
      {USE_MOCK && <p className="mt-6 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">{t("auth.demoHint")}</p>}
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const { t } = useI18n()
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
    <AuthLayout title={t("auth.createAccountTitle")} subtitle={t("auth.createAccountSubtitle")}>
      <GoogleAuthButton role={role} disabled={loading} />
      <OrDivider />
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="name" label={t("auth.name")} icon={<UserIcon size={16} />} value={name} onChange={e => setName(e.target.value)} placeholder="Abebe Bekele" autoComplete="name" error={errors.name} />
        <TextField id="email" label={t("auth.email")} icon={<Mail size={16} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label={t("auth.password")} value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
        <fieldset>
          <legend className="text-xs font-medium text-slate-600 mb-2">{t("auth.role")}</legend>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" aria-pressed={role === "student"} onClick={() => setRole("student")}
              className={`p-3 rounded-xl border text-sm font-medium ${role === "student" ? "border-[#7C3AED] bg-[#EDE9FE] text-[#5B21B6]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{t("auth.roleStudent")}</button>
            <button type="button" aria-pressed={role === "instructor"} onClick={() => setRole("instructor")}
              className={`p-3 rounded-xl border text-sm font-medium ${role === "instructor" ? "border-[#7C3AED] bg-[#EDE9FE] text-[#5B21B6]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{t("auth.roleInstructor")}</button>
          </div>
        </fieldset>
        {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
        <button type="submit" disabled={loading} className={submitClass}>{loading ? t("auth.creating") : <>{t("auth.createAccountBtn")} <ArrowRight size={16} /></>}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500 text-center">{t("auth.alreadyHave")} <Link to="/login" className="text-[#7C3AED] font-medium hover:underline">{t("auth.signIn")}</Link></p>
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
    if (password !== confirm) found.confirm = "Passwords do not match"
    setErrors(found); setFormError("")
    if (Object.keys(found).length) return
    if (!token) return setFormError("This reset link is missing a token.")
    setLoading(true)
    try {
      await authApi.resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      applyServerError(err, setErrors, setFormError)
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can sign in with your new password">
        <div className="text-center py-4">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={36} />
          <Link to="/login" className="inline-flex items-center gap-2 mt-4 text-[#7C3AED] font-medium">Sign in <ArrowRight size={16} /></Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 8 characters">
      <form onSubmit={submit} noValidate className="space-y-4">
        <PasswordField id="password" label="New password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
        <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" placeholder="Repeat password" />
        {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
        <button type="submit" disabled={loading} className={submitClass}>{loading ? "Saving…" : "Update password"}</button>
      </form>
    </AuthLayout>
  )
}
