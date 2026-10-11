import { request } from "./http"
import type {
  AdminAuditEntry,
  AdminOverview,
  AdminPendingCourse,
  AdminReport,
  AdminTransaction,
  AdminUserRow,
  SupportTicket,
} from "./types"

export const adminApi = {
  overview: () => request<AdminOverview>("/admin/overview"),
  users: (query?: { search?: string; role?: string; status?: string }) =>
    request<AdminUserRow[]>("/admin/users", { query: query as Record<string, string | number | boolean | undefined | null> }),
  setUserStatus: (userId: string, status: "active" | "suspended") =>
    request<AdminUserRow>(`/admin/users/${userId}/status`, { method: "POST", body: { status } }),
  setUserRole: (userId: string, role: "student" | "instructor") =>
    request<AdminUserRow>(`/admin/users/${userId}/role`, { method: "POST", body: { role } }),
  pendingCourses: () => request<AdminPendingCourse[]>("/admin/courses/pending"),
  allCourses: () => request<AdminPendingCourse[]>("/admin/courses"),
  approveCourse: (courseId: string) => request<AdminPendingCourse>(`/admin/courses/${courseId}/approve`, { method: "POST" }),
  rejectCourse: (courseId: string, reason: string) =>
    request<AdminPendingCourse>(`/admin/courses/${courseId}/reject`, { method: "POST", body: { reason } }),
  transactions: () => request<AdminTransaction[]>("/admin/transactions"),
  reports: () => request<AdminReport[]>("/admin/reports"),
  resolveReport: (reportId: string, status: "dismissed" | "actioned") =>
    request<AdminReport>(`/admin/reports/${reportId}`, { method: "POST", body: { status } }),
  tickets: () => request<SupportTicket[]>("/admin/tickets"),
  resolveTicket: (ticketId: string) => request<SupportTicket>(`/admin/tickets/${ticketId}/resolve`, { method: "POST" }),
  audit: () => request<AdminAuditEntry[]>("/admin/audit"),
}
