import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight, BookOpen, Star, Users, Zap, Brain, Play, Sparkles,
  ShieldCheck, Code2, Check, ChevronDown, Quote, Heart, Award, Rocket,
} from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useCategories, useCourses } from "@/hooks/queries"
import { SkeletonCards } from "@/components/ui"
import { whyDevora, faqs, successStories, testimonials, plans } from "@/content"
import { useState } from "react"
import { formatEtb } from "@/lib/money"
import { Link } from "react-router-dom"

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 size={20} />, Brain: <Brain size={20} />, Zap: <Zap size={20} />,
  ShieldCheck: <ShieldCheck size={20} />, Terminal: <Code2 size={20} />,
  Palette: <Sparkles size={20} />, Smartphone: <Play size={20} />, Cloud: <Zap size={20} />,
  Award: <Award size={20} />, GitPullRequest: <Rocket size={20} />,
}

/* ───────────────────────── HERO ───────────────────────── */

function HeroSection() {
  const { navigate } = useApp()
  const reduce = useReducedMotion()

  return (
    <section className="relative min-h-[92dvh] flex items-center pt-20 overflow-hidden bg-[#FDF8F3]">
      {/* Soft warm mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(194,120,80,0.18),transparent_55%),radial-gradient(ellipse_at_85%_15%,rgba(124,58,237,0.12),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(245,200,160,0.35),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a16207' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E8D5C4] text-[#9A5B2E] text-xs font-semibold mb-6 shadow-sm backdrop-blur-sm">
                <Heart size={13} className="text-[#C27850]" fill="currentColor" /> Built for Ethiopian learners · Pay in ETB
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#2C1810] leading-[1.12]"
            >
              Learn skills that
              <br />
              <span className="bg-gradient-to-r from-[#C27850] via-[#A16207] to-[#7C3AED] bg-clip-text text-transparent">
                feel like home
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mt-5 text-lg text-[#5C4033] max-w-[48ch] leading-relaxed"
            >
              Hands-on courses in English, Amharic & Afaan Oromo. Practice in a safe playground, get gentle guidance from AI Tutor, and earn certificates you can proudly share.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => navigate("courses")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C27850] text-white font-semibold hover:bg-[#A8643F] transition-all shadow-lg shadow-[#C27850]/30 cursor-pointer"
              >
                Explore programs <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("playground")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 border border-[#E8D5C4] text-[#5C4033] font-semibold hover:bg-white hover:shadow-md transition-all cursor-pointer"
              >
                <Code2 size={18} /> Try the playground
              </button>
            </motion.div>

            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#7A5C4A]"
            >
              {["Chapa payments in ETB", "AI Tutor in every lesson", "Verified certificates"].map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#C27850] shrink-0" /> {item}
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
            <div className="relative rounded-[2rem] overflow-hidden border border-white/60 shadow-2xl shadow-[#C27850]/15 aspect-[4/3] bg-[#F5EDE4]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Students collaborating on coding projects"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/70 via-[#2C1810]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#C27850] flex items-center justify-center shadow-lg">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Learn by building</p>
                    <p className="text-white/70 text-xs">Projects, quizzes & warm AI guidance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-xl px-4 py-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["H", "Y", "S"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C27850] to-[#7C3AED] text-white text-xs font-bold flex items-center justify-center border-2 border-white">{l}</div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2C1810]">2,400+ learners</p>
                <p className="text-[11px] text-[#7A5C4A]">growing every week</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── TOP PROGRAMS ───────────────────────── */

function TopPrograms() {
  const { navigate, selectCourse, toggleBookmark, isBookmarked } = useApp()
  const { data, isLoading } = useCourses({ featured: true, limit: 4 })
  const featured = data?.items ?? []

  return (
    <section className="py-24 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C27850]">Programs</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-2">Explore Our Top Programs</h2>
            <p className="text-[#7A5C4A] mt-2 max-w-md">Carefully crafted paths that take you from first line of code to job-ready projects.</p>
          </div>
          <button
            onClick={() => navigate("courses")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C27850] hover:text-[#A8643F] cursor-pointer"
          >
            View all courses <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading && <div className="sm:col-span-2 lg:col-span-4"><SkeletonCards count={4} /></div>}
          {featured.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-3xl border border-[#F0E6DC] overflow-hidden hover:shadow-xl hover:shadow-[#C27850]/10 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative h-40 bg-gradient-to-br from-[#C27850] to-[#7C3AED] flex items-center justify-center">
                <Code2 size={44} className="text-white/25" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id) }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors cursor-pointer"
                >
                  <BookOpen size={14} className={isBookmarked(course.id) ? "fill-current" : ""} />
                </button>
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/25 backdrop-blur-sm text-white text-xs font-medium">
                  {course.level}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-[#2C1810] text-sm leading-snug line-clamp-2 group-hover:text-[#C27850] transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-[#7A5C4A] mt-1.5">{course.instructor.name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#9A7B6A]">
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.rating}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {(course.students / 1000).toFixed(1)}k</span>
                  <span className="flex items-center gap-1"><Play size={12} /> {course.duration}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F5EDE4]">
                  <span className="text-lg font-bold text-[#2C1810]">{formatEtb(course.price)}</span>
                  <button
                    onClick={() => selectCourse(course)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C27850] text-white text-xs font-medium hover:bg-[#A8643F] transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── SUCCESS STORIES ───────────────────────── */

function SuccessStories() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C27850]">Real journeys</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-2">Success Stories</h2>
          <p className="text-[#7A5C4A] mt-3 max-w-lg mx-auto">
            Learners across Ethiopia who turned curiosity into careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {successStories.map((story, i) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-[#FDF8F3] rounded-3xl p-7 border border-[#F0E6DC] hover:shadow-lg hover:shadow-[#C27850]/8 transition-shadow"
            >
              <Quote size={28} className="text-[#E8D5C4] mb-4" />
              <p className="text-[#5C4033] leading-relaxed text-[15px]">“{story.quote}”</p>

              <div className="mt-6 flex items-center gap-3">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                />
                <div>
                  <p className="font-semibold text-[#2C1810] text-sm">{story.name}</p>
                  <p className="text-xs text-[#9A7B6A]">{story.role}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E8D5C4]/60 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#C27850]">{story.metric}</span>
                <span className="text-xs text-[#9A7B6A]">{story.metricLabel}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── WHAT STUDENTS SAY ───────────────────────── */

function WhatStudentsSay() {
  return (
    <section className="py-24 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C27850]">Community</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-2">What Students Say to Us</h2>
          <p className="text-[#7A5C4A] mt-3 max-w-lg mx-auto">
            Honest words from people who learn with us every day.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-6 border border-[#F0E6DC] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[#5C4033] leading-relaxed">“{t.text}”</p>
              <div className="mt-4 pt-3 border-t border-[#F5EDE4]">
                <p className="text-sm font-semibold text-[#2C1810]">{t.name}</p>
                <p className="text-xs text-[#9A7B6A]">{t.course}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── COMPARE PLANS ───────────────────────── */

function ComparePlans() {
  const { navigate } = useApp()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C27850]">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mt-2">Compare Plans</h2>
          <p className="text-[#7A5C4A] mt-3 max-w-lg mx-auto">
            Start free. Upgrade when you’re ready. No hidden fees — pay in ETB.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 border transition-all ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[#C27850] to-[#A8643F] text-white border-transparent shadow-xl shadow-[#C27850]/25 scale-[1.03]"
                  : "bg-[#FDF8F3] border-[#F0E6DC] text-[#2C1810]"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#2C1810] text-white text-[11px] font-semibold tracking-wide">
                  Most popular
                </span>
              )}

              <h3 className={`text-xl font-bold ${plan.highlighted ? "text-white" : "text-[#2C1810]"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.highlighted ? "text-white/80" : "text-[#7A5C4A]"}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">
                  {plan.price === "0" ? "Free" : `ETB ${plan.price}`}
                </span>
                {plan.price !== "0" && (
                  <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-[#9A7B6A]"}`}>
                    /{plan.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-white" : "text-[#C27850]"}`}
                    />
                    <span className={plan.highlighted ? "text-white/95" : "text-[#5C4033]"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.id === "free" ? "register" : "courses")}
                className={`mt-8 w-full py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                  plan.highlighted
                    ? "bg-white text-[#C27850] hover:bg-[#FDF8F3]"
                    : "bg-[#C27850] text-white hover:bg-[#A8643F]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── WHY DEVORA (kept, restyled) ───────────────────────── */

function WhyDevora() {
  return (
    <section className="py-20 bg-[#FDF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2C1810]">Why learners choose Devora</h2>
          <p className="text-[#7A5C4A] mt-2 max-w-[50ch] mx-auto">
            We built the platform we wished existed when learning to code.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyDevora.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-[#F0E6DC] hover:border-[#C27850]/30 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C27850] to-[#7C3AED] flex items-center justify-center text-white mb-4">
                {iconMap[item.icon] || <Zap size={20} />}
              </div>
              <h3 className="font-semibold text-[#2C1810] mb-2">{item.title}</h3>
              <p className="text-sm text-[#7A5C4A] leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── FAQ ───────────────────────── */

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C27850]">Support</span>
          <h2 className="text-3xl font-bold text-[#2C1810] mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-colors ${
                open === i ? "border-[#C27850]/40 bg-[#FDF8F3]" : "border-[#F0E6DC] bg-white"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#2C1810] hover:bg-[#FDF8F3]/60 cursor-pointer"
              >
                {faq.q}
                <ChevronDown
                  size={16}
                  className={`text-[#C27850] transition-transform shrink-0 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-[#7A5C4A] leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── CATEGORIES (kept, restyled) ───────────────────────── */

function CategoriesSection() {
  const { go } = useApp()
  const { data: categories = [], isLoading } = useCategories()
  const total = categories.reduce((n, c) => n + c.courseCount, 0)

  return (
    <section className="py-16 bg-white border-y border-[#F0E6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#2C1810] mb-1">Browse by Category</h2>
        <p className="text-[#7A5C4A] mb-8 text-sm">
          {isLoading ? "Loading categories…" : `Find your track across ${total} courses.`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => go(`/courses?category=${encodeURIComponent(cat.name)}`)}
              className="group p-4 rounded-2xl border border-[#F0E6DC] hover:border-[#C27850]/40 hover:shadow-md hover:shadow-[#C27850]/5 transition-all text-left cursor-pointer bg-[#FDF8F3]/50"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 text-white"
                style={{ backgroundColor: cat.color }}
              >
                {iconMap[cat.icon] || <BookOpen size={18} />}
              </div>
              <h3 className="text-sm font-semibold text-[#2C1810] group-hover:text-[#C27850] transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-[#9A7B6A] mt-0.5">{cat.courseCount} courses</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── PAGE ───────────────────────── */

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <TopPrograms />
      <SuccessStories />
      <WhatStudentsSay />
      <ComparePlans />
      <WhyDevora />
      <FAQSection />
    </main>
  )
}
