import { Navigate, Outlet, useLocation } from "react-router-dom"
import type { Role } from "@/api"
import { useAuth } from "@/context/AuthContext"
import { Spinner, PageShell } from "@/components/ui"

/** Send signed-out visitors to /login, then back to where they were going. The API still enforces access. */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageShell><Spinner label="Checking your session" /></PageShell>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (roles && !roles.includes(user.role)) {
    return (
      <PageShell narrow>
        <div className="text-center bg-white rounded-2xl border border-slate-100 p-10">
          <h1 className="text-xl font-bold text-slate-900">You do not have access to this page</h1>
          <p className="text-sm text-slate-500 mt-2">This area is for {roles.join(" or ")} accounts.</p>
        </div>
      </PageShell>
    )
  }
  return <Outlet />
}
