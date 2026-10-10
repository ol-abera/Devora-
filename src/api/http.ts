import { mockRequest } from "./mock/mockServer"

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === "true"

const TOKEN_KEY = "devora_token"

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set: (token: string) => {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}

/**
 * Every failed request throws this. The backend should answer errors as
 *   { "message": "Human readable text", "code": "OPTIONAL_CODE", "fields": { "email": "Already used" } }
 */
export class ApiError extends Error {
  status: number
  code?: string
  fields?: Record<string, string>
  constructor(status: number, message: string, code?: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  query?: Query
  body?: unknown
  auth?: boolean // send the token (default true)
}

let onUnauthorized: (() => void) | null = null
/** AuthProvider registers this so an expired token logs the user out everywhere. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

function buildQuery(query?: Query): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ""
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, auth = true } = options
  const token = auth ? tokenStore.get() : null

  if (USE_MOCK) {
    try {
      return (await mockRequest(method, path, query ?? {}, body, token)) as T
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && auth) onUnauthorized?.()
      throw err
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.", "NETWORK")
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try { data = JSON.parse(text) } catch { /* non-JSON body */ }
  }
  if (!res.ok) {
    const err = (data ?? {}) as { message?: string; code?: string; fields?: Record<string, string> }
    if (res.status === 401 && auth) onUnauthorized?.()
    throw new ApiError(res.status, err.message ?? `Request failed (${res.status})`, err.code, err.fields)
  }
  return data as T
}
