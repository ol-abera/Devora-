import { request } from "./http"
import type { ChapaInitRequest, ChapaInitResponse, Payment } from "./types"

/**
 * Chapa flow:
 *  1. POST /payments/chapa/initialize   -> server looks up the price, calls Chapa, returns checkoutUrl
 *  2. browser goes to checkoutUrl (Chapa hosted page)
 *  3. Chapa sends the user back to  {FRONTEND_URL}/payment/return?tx_ref=...
 *  4. POST /payments/:txRef/verify      -> server calls Chapa verify, saves the result, returns the Payment
 *  Access is unlocked only when the returned payment has accessGranted = true.
 */
export const paymentsApi = {
  initializeChapa: (body: ChapaInitRequest) => request<ChapaInitResponse>("/payments/chapa/initialize", { method: "POST", body }),
  verify: (txRef: string) => request<Payment>(`/payments/${encodeURIComponent(txRef)}/verify`, { method: "POST" }),
  get: (txRef: string) => request<Payment>(`/payments/${encodeURIComponent(txRef)}`),
}
