/** Display Ethiopian Birr. Zero is the free-course price. */
export function formatEtb(amount: number): string {
  if (amount <= 0) return "Free"
  return `ETB ${new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(amount)}`
}

export function isFreeCourse(price: number): boolean {
  return price <= 0
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}
