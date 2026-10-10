import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Star, Users, Clock, BookOpen, ChevronDown, Filter, ArrowUpDown } from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useCategories, useCourses } from "@/hooks/queries"
import { EmptyState, ErrorState, SkeletonCards } from "@/components/ui"
import type { CourseLevel } from "@/api"
import { formatEtb, isFreeCourse } from "@/lib/money"

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"] as const
const priceFilters = ["All Prices", "Free", "Paid"] as const
const sorts = [
  { id: "popular", label: "Most Popular" },
  { id: "rating", label: "Highest Rated" },
  { id: "newest", label: "Newest" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
] as const

export function CoursesPage() {
  const { selectCourse, searchQuery, setSearchQuery, toggleBookmark, isBookmarked, isEnrolled } = useApp()
  const [category, setCategory] = useState("All")
  const [level, setLevel] = useState<string>("All Levels")
  const [priceFilter, setPriceFilter] = useState<string>("All Prices")
  const [sort, setSort] = useState<string>("popular")
  const [sortOpen, setSortOpen] = useState(false)

  // Filters are sent to the API (GET /courses?search=&category=&level=&price=&sort=). Search waits 300ms after typing.
  const [debounced, setDebounced] = useState(searchQuery)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const coursesQ = useCourses({
    search: debounced || undefined,
    category: category !== "All" ? category : undefined,
    level: level !== "All Levels" ? (level as CourseLevel) : undefined,
    price: priceFilter === "Free" ? "free" : priceFilter === "Paid" ? "paid" : undefined,
    sort: sort as "popular",
  })
  const categoriesQ = useCategories()
  const filtered = coursesQ.data?.items ?? []
  const allCategories = ["All", ...(categoriesQ.data ?? []).map(c => c.name)]

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#F8F7FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
          <p className="text-slate-500 mt-1" aria-live="polite">{coursesQ.isLoading ? "Loading…" : `${coursesQ.data?.total ?? 0} courses available`}</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Search courses"
            placeholder="Search by title, tag, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-shadow"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  category === cat ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20" : "bg-white text-slate-600 border border-slate-200 hover:border-[#7C3AED]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Level + Price + Sort */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  level === l ? "bg-[#EDE9FE] text-[#5B21B6]" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            {priceFilters.map(p => (
              <button
                key={p}
                onClick={() => setPriceFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  priceFilter === p ? "bg-[#EDE9FE] text-[#5B21B6]" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <button onClick={() => setSortOpen(!sortOpen)} aria-haspopup="listbox" aria-expanded={sortOpen} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-[#7C3AED]/40 cursor-pointer">
              <ArrowUpDown size={12} /> {sorts.find(s => s.id === sort)?.label} <ChevronDown size={12} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-10">
                {sorts.map(s => (
                  <button key={s.id} onClick={() => { setSort(s.id); setSortOpen(false) }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer ${sort === s.id ? "text-[#7C3AED] font-medium" : "text-slate-600"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {coursesQ.isLoading ? (
          <SkeletonCards />
        ) : coursesQ.isError ? (
          <ErrorState message={coursesQ.error.message} onRetry={() => coursesQ.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<BookOpen size={40} />} title="No courses match your filters." hint="Try adjusting your search or clearing filters."
            action={<button onClick={() => { setCategory("All"); setLevel("All Levels"); setPriceFilter("All Prices"); setSearchQuery("") }} className="text-sm font-medium text-[#7C3AED]">Clear filters</button>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-[#7C3AED]/5 hover:-translate-y-1 transition-all group"
              >
                <div className="relative h-40 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center">
                  <div className="text-white/20">
                    <BookOpen size={48} />
                  </div>
                  <button onClick={() => toggleBookmark(course.id)} aria-label={isBookmarked(course.id) ? `Remove ${course.title} from saved` : `Save ${course.title}`} aria-pressed={isBookmarked(course.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors cursor-pointer">
                    <BookOpen size={14} className={isBookmarked(course.id) ? "fill-current" : ""} />
                  </button>
                  {isEnrolled(course.id) && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs font-medium">Enrolled ✓</span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm text-white text-xs">{course.level}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md">{course.category}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#7C3AED] transition-colors">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5">{course.instructor.name} · {course.instructor.title.split(" @ ")[1] ?? course.instructor.title}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.rating} ({course.reviews})</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {(course.students / 1000).toFixed(1)}k</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {course.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-lg font-bold text-slate-900">{formatEtb(course.price)}</span>
                      {!isFreeCourse(course.price) && course.originalPrice > course.price && (
                        <span className="ml-2 text-xs text-slate-400 line-through">{formatEtb(course.originalPrice)}</span>
                      )}
                    </div>
                    <button onClick={() => selectCourse(course)} className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-medium hover:bg-[#6D28D9] transition-colors cursor-pointer">
                      View Curriculum
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}