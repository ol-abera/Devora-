import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BookOpen, Star, Users, Zap, Brain, Play, Sparkles, ShieldCheck, Code2, Check, ChevronDown } from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useCategories, useCourses } from "@/hooks/queries"
import { SkeletonCards } from "@/components/ui"
import { whyDevora, faqs } from "@/content"
import { useState } from "react"
import { formatEtb } from "@/lib/money"

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 size={20} />, Brain: <Brain size={20} />, Zap: <Zap size={20} />,
  ShieldCheck: <ShieldCheck size={20} />, Terminal: <Code2 size={20} />,
  Palette: <Sparkles size={20} />, Smartphone: <Play size={20} />, Cloud: <Zap size={20} />,
}

const codeLines = [
  { parts: [{ t: "import", c: "text-purple-400" }, { t: " { Agent } ", c: "" }, { t: "from", c: "text-purple-400" }, { t: " ", c: "" }, { t: `"@devora/ai"`, c: "text-emerald-300" }] },
  { parts: [] },
  { parts: [{ t: "const", c: "text-purple-400" }, { t: " ", c: "" }, { t: "tutor", c: "text-cyan-300" }, { t: " = ", c: "" }, { t: "new", c: "text-purple-400" }, { t: " ", c: "" }, { t: "Agent", c: "text-yellow-300" }, { t: "({", c: "" }] },
  { parts: [{ t: "  model: ", c: "" }, { t: `"devora-7b"`, c: "text-emerald-300" }, { t: ",", c: "" }] },
  { parts: [{ t: "  mode: ", c: "" }, { t: `"socratic"`, c: "text-emerald-300" }, { t: ",", c: "" }] },
  { parts: [{ t: "  hints: ", c: "" }, { t: "true", c: "text-orange-400" }, { t: ",", c: "" }] },
  { parts: [{ t: "})", c: "" }] },
  { parts: [] },
  { parts: [{ t: "const", c: "text-purple-400" }, { t: " ", c: "" }, { t: "solution", c: "text-cyan-300" }, { t: " = ", c: "" }, { t: "await", c: "text-purple-400" }, { t: " tutor.", c: "" }, { t: "explain", c: "text-yellow-300" }, { t: "({", c: "" }] },
  { parts: [{ t: "  concept: ", c: "" }, { t: `"closures"`, c: "text-emerald-300" }, { t: ",", c: "" }] },
  { parts: [{ t: "  level: ", c: "" }, { t: `"intermediate"`, c: "text-emerald-300" }, { t: ",", c: "" }] },
  { parts: [{ t: "})", c: "" }] },
  { parts: [{ t: `// → 3 hints, 1 exercise, 0 spoilers`, c: "text-slate-500" }] },
]

function HeroSection() {
  const { navigate } = useApp()
  const reduce = useReducedMotion()

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7FC] via-white to-[#EDE9FE]" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#7C3AED]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#06B6D4]/6 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDE9FE] text-[#5B21B6] text-xs font-semibold mb-6">
                <Sparkles size={14} /> Courses you buy one by one, in ETB
              </span>
            </motion.div>
            <motion.h1 initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Learn. Practice.<br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Build.</span>
            </motion.h1>
            <motion.p initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-5 text-lg text-slate-600 max-w-[50ch] leading-relaxed">
              Premium courses with interactive sandboxes, AI tutoring, and real-world projects. From bootcamp to FAANG in months, not years.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => navigate("courses")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/20 cursor-pointer">
                Start Learning <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate("courses")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors cursor-pointer">
                Explore Courses
              </button>
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Users size={16} className="text-[#7C3AED]" /> 45k+ engineers</span>
              <span className="flex items-center gap-1.5"><Star size={16} className="text-amber-400 fill-amber-400" /> 4.9 avg rating</span>
              <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> 98% satisfaction</span>
            </motion.div>
          </div>
          <motion.div initial={reduce ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative hidden lg:block">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl shadow-[#7C3AED]/10 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-mono">agent.ts</span>
              </div>
              <div className="text-sm font-mono leading-relaxed overflow-x-auto">
                {codeLines.map((line, i) => (
                  <div key={i} className="min-h-[1.5em]">
                    {line.parts.map((p, j) => (
                      <span key={j} className={p.c}>{p.t}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-lg border border-slate-100">
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check size={12} /> AI Tutor Active</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const { go } = useApp()
  const { data: categories = [], isLoading } = useCategories()
  const total = categories.reduce((n, c) => n + c.courseCount, 0)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Browse by Category</h2>
        <p className="text-slate-500 mb-10">{isLoading ? "Loading categories…" : `Find your track across ${total} courses.`}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} onClick={() => go(`/courses?category=${encodeURIComponent(cat.name)}`)} className="group p-5 rounded-2xl border border-slate-100 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all text-left cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white" style={{ backgroundColor: cat.color }}>
                {iconMap[cat.icon] || <BookOpen size={20} />}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#7C3AED] transition-colors">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{cat.courseCount} courses</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCourses() {
  const { navigate, selectCourse, toggleBookmark, isBookmarked } = useApp()
  const { data, isLoading } = useCourses({ featured: true, limit: 4 })
  const featured = data?.items ?? []
  return (
    <section className="py-20 bg-[#F8F7FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Courses</h2>
            <p className="text-slate-500 mt-1">Hand-picked by our engineering team.</p>
          </div>
          <button onClick={() => navigate("courses")} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#7C3AED] hover:text-[#5B21B6] cursor-pointer">View all <ArrowRight size={14} /></button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading && <div className="sm:col-span-2 lg:col-span-4"><SkeletonCards count={4} /></div>}
          {featured.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-[#7C3AED]/5 hover:-translate-y-1 transition-all group">
              <div className="relative h-36 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center">
                <Code2 size={40} className="text-white/30" />
                <button onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id) }} className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors cursor-pointer">
                  <BookOpen size={14} className={isBookmarked(course.id) ? "fill-current" : ""} />
                </button>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm text-white text-xs font-medium">{course.level}</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#7C3AED] transition-colors">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5">{course.instructor.name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.rating}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {(course.students / 1000).toFixed(1)}k</span>
                  <span className="flex items-center gap-1"><Play size={12} /> {course.duration}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="text-lg font-bold text-slate-900">{formatEtb(course.price)}</span>
                  <button onClick={() => selectCourse(course)} className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-medium hover:bg-[#6D28D9] transition-colors cursor-pointer">Details</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyDevora() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Why Devora?</h2>
          <p className="text-slate-500 mt-2 max-w-[50ch] mx-auto">We built the platform we wished existed when learning to code.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyDevora.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-[#F8F7FC] border border-slate-100 hover:border-[#7C3AED]/20 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white mb-4">
                {iconMap[item.icon] || <Zap size={20} />}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AITutorShowcase() {
  const [showHint, setShowHint] = useState(false)
  return (
    <section className="py-20 bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#a78bfa] text-xs font-semibold mb-4">
              <Brain size={14} /> AI-Powered
            </span>
            <h2 className="text-3xl font-bold mb-4">Your Personal AI Tutor</h2>
            <p className="text-slate-300 leading-relaxed mb-6">Get Socratic hints, code explanations, and personalized learning paths. Our AI never gives you the answer directly; it guides you to discover it yourself.</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Context-aware hints based on your code</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Adaptive difficulty adjustment</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> 24/7 availability, zero judgment</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-bold shrink-0">S</div>
                <div className="bg-slate-700/50 rounded-xl rounded-tl-none px-4 py-3 text-sm">I don&apos;t understand why my useEffect runs twice in development...</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] flex items-center justify-center shrink-0"><Brain size={14} /></div>
                <div className="bg-slate-700/50 rounded-xl rounded-tl-none px-4 py-3 text-sm">
                  <p className="mb-2">Great question! Let me guide you through this rather than just giving the answer.</p>
                  <p className="text-slate-300">Think about this: what happens to your component when React Strict Mode is enabled? Try adding a <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">console.log</code> in your effect&apos;s cleanup function. What do you observe?</p>
                  {showHint && <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">Hint: Strict Mode intentionally double-invokes effects to help you find bugs with missing cleanup functions.</div>}
                  <button onClick={() => setShowHint(!showHint)} className="mt-3 text-xs text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1 cursor-pointer">
                    <ChevronDown size={12} className={showHint ? "rotate-180 transition-transform" : "transition-transform"} /> {showHint ? "Hide hint" : "Reveal hint"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 cursor-pointer">
                {faq.q}
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { navigate } = useApp()
  return (
    <section className="py-20 bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#5B21B6] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to level up your engineering career?</h2>
        <p className="text-white/70 text-lg mb-8 max-w-[50ch] mx-auto">Practice over theory. Pick a course, pay with Chapa, and start building real projects today.</p>
        <button onClick={() => navigate("courses")} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#7C3AED] font-bold text-lg hover:bg-[#EDE9FE] transition-colors shadow-xl cursor-pointer">
          Get Started Free <ArrowRight size={20} />
        </button>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses />
      <WhyDevora />
      <AITutorShowcase />
      <FAQSection />
      <CTASection />
    </main>
  )
}