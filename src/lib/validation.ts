/** Small client-side validators. The server still validates everything again. */
export const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

export function normalizeEthiopianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  const local = digits.startsWith("251") ? digits.slice(3) : digits.replace(/^0/, "")
  return /^9\d{8}$/.test(local) ? `+251${local}` : null
}

export type FieldErrors = Record<string, string>
