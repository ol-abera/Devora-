import { request } from "./http"
import type { AuthResponse, Profile, Role, UpdateProfileRequest } from "./types"

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Extract<Role, "student" | "instructor"> // admin accounts are never self-registered
}

export const authApi = {
  register: (body: RegisterRequest) => request<AuthResponse>("/auth/register", { method: "POST", body, auth: false }),
  login: (body: { email: string; password: string }) => request<AuthResponse>("/auth/login", { method: "POST", body, auth: false }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<Profile>("/auth/me"),
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (body: { token: string; password: string }) => request<{ message: string }>("/auth/reset-password", { method: "POST", body, auth: false }),
  updateProfile: (body: UpdateProfileRequest) => request<Profile>("/me", { method: "PATCH", body }),
}
