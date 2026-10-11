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

function HeroSection() {
  const { navigate } = useApp()
  const reduce = useReducedMotion()

  return (
    <section className="theme-light relative min-h-[92dvh] flex items-center pt-20 overflow-hidden">
      {/* Soft mesh background */}
      <div className="absolute inset-0 bg-[#0B1020]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(ellipse_at_80%_10%,rgba(6,182,212,0.25),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.2),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-violet-200 text-xs font-semibold mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="text-cyan-300" /> Built for Ethiopian students · Pay in ETB
              </span>
            </motion.div>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Master tech skills
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                that open careers
              </span>
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mt-5 text-lg text-slate-300 max-w-[48ch] leading-relaxed"
            >
              Hands-on courses in English, with Amharic and Afaan Oromo support. Practice in a safe coding playground, get help from AI Tutor, and earn verifiable certificates.
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => navigate("courses")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors shadow-lg shadow-violet-900/40 cursor-pointer"
              >
                Browse courses <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("playground")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm"
              >
                <Code2 size={18} /> Try the playground
              </button>
            </motion.div>
            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400"
            >
              {["Chapa payments in ETB", "AI Tutor in every lesson", "Verified certificates"].map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400 shrink-0" /> {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-950/50 aspect-[4/3] bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Students collaborating on coding projects"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-lg">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Learn by building</p>
                    <p className="text-slate-300 text-xs">Projects, quizzes, and AI guidance</p>
                  </div>
                </div>
                
              </div>
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
    <section className="theme-light py-20 bg-[#0F172A] text-white">
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

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses />
      <WhyDevora />
      <AITutorShowcase />
      <FAQSection />
    </main>
  )
}