import { request } from "./http"
import type { AuthResponse, Profile, Role, UpdateProfileRequest } from "./types"

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Extract<Role, "student" | "instructor"> // admin accounts are never self-registered
}

export interface GoogleAuthRequest {
  /** Google ID token (JWT) from GIS. Server verifies with Google and creates/links the account. */
  idToken: string
  /** Only used when creating a brand-new account via Google. Ignored if the email already exists. */
  role?: Extract<Role, "student" | "instructor">
}

export const authApi = {
  register: (body: RegisterRequest) => request<AuthResponse>("/auth/register", { method: "POST", body, auth: false }),
  login: (body: { email: string; password: string }) => request<AuthResponse>("/auth/login", { method: "POST", body, auth: false }),
  /** Exchange a Google ID token for a Devora session. Server verifies the token; never trust the client alone. */
  google: (body: GoogleAuthRequest) => request<AuthResponse>("/auth/google", { method: "POST", body, auth: false }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<Profile>("/auth/me"),
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (body: { token: string; password: string }) => request<{ message: string }>("/auth/reset-password", { method: "POST", body, auth: false }),
  updateProfile: (body: UpdateProfileRequest) => request<Profile>("/me", { method: "PATCH", body }),
}
