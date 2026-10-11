/**
 * Google Identity Services (GIS) helper.
 * Loads the script once, opens the One Tap / popup flow, and returns an ID token.
 * The token is sent to our backend (POST /auth/google); the browser never verifies it.
 *
 * Requires VITE_GOOGLE_CLIENT_ID in env for real mode.
 * In mock mode the caller should not use this — use the mock button path instead.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            isDismissedMoment: () => boolean
            getDismissedReason: () => string
            getNotDisplayedReason: () => string
          }) => void) => void
          cancel: () => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
            error_callback?: (err: { type: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")))
      return
    }
    const s = document.createElement("script")
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Google script"))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export type GoogleSignInResult =
  | { ok: true; idToken: string }
  | { ok: false; reason: "cancelled" | "error"; message: string }

/**
 * Prompt the user for a Google ID token via GIS One Tap / popup.
 * Resolves with the credential JWT, or a cancelled/error result.
 */
export async function requestGoogleIdToken(clientId: string): Promise<GoogleSignInResult> {
  if (!clientId) {
    return { ok: false, reason: "error", message: "Google Client ID is not configured." }
  }
  try {
    await loadGis()
  } catch {
    return { ok: false, reason: "error", message: "Could not load Google sign-in. Check your connection." }
  }

  return new Promise(resolve => {
    let settled = false
    const finish = (result: GoogleSignInResult) => {
      if (settled) return
      settled = true
      try { window.google?.accounts.id.cancel() } catch { /* ignore */ }
      resolve(result)
    }

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: response => {
        if (response?.credential) finish({ ok: true, idToken: response.credential })
        else finish({ ok: false, reason: "error", message: "Google did not return a credential." })
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    window.google!.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const reason = notification.isNotDisplayed()
          ? notification.getNotDisplayedReason()
          : "skipped"
        // User closed or browser blocked One Tap — treat as cancel, not hard error
        if (reason === "suppressed_by_user" || reason === "user_cancel" || reason === "skipped") {
          finish({ ok: false, reason: "cancelled", message: "Google sign-in was cancelled." })
        } else if (!settled) {
          // Fallback: still allow a short window; if nothing comes, cancel
          setTimeout(() => {
            if (!settled) finish({ ok: false, reason: "cancelled", message: "Google sign-in was cancelled." })
          }, 800)
        }
      }
      if (notification.isDismissedMoment()) {
        const r = notification.getDismissedReason()
        if (r === "cancel" || r === "credential_returned") {
          // credential_returned is handled by callback; cancel → cancelled
          if (r === "cancel") finish({ ok: false, reason: "cancelled", message: "Google sign-in was cancelled." })
        }
      }
    })
  })
}

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? ""
}
