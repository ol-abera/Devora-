import { useCallback } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useBookmarks, useEnrollFree, useEnrollments, useToggleBookmark } from "@/hooks/queries"

/** Screen names the UI uses with navigate("..."). Each maps to a real URL. */
const VIEW_PATHS = {
  landing: "/",
  courses: "/courses",
  catalog: "/courses",
  "student-dashboard": "/dashboard",
  "instructor-dashboard": "/instructor",
  playground: "/playground",
  tutor: "/tutor",
  admin: "/admin",
  certificates: "/certificates",
  bookmarks: "/bookmarks",
  purchases: "/purchases",
  settings: "/settings",
  notifications: "/notifications",
  auth: "/login",
  register: "/register",
  verify: "/verify",
} as const

export type View = keyof typeof VIEW_PATHS

/**
 * Small facade used by most screens: who is signed in, saved/enrolled courses, and navigation helpers.
 * All data comes from the API through React Query; nothing is stored in the browser except the login token.
 */
export function useApp() {
  const { user, logout: authLogout } = useAuth()
  const routerNavigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const enrollmentsQ = useEnrollments()
  const bookmarksQ = useBookmarks()
  const toggleMutation = useToggleBookmark()
  const enrollMutation = useEnrollFree()

  const enrollments = enrollmentsQ.data ?? []
  const bookmarkIds = (bookmarksQ.data ?? []).map(c => c.id)

  const navigate = useCallback((view: View) => routerNavigate(VIEW_PATHS[view]), [routerNavigate])

  const requireLogin = useCallback(() => {
    toast.info("Please sign in first")
    routerNavigate("/login", { state: { from: location.pathname + location.search } })
  }, [routerNavigate, location])

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId)

  return {
    user,
    pathname: location.pathname,
    navigate,
    go: routerNavigate,
    logout: async () => { await authLogout(); routerNavigate("/") },

    searchQuery: params.get("q") ?? "",
    setSearchQuery: (q: string) => {
      if (location.pathname !== "/courses") routerNavigate(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses")
      else setParams(prev => { const n = new URLSearchParams(prev); if (q) n.set("q", q); else n.delete("q"); return n }, { replace: true })
    },

    selectCourse: (course: { id: string }) => routerNavigate(`/courses/${course.id}`),
    startLesson: (courseId: string, lessonId?: string) => routerNavigate(lessonId ? `/learn/${courseId}/${lessonId}` : `/learn/${courseId}`),
    continueLearning: (course: { id: string }) => routerNavigate(isEnrolled(course.id) ? `/learn/${course.id}` : `/courses/${course.id}`),
    beginCheckout: (course: { id: string }) => {
      if (!user) return requireLogin()
      routerNavigate(`/checkout/${course.id}`)
    },
    enrollFree: (course: { id: string }) => {
      if (!user) return requireLogin()
      enrollMutation.mutate(course.id, {
        onSuccess: () => { toast.success("You're enrolled!"); routerNavigate(`/learn/${course.id}`) },
        onError: err => toast.error(err.message),
      })
    },
    enrollingFree: enrollMutation.isPending,

    enrollments,
    enrolled: enrollments.map(e => e.courseId),
    isEnrolled,
    getCourseProgress: (courseId: string) => enrollments.find(e => e.courseId === courseId)?.progress ?? 0,

    bookmarks: bookmarkIds,
    isBookmarked: (courseId: string) => bookmarkIds.includes(courseId),
    toggleBookmark: (courseId: string) => {
      if (!user) return requireLogin()
      toggleMutation.mutate({ courseId, saved: bookmarkIds.includes(courseId) }, { onError: err => toast.error(err.message) })
    },
  }
}
