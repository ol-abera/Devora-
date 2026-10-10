import { request } from "./http"
import type {
  Category, CourseDetail, CourseQuery, CourseSummary, Enrollment, LessonContent, Paginated,
  PlaygroundChallenge, QuizResult, QuizSubmission, Review,
} from "./types"

export const coursesApi = {
  categories: () => request<Category[]>("/categories", { auth: false }),
  list: (query: CourseQuery = {}) => request<Paginated<CourseSummary>>("/courses", { query: { ...query }, auth: false }),
  get: (courseId: string) => request<CourseDetail>(`/courses/${courseId}`, { auth: false }),
  reviews: (courseId: string, page = 1) => request<Paginated<Review>>(`/courses/${courseId}/reviews`, { query: { page }, auth: false }),
  addReview: (courseId: string, body: { rating: number; comment: string }) => request<Review>(`/courses/${courseId}/reviews`, { method: "POST", body }),
  enrollFree: (courseId: string) => request<Enrollment>(`/courses/${courseId}/enroll`, { method: "POST" }),
  lesson: (courseId: string, lessonId: string) => request<LessonContent>(`/courses/${courseId}/lessons/${lessonId}`),
  completeLesson: (courseId: string, lessonId: string) => request<Enrollment>(`/courses/${courseId}/lessons/${lessonId}/complete`, { method: "POST" }),
  submitQuiz: (courseId: string, lessonId: string, body: QuizSubmission) => request<QuizResult>(`/courses/${courseId}/lessons/${lessonId}/quiz`, { method: "POST", body }),
  playgroundChallenges: () => request<PlaygroundChallenge[]>("/playground/challenges"),
}
