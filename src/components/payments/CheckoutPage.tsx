import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { paymentsApi, ApiError } from "@/api"
import { useApp } from "@/hooks/useApp"
import { useCourse } from "@/hooks/queries"
import { OrderSummary } from "@/components/payments/OrderSummary"
import { ErrorState, FieldError, PageShell, Spinner } from "@/components/ui"
import { isFreeCourse } from "@/lib/money"
import { isEmail, normalizeEthiopianPhone, type FieldErrors } from "@/lib/validation"

export function CheckoutPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, isEnrolled, continueLearning } = useApp()
  const courseQ = useCourse(courseId)
  const [fullName, setFullName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  if (courseQ.isLoading) return <PageShell narrow><Spinner label="Loading checkout" /></PageShell>
  const course = courseQ.data
  if (courseQ.isError || !course) return <PageShell narrow><ErrorState message={courseQ.error?.message ?? "Course not found."} onRetry={() => courseQ.refetch()} /></PageShell>

  if (isFreeCourse(course.price)) {
    return <PageShell narrow><p className="text-slate-600 text-center">This course is free, so there is nothing to pay.</p><Link to={`/courses/${course.id}`} className="block text-center mt-4 text-[#7C3AED] text-sm font-medium">Back to course</Link></PageShell>
  }
  if (isEnrolled(course.id)) {
    return <PageShell narrow><p className="text-slate-700 font-medium text-center">You already have this course.</p><button onClick={() => continueLearning(course)} className="block mx-auto mt-4 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white font-semibold">Continue Learning</button></PageShell>
  }

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    if (fullName.trim().length < 2) e.fullName = "Enter the name on the payment"
    if (!isEmail(email)) e.email = "Enter a valid email"
    if (!normalizeEthiopianPhone(phone)) e.phone = "Use an Ethiopian mobile number, like 0911 234 567"
    return e
  }

  const pay = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError("")
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return
    setLoading(true)
    try {
      // The server finds the price itself from courseId. We never send an amount.
      const { checkoutUrl } = await paymentsApi.initializeChapa({ courseId: course.id, fullName: fullName.trim(), email: email.trim(), phone: normalizeEthiopianPhone(phone)! })
      const url = new URL(checkoutUrl, window.location.origin)
      if (url.origin === window.location.origin) navigate(url.pathname + url.search) // mock checkout page
      else window.location.assign(url.toString()) // real Chapa hosted checkout
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields)
      setFormError(err instanceof Error ? err.message : "Could not start Chapa checkout")
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto grid md:grid-cols-5 gap-6">
        <form onSubmit={pay} noValidate className="md:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
            <p className="text-sm text-slate-500 mt-1">Pay with Chapa. The course unlocks only after the server verifies the payment.</p>
          </div>
          <Field id="fullName" label="Full name" value={fullName} onChange={setFullName} placeholder="Abebe Bekele" error={errors.fullName} autoComplete="name" />
          <Field id="email" label="Email" value={email} onChange={setEmail} placeholder="abebe@email.com" type="email" error={errors.email} autoComplete="email" />
          <Field id="phone" label="Ethiopian mobile" value={phone} onChange={setPhone} placeholder="0911 234 567" type="tel" error={errors.phone} autoComplete="tel" />
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] disabled:opacity-60">{loading ? "Opening Chapa…" : "Continue to Chapa"}</button>
          <Link to={`/courses/${course.id}`} className="block text-center text-sm text-slate-500 hover:text-slate-700">Back to course</Link>
        </form>
        <div className="md:col-span-2">
          <OrderSummary title={course.title} subtitle={`${course.level} · ${course.duration}`} amountEtb={course.price} originalEtb={course.originalPrice} />
        </div>
      </div>
    </PageShell>
  )
}

function Field({ id, label, value, onChange, placeholder, type = "text", error, autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; error?: string; autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600">{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/10 ${error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-[#7C3AED]"}`} />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}
