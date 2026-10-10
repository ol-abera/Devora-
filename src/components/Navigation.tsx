import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bookmark, GraduationCap, Menu, X, ChevronDown, LogOut, User, Receipt, Settings, Bell, LayoutDashboard } from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { useNotifications } from "@/hooks/queries"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Logo } from "@/components/Logo"

const NAV_LINKS = [
  { label: "Home", to: "/", end: true },
  { label: "Courses", to: "/courses", end: false },
  { label: "Playground", to: "/playground", end: false },
]

export function Navbar() {
  const { navigate, user, bookmarks, enrolled, logout, searchQuery, setSearchQuery } = useApp()
  const notifications = useNotifications()
  const unread = (notifications.data ?? []).filter(n => !n.read).length
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the profile menu with Escape or a click outside (keyboard + mouse)
  useEffect(() => {
    if (!profileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false) }
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setProfileOpen(false) }
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onClick)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick) }
  }, [profileOpen])

  const home = user?.role === "instructor" ? { to: "/instructor", label: "Instructor Hub" } : { to: "/dashboard", label: "My Learning" }
  const item = "w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#EDE9FE] text-[#5B21B6]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`

  return (
    <nav aria-label="Main" className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded-lg">Skip to content</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" aria-label="Devora home"><Logo /></Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    aria-label="Search courses"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10"
                    placeholder="Search courses..." autoFocus value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === "Escape") { setSearchQuery(""); setSearchOpen(false) } }}
                    onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                  />
                )}
              </AnimatePresence>
              {!searchOpen && (
                <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
                  <Search size={18} />
                </button>
              )}
            </div>

            {user && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                <button onClick={() => navigate("bookmarks")} className="flex items-center gap-1 hover:text-[#7C3AED]" aria-label={`Saved courses: ${bookmarks.length}`}>
                  <Bookmark size={14} /> {bookmarks.length}
                </button>
                <button onClick={() => navigate("student-dashboard")} className="flex items-center gap-1 hover:text-[#7C3AED]" aria-label={`Enrolled courses: ${enrolled.length}`}>
                  <GraduationCap size={14} /> {enrolled.length}
                </button>
                <button onClick={() => navigate("notifications")} className="relative p-1 hover:text-[#7C3AED]" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
                  <Bell size={16} />
                  {unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
                </button>
              </div>
            )}

            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} aria-haspopup="menu" aria-expanded={profileOpen} aria-label="Account menu" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.avatar}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div role="menu" initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link role="menuitem" to={home.to} onClick={() => setProfileOpen(false)} className={item}><User size={14} /> {home.label}</Link>
                      {user.role === "instructor" && <Link role="menuitem" to="/dashboard" onClick={() => setProfileOpen(false)} className={item}><LayoutDashboard size={14} /> My Learning</Link>}
                      <Link role="menuitem" to="/bookmarks" onClick={() => setProfileOpen(false)} className={item}><Bookmark size={14} /> Saved Courses</Link>
                      <Link role="menuitem" to="/purchases" onClick={() => setProfileOpen(false)} className={item}><Receipt size={14} /> Purchases</Link>
                      <Link role="menuitem" to="/certificates" onClick={() => setProfileOpen(false)} className={item}><GraduationCap size={14} /> Certificates</Link>
                      <Link role="menuitem" to="/settings" onClick={() => setProfileOpen(false)} className={item}><Settings size={14} /> Settings</Link>
                      <button role="menuitem" onClick={() => { setProfileOpen(false); setConfirmLogout(true) }} className={`${item} !text-red-600 hover:!bg-red-50`}><LogOut size={14} /> Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9]">Sign In</Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="md:hidden p-2 rounded-lg hover:bg-slate-50">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-slate-100 bg-white overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(l => <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMobileOpen(false)} className={linkClass}>{l.label}</NavLink>)}
              {user ? (
                <>
                  <Link to={home.to} onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{home.label}</Link>
                  <Link to="/bookmarks" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Saved Courses ({bookmarks.length})</Link>
                  <Link to="/notifications" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Notifications{unread ? ` (${unread})` : ""}</Link>
                  <Link to="/settings" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Settings</Link>
                  <button onClick={() => { setMobileOpen(false); setConfirmLogout(true) }} className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-[#7C3AED] hover:bg-[#EDE9FE]">Sign In / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={confirmLogout} title="Sign out?" message="You will need to sign in again to continue learning." confirmLabel="Sign out"
        onCancel={() => setConfirmLogout(false)} onConfirm={() => { setConfirmLogout(false); void logout() }} />
    </nav>
  )
}

export function Footer() {
  const col = "space-y-2 text-sm"
  const link = "hover:text-white transition-colors"
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4"><Logo textClass="text-lg font-bold text-white" /></div>
            <p className="text-sm text-slate-400 leading-relaxed">Learn. Practice. Build.<br />Courses you can buy one by one, in ETB.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className={col}>
              <li><Link to="/courses" className={link}>All Courses</Link></li>
              <li><Link to="/playground" className={link}>Coding Playground</Link></li>
              <li><Link to="/verify" className={link}>Verify a Certificate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Account</h4>
            <ul className={col}>
              <li><Link to="/login" className={link}>Sign in</Link></li>
              <li><Link to="/register" className={link}>Create account</Link></li>
              <li><Link to="/purchases" className={link}>My purchases</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Devora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
