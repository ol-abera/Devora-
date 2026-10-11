import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Toaster } from "sonner"
import { Navbar, Footer } from "@/components/Navigation"
import { RequireAuth } from "@/components/RouteGuards"
import { LandingPage } from "@/components/LandingPage"
import { CoursesPage } from "@/components/CoursesPage"
import { CourseDetailPage } from "@/components/CourseDetailPage"
import CourseLearningPage from "@/components/CourseLearningPage"
import StudentDashboard from "@/components/StudentDashboard"
import BookmarksPage from "@/components/BookmarksPage"
import CertificatesPage from "@/components/CertificatesPage"
import CodingPlayground from "@/components/CodingPlayground"
import InstructorDashboard from "@/components/InstructorDashboard"
import CourseBuilder from "@/components/instructor/CourseBuilder"
import AdminDashboard from "@/components/AdminDashboard"
import { CheckoutPage } from "@/components/payments/CheckoutPage"
import { PaymentReturnPage } from "@/components/payments/PaymentReturnPage"
import { PurchaseHistoryPage } from "@/components/payments/PurchaseHistoryPage"
import { ReceiptPage } from "@/components/payments/ReceiptPage"
import { MockChapaPage } from "@/components/payments/MockChapaPage"
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "@/pages/AuthPages"
import SettingsPage from "@/pages/SettingsPage"
import NotificationsPage from "@/pages/NotificationsPage"
import VerifyCertificatePage from "@/pages/VerifyCertificatePage"
import AITutorPage from "@/pages/AITutorPage"
import { PageShell, LinkButton } from "@/components/ui"
import { useSyncLocaleFromProfile } from "@/i18n"
import { useAuth } from "@/context/AuthContext"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function LocaleSync() {
  const { user } = useAuth()
  useSyncLocaleFromProfile(user?.locale)
  return null
}

function Layout() {
  return (
    <>
      <LocaleSync />
      <ScrollToTop />
      <Navbar />
      <div id="main"><Outlet /></div>
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <PageShell narrow>
      <div className="text-center py-16">
        <p className="text-5xl font-bold text-slate-300">404</p>
        <p className="mt-3 text-slate-600">We could not find that page.</p>
        <div className="mt-6"><LinkButton to="/">Go home</LinkButton></div>
      </div>
    </PageShell>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          {/* public */}
          <Route index element={<LandingPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route path="learn/:courseId/:lessonId?" element={<CourseLearningPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify" element={<VerifyCertificatePage />} />
          <Route path="verify/:credentialId" element={<VerifyCertificatePage />} />
          <Route path="mock-chapa/:txRef" element={<MockChapaPage />} />

          {/* signed in */}
          <Route element={<RequireAuth />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="playground" element={<CodingPlayground />} />
            <Route path="tutor" element={<AITutorPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="purchases" element={<PurchaseHistoryPage />} />
            <Route path="purchases/:txRef" element={<ReceiptPage />} />
            <Route path="checkout/:courseId" element={<CheckoutPage />} />
            <Route path="payment/return" element={<PaymentReturnPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* instructor */}
          <Route element={<RequireAuth roles={["instructor", "admin"]} />}>
            <Route path="instructor" element={<InstructorDashboard />} />
            <Route path="instructor/courses/new" element={<CourseBuilder />} />
            <Route path="instructor/courses/:courseId/edit" element={<CourseBuilder />} />
          </Route>

          <Route element={<RequireAuth roles={["admin"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
