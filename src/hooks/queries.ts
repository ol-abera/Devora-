import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi, coursesApi, instructorApi, meApi, paymentsApi } from "@/api"
import type { CourseQuery } from "@/api"
import { useAuth } from "@/context/AuthContext"

/** One place for every query key, so the backend-connected cache is easy to invalidate. */
export const keys = {
  categories: ["categories"] as const,
  courses: (q: CourseQuery) => ["courses", q] as const,
  course: (id: string) => ["course", id] as const,
  reviews: (id: string) => ["reviews", id] as const,
  lesson: (courseId: string, lessonId: string) => ["lesson", courseId, lessonId] as const,
  enrollments: ["me", "enrollments"] as const,
  bookmarks: ["me", "bookmarks"] as const,
  certificates: ["me", "certificates"] as const,
  notifications: ["me", "notifications"] as const,
  payments: ["me", "payments"] as const,
  payment: (txRef: string) => ["payment", txRef] as const,
  challenges: ["playground"] as const,
  instructorStats: ["instructor", "stats"] as const,
}

export const useCategories = () => useQuery({ queryKey: keys.categories, queryFn: coursesApi.categories, staleTime: 5 * 60_000 })
export const useCourses = (q: CourseQuery = {}) => useQuery({ queryKey: keys.courses(q), queryFn: () => coursesApi.list(q), placeholderData: prev => prev })
export const useCourse = (id: string | undefined) => useQuery({ queryKey: keys.course(id ?? ""), queryFn: () => coursesApi.get(id!), enabled: !!id })
export const useReviews = (id: string | undefined) => useQuery({ queryKey: keys.reviews(id ?? ""), queryFn: () => coursesApi.reviews(id!), enabled: !!id })
export const useChallenges = () => useQuery({ queryKey: keys.challenges, queryFn: coursesApi.playgroundChallenges })

export function useLesson(courseId: string | undefined, lessonId: string | undefined) {
  return useQuery({ queryKey: keys.lesson(courseId ?? "", lessonId ?? ""), queryFn: () => coursesApi.lesson(courseId!, lessonId!), enabled: !!courseId && !!lessonId, retry: false })
}

/* ---- signed-in data. Only fetched when there is a user ---- */
function useMe<T>(key: readonly unknown[], fn: () => Promise<T>) {
  const { user } = useAuth()
  return useQuery({ queryKey: [...key, user?.id], queryFn: fn, enabled: !!user })
}
export const useEnrollments = () => useMe(keys.enrollments, meApi.enrollments)
export const useBookmarks = () => useMe(keys.bookmarks, meApi.bookmarks)
export const useCertificates = () => useMe(keys.certificates, meApi.certificates)
export const usePayments = () => useMe(keys.payments, meApi.payments)
export const useNotifications = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: [...keys.notifications, user?.id], queryFn: meApi.notifications, enabled: !!user, refetchInterval: 60_000 })
}
export const usePayment = (txRef: string | undefined) => useQuery({ queryKey: keys.payment(txRef ?? ""), queryFn: () => paymentsApi.get(txRef!), enabled: !!txRef })
export const useInstructorStats = () => useQuery({ queryKey: keys.instructorStats, queryFn: instructorApi.stats })

/* ---- mutations ---- */
export function useInvalidateMe() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ["me"] })
}

export function useToggleBookmark() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ courseId, saved }: { courseId: string; saved: boolean }) => (saved ? meApi.removeBookmark(courseId) : meApi.addBookmark(courseId)),
    onSettled: () => qc.invalidateQueries({ queryKey: [...keys.bookmarks, user?.id] }),
  })
}

export function useEnrollFree() {
  const invalidate = useInvalidateMe()
  return useMutation({ mutationFn: (courseId: string) => coursesApi.enrollFree(courseId), onSuccess: invalidate })
}

export function useCompleteLesson() {
  const invalidate = useInvalidateMe()
  return useMutation({ mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) => coursesApi.completeLesson(courseId, lessonId), onSuccess: invalidate })
}

export function useUpdateProfile() {
  const { setUser } = useAuth()
  return useMutation({ mutationFn: authApi.updateProfile, onSuccess: profile => setUser(profile) })
}
