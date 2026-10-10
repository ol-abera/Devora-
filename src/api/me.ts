import { request } from "./http"
import type { AppNotification, Certificate, CertificateVerification, CourseSummary, Enrollment, Payment, TutorMessage } from "./types"

export const meApi = {
  enrollments: () => request<Enrollment[]>("/me/enrollments"),
  bookmarks: () => request<CourseSummary[]>("/me/bookmarks"),
  addBookmark: (courseId: string) => request<void>(`/me/bookmarks/${courseId}`, { method: "PUT" }),
  removeBookmark: (courseId: string) => request<void>(`/me/bookmarks/${courseId}`, { method: "DELETE" }),
  certificates: () => request<Certificate[]>("/me/certificates"),
  verifyCertificate: (credentialId: string) => request<CertificateVerification>(`/certificates/verify/${encodeURIComponent(credentialId)}`, { auth: false }),
  notifications: () => request<AppNotification[]>("/me/notifications"),
  markNotificationRead: (id: string) => request<void>(`/me/notifications/${id}/read`, { method: "POST" }),
  markAllNotificationsRead: () => request<void>("/me/notifications/read-all", { method: "POST" }),
  payments: () => request<Payment[]>("/me/payments"),
  tutorChat: (body: { courseId: string; lessonId: string; messages: TutorMessage[] }) => request<{ reply: string }>("/ai-tutor/chat", { method: "POST", body }),
}
