import { motion } from "framer-motion"
import { Bookmark, Star, Users, Clock, BookOpen, ArrowRight } from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useBookmarks } from "@/hooks/queries"
import { formatEtb, isFreeCourse } from "@/lib/money"
import { ErrorState, SkeletonCards } from "@/components/ui"

export default function BookmarksPage() {
  const { toggleBookmark, selectCourse, navigate, isEnrolled } = useApp()
  const bookmarksQ = useBookmarks()
  const saved = bookmarksQ.data ?? []

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#F8F7FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark size={28} className="text-[#7C3AED]" /> Saved Courses
          </h1>
          <p className="text-slate-500 mt-1">
            {bookmarksQ.isLoading ? "Loading…" : saved.length === 0 ? "No bookmarked courses yet" : `${saved.length} course${saved.length === 1 ? "" : "s"} saved for later`}
          </p>
        </div>

        {bookmarksQ.isLoading ? (
          <SkeletonCards count={3} />
        ) : bookmarksQ.isError ? (
          <ErrorState message={bookmarksQ.error.message} onRetry={() => bookmarksQ.refetch()} />
        ) : saved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Browse courses and tap the bookmark icon to save them here for later.
            </p>
            <button
              onClick={() => navigate("courses")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white font-medium hover:bg-[#6D28D9] transition-colors cursor-pointer"
            >
              Explore Courses <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-shadow group"
              >
                <div className="h-36 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] relative">
                  <button onClick={() => selectCourse(course)} aria-label={`Open ${course.title}`} className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={32} className="text-white/30" />
                  </div>
                  <button
                    onClick={() => toggleBookmark(course.id)}
                    aria-label={`Remove ${course.title} from saved courses`}
                    className="absolute z-10 top-3 right-3 p-2 rounded-full bg-white/90 text-[#7C3AED] hover:bg-white cursor-pointer shadow-sm"
                    title="Remove bookmark"
                  >
                    <Bookmark size={16} className="fill-current" />
                  </button>
                  {isEnrolled(course.id) && (
                    <span className="absolute top-3 left-3 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      Enrolled
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-[#7C3AED] font-medium mb-1">{course.category}</p>
                  <h3
                    className="font-semibold text-slate-900 line-clamp-2 cursor-pointer group-hover:text-[#7C3AED] transition-colors"
                    onClick={() => selectCourse(course)}
                  >
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.rating}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {course.students.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-slate-900">{formatEtb(course.price)}</span>
                      {!isFreeCourse(course.price) && course.originalPrice > course.price && (
                        <span className="text-xs text-slate-400 line-through">{formatEtb(course.originalPrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => selectCourse(course)}
                      className="text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer"
                    >
                      View →
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
