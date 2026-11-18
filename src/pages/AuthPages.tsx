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
import { AuthLogo } from "@/components/Logo"

/* ───────────────────────── Shared glass layout ───────────────────────── */

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh max-h-dvh relative overflow-hidden">
      {/* Background — coding / learning vibe */}
      <img
        src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden
      />
      {/* Soft overlay so the glass card stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#1e1b4b]/60 to-[#0f172a]/85" />
      {/* Subtle code-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23a78bfa' stroke-width='0.6'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Minimal top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-8 h-14">
        <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <AuthLogo size={36} />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-white/80">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
          <Link to="/verify" className="hover:text-white transition-colors">Verify</Link>
        </nav>
        <div className="w-9" />
      </header>

      {/* Perfectly centered card */}
      <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  )
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />
      <div className="relative px-7 py-6 sm:px-8 sm:py-7">{children}</div>
    </div>
  )
}

/* ───────────────────────── Form fields ───────────────────────── */

function TextField({
  id, label, icon, error, ...rest
}: {
  id: string
  label: string
  icon: ReactNode
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] font-medium text-white/80 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">{icon}</span>
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          {...rest}
          className={`w-full pl-9 ${rest.type === "password" || (rest.type === "text" && id.includes("pass")) ? "pr-10" : "pr-3.5"} py-2.5 rounded-xl border text-sm outline-none transition-all bg-white/10 text-white placeholder:text-white/40 backdrop-blur-sm
            ${error
              ? "border-red-400/60 focus:ring-2 focus:ring-red-400/20"
              : "border-white/25 focus:border-white/50 focus:ring-2 focus:ring-white/15"
            }`}
        />
      </div>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}

function PasswordField({
  id, label, value, onChange, error, autoComplete, placeholder = "Min 8 characters",
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  autoComplete: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextField
        id={id}
        label={label}
        icon={<Lock size={16} />}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        error={error}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-[30px] text-white/50 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

const submitClass =
  "w-full py-2.5 rounded-xl bg-[#60a5fa] text-white font-semibold hover:bg-[#3b82f6] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-500/30 text-sm"

const googleBtnClass =
  "w-full py-2.5 rounded-xl border border-white/30 bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 backdrop-blur-sm text-sm"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
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
            <span className="inline-block w-4 h-4 border-2 border-[#E8D5C4] border-t-[#C27850] rounded-full animate-spin" aria-hidden />
            {t("auth.googleLoading")}
          </>
        ) : (
          <>
            <GoogleIcon />
            {t("auth.continueWithGoogle")}
          </>
        )}
      </button>
      {error && <p role="alert" className="text-sm text-red-200 bg-red-500/20 rounded-lg px-3 py-2">{error}</p>}
    </div>
  )
}

function OrDivider() {
  return (
    <div className="relative my-3.5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/20" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-transparent px-3 text-white/50">or sign up with</span>
      </div>
    </div>
  )
}

/* ───────────────────────── Combined Login / Sign Up page ───────────────────────── */

type Mode = "login" | "register"

export function LoginPage() {
  return <UnifiedAuthPage initialMode="login" />
}

export function RegisterPage() {
  return <UnifiedAuthPage initialMode="register" />
}

function UnifiedAuthPage({ initialMode }: { initialMode: Mode }) {
  const { login, register, user } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>(initialMode)

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Register extra
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "instructor">("student")

  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  if (user) return <Navigate to={target(user.role)} replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrors({})
    setFormError("")
  }

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: FieldErrors = {}
    if (!isEmail(email)) found.email = "Enter a valid email"
    if (!password) found.password = "Enter your password"
    setErrors(found)
    setFormError("")
    if (Object.keys(found).length) return
    setLoading(true)
    try {
      const u = await login(email.trim(), password)
      navigate(target(u.role), { replace: true })
    } catch (err) {
      applyServerError(err, setErrors, setFormError)
      setLoading(false)
    }
  }

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: FieldErrors = {}
    if (name.trim().length < 2) found.name = "Enter your full name"
    if (!isEmail(email)) found.email = "Enter a valid email"
    if (password.length < 8) found.password = "Use at least 8 characters"
    setErrors(found)
    setFormError("")
    if (Object.keys(found).length) return
    setLoading(true)
    try {
      const u = await register({ name: name.trim(), email: email.trim(), password, role })
      toast.success("Account created")
      navigate(target(u.role), { replace: true })
    } catch (err) {
      applyServerError(err, setErrors, setFormError)
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <GlassCard>
        {/* Logo + title */}
        <div className="text-center mb-4">
          <AuthLogo size={64} />
          <h1 className="text-xl font-bold text-white tracking-tight mt-2">
            {mode === "login" ? "Welcome" : "Sign Up"}
          </h1>
          <p className="text-xs text-white/60 mt-1">
            {mode === "login"
              ? "Log in to continue your learning journey"
              : "Create an account and start building skills"}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex p-1 rounded-xl bg-white/10 border border-white/15 mb-4">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-white/25 text-white shadow-sm"
                : "text-white/55 hover:text-white/80"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "register"
                ? "bg-white/25 text-white shadow-sm"
                : "text-white/55 hover:text-white/80"
            }`}
          >
            Sign Up
          </button>
        </div>

        <GoogleAuthButton role={mode === "register" ? role : undefined} disabled={loading} />
        <OrDivider />

        {mode === "login" ? (
          <form onSubmit={submitLogin} noValidate className="space-y-3">
            <TextField
              id="email"
              label="Email Address"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              error={errors.email}
            />
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete="current-password"
              placeholder="Your password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-blue-400/30"
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-blue-300 hover:text-blue-200 hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-200 bg-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <button type="submit" disabled={loading} className={submitClass}>
              {loading ? "Signing in…" : (
                <>
                  Log In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={submitRegister} noValidate className="space-y-3">
            <TextField
              id="name"
              label="Full Name"
              icon={<UserIcon size={16} />}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Abebe Bekele"
              autoComplete="name"
              error={errors.name}
            />
            <TextField
              id="email"
              label="Email Address"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              error={errors.email}
            />
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete="new-password"
            />

            <fieldset>
              <legend className="text-xs font-medium text-white/70 mb-2">I am a…</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={role === "student"}
                  onClick={() => setRole("student")}
                  className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${
                    role === "student"
                      ? "border-white/40 bg-white/20 text-white"
                      : "border-white/20 text-white/60 hover:border-white/35"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  aria-pressed={role === "instructor"}
                  onClick={() => setRole("instructor")}
                  className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${
                    role === "instructor"
                      ? "border-white/40 bg-white/20 text-white"
                      : "border-white/20 text-white/60 hover:border-white/35"
                  }`}
                >
                  Instructor
                </button>
              </div>
            </fieldset>

            {formError && (
              <p role="alert" className="text-sm text-red-200 bg-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <button type="submit" disabled={loading} className={submitClass}>
              {loading ? "Creating…" : (
                <>
                  Sign Up <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {USE_MOCK && (
          <p className="mt-3 text-[11px] text-white/45 bg-white/10 rounded-lg px-3 py-2 text-center">
            Demo: any email + password works
          </p>
        )}
      </GlassCard>

      <p className="mt-4 text-center text-sm text-white/65">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="font-semibold text-blue-300 hover:text-blue-200 hover:underline"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already a member?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="font-semibold text-blue-300 hover:text-blue-200 hover:underline"
            >
              Log In
            </button>
          </>
        )}
      </p>
    </AuthShell>
  )
}

/* ───────────────────────── Forgot / Reset (kept, restyled) ───────────────────────── */

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return setError("Enter a valid email")
    setError("")
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <GlassCard>
        <div className="text-center mb-4">
          <AuthLogo size={64} />
          <h1 className="text-xl font-bold text-white mt-2">Forgot password?</h1>
          <p className="text-xs text-white/60 mt-1">
            We will email you a link to choose a new one
          </p>
        </div>

        {sent ? (
          <div role="status" className="text-center py-4">
            <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={36} />
            <p className="font-medium text-white">Check your email</p>
            <p className="text-sm text-white/60 mt-1">
              If that address has an account, a reset link is on its way.
            </p>
            <Link to="/login" className="inline-block mt-5 text-sm text-blue-300 font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <TextField
              id="email"
              label="Email"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              error={error}
            />
            <button type="submit" disabled={loading} className={submitClass}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <Link to="/login" className="block text-center text-sm text-white/60 hover:text-white">
              Back to sign in
            </Link>
          </form>
        )}
      </GlassCard>
    </AuthShell>
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
    setErrors(found)
    setFormError("")
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
      <AuthShell>
        <GlassCard>
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={36} />
            <h1 className="text-xl font-bold text-white">Password updated</h1>
            <p className="text-sm text-white/60 mt-1">You can sign in with your new password</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-5 text-blue-300 font-medium hover:underline"
            >
              Sign in <ArrowRight size={16} />
            </Link>
          </div>
        </GlassCard>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <GlassCard>
        <div className="text-center mb-4">
          <AuthLogo size={64} />
          <h1 className="text-xl font-bold text-white mt-2">Choose a new password</h1>
          <p className="text-xs text-white/60 mt-1">Use at least 8 characters</p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4">
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
            autoComplete="new-password"
            placeholder="Repeat password"
          />
          {formError && (
            <p role="alert" className="text-sm text-red-200 bg-red-500/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </GlassCard>
    </AuthShell>
  )
}
