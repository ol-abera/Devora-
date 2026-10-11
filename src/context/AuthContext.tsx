import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { authApi, setUnauthorizedHandler, tokenStore } from "@/api"
import type { Profile } from "@/api"

interface AuthState {
  user: Profile | null
  /** true while we check a saved token with GET /auth/me on first load */
  loading: boolean
  login: (email: string, password: string) => Promise<Profile>
  register: (input: { name: string; email: string; password: string; role: "student" | "instructor" }) => Promise<Profile>
  /** Sign in or sign up with a Google ID token verified by the backend. */
  loginWithGoogle: (idToken: string, role?: "student" | "instructor") => Promise<Profile>
  logout: () => Promise<void>
  setUser: (user: Profile) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(() => !!tokenStore.get())

  const clear = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    qc.removeQueries({ queryKey: ["me"] })
    qc.removeQueries({ queryKey: ["instructor"] })
  }, [qc])

  useEffect(() => {
    setUnauthorizedHandler(clear) // any 401 from the API signs the user out
    return () => setUnauthorizedHandler(null)
  }, [clear])

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    setUser,
    login: async (email, password) => {
      const res = await authApi.login({ email, password })
      tokenStore.set(res.token)
      setUser(res.user)
      return res.user
    },
    register: async input => {
      const res = await authApi.register(input)
      tokenStore.set(res.token)
      setUser(res.user)
      return res.user
    },
    loginWithGoogle: async (idToken, role) => {
      const res = await authApi.google({ idToken, role })
      tokenStore.set(res.token)
      setUser(res.user)
      return res.user
    },
    logout: async () => {
      try { await authApi.logout() } catch { /* token may already be invalid */ }
      clear()
    },
  }), [user, loading, clear])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
