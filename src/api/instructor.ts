import { request } from "./http"
import type { InstructorStats } from "./types"

export const instructorApi = {
  stats: () => request<InstructorStats>("/instructor/stats"),
}
