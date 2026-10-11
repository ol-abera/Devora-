import { request } from "./http"
import type {
  CourseInput,
  InstructorCourse,
  InstructorRevenueRow,
  InstructorStats,
  InstructorStudent,
  ModuleInput,
} from "./types"

/** Full instructor-owned course payload used by the builder. */
export type InstructorCourseDetail = InstructorCourse & {
  description: string
  language: string
  whatYouLearn: string[]
  prerequisites: string[]
  curriculum: ModuleInput[]
}

export const instructorApi = {
  stats: () => request<InstructorStats>("/instructor/stats"),
  courses: () => request<InstructorCourse[]>("/instructor/courses"),
  getCourse: (courseId: string) => request<InstructorCourseDetail>(`/instructor/courses/${courseId}`),
  createCourse: (body: CourseInput) => request<InstructorCourse>("/instructor/courses", { method: "POST", body }),
  updateCourse: (courseId: string, body: CourseInput) => request<InstructorCourse>(`/instructor/courses/${courseId}`, { method: "PUT", body }),
  /** Submit draft for admin review (status → pending_review). */
  submitCourse: (courseId: string) => request<InstructorCourse>(`/instructor/courses/${courseId}/submit`, { method: "POST" }),
  /** Move published/pending back to draft. */
  unpublishCourse: (courseId: string) => request<InstructorCourse>(`/instructor/courses/${courseId}/unpublish`, { method: "POST" }),
  students: () => request<InstructorStudent[]>("/instructor/students"),
  revenue: () => request<InstructorRevenueRow[]>("/instructor/revenue"),
}
