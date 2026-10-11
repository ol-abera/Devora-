import { Link, useLocation } from "react-router-dom"
import { Brain, Sparkles } from "lucide-react"

/** Global bottom FAB matching the product AI Tutor pill. Hidden on the tutor page itself. */
export function FloatingAITutor() {
  const { pathname } = useLocation()
  if (pathname === "/tutor" || pathname.startsWith("/tutor/")) return null
  // Lesson page already has contextual AITutorChat
  if (/\/learn(\/|$)/.test(pathname) || pathname.includes("/lesson")) return null

  return (
    <Link
      to="/tutor"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-[#7C3AED] text-white font-semibold text-sm shadow-lg shadow-violet-600/40 hover:bg-[#6D28D9] hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C3AED]"
      aria-label="Open AI Tutor"
    >
      <Brain size={18} className="shrink-0" />
      <span>AI Tutor</span>
      <Sparkles size={14} className="text-violet-200 shrink-0" />
    </Link>
  )
}
